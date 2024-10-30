module.exports = function logRequestDetailsMiddleware(callback) {
  return function logRequestDetails(agent) {
    agent.on('request', ({req}) => {
      const url = agent.url;
      const eventTimes = {
        startAt: getTimeNotASubjectOfClockDrift(),
        socketAssigned: undefined,
        dnsLookupAt: undefined,
        tcpConnectionAt: undefined,
        tlsHandshakeAt: undefined,
        firstByteAt: undefined,
        endAt: undefined
      };
      req.on('socket', (socket) => {
        eventTimes.socketAssigned = getTimeNotASubjectOfClockDrift();
        socket.on('lookup', () => {
          eventTimes.dnsLookupAt = getTimeNotASubjectOfClockDrift();
        });
        socket.on('connect', () => {
          eventTimes.tcpConnectionAt = getTimeNotASubjectOfClockDrift();
        });
        socket.on('secureConnect', () => {
          eventTimes.tlsHandshakeAt = getTimeNotASubjectOfClockDrift();
        });
        socket.on('timeout', () => {
          const err = new Error(`ETIMEDOUT for req.url: ${req.url}`);
          err.code = `ETIMEDOUT`;
          callback(err);
        });
      });
      req.on('response', (res) => {
        res.once('readable', () => {
          eventTimes.firstByteAt = getTimeNotASubjectOfClockDrift();
        });
        (function consumeStreamSoEndEventAlwaysFire() {
          res.on('data', () => {});
        }());
        res.on('end', () => {
          eventTimes.endAt = getTimeNotASubjectOfClockDrift();

          callback(null, {
            url,
            status: res.statusCode,
            timings: getTimings(eventTimes)
          });
        });
      });
    });
  }
};

function getTimeNotASubjectOfClockDrift() {
  return process.hrtime();
}

function getTimings (eventTimes) {
  return {
    socketAssigned: getHrTimeDurationInMs(eventTimes.startAt, eventTimes.socketAssigned),
    // There is no DNS lookup with IP address
    dnsLookup: eventTimes.dnsLookupAt !== undefined ?
               getHrTimeDurationInMs(eventTimes.socketAssigned, eventTimes.dnsLookupAt) : undefined,
    tcpConnection: eventTimes.tcpConnectionAt !== undefined ?
                getHrTimeDurationInMs(eventTimes.dnsLookupAt || eventTimes.socketAssigned, eventTimes.tcpConnectionAt) : undefined,
    // There is no TLS handshake without https
    tlsHandshake: eventTimes.tlsHandshakeAt !== undefined ?
                  (getHrTimeDurationInMs(eventTimes.tcpConnectionAt, eventTimes.tlsHandshakeAt)) : undefined,
    firstByte: getHrTimeDurationInMs((eventTimes.tlsHandshakeAt || eventTimes.tcpConnectionAt || eventTimes.socketAssigned), eventTimes.firstByteAt),
    contentTransfer: getHrTimeDurationInMs(eventTimes.firstByteAt, eventTimes.endAt),
    total: getHrTimeDurationInMs(eventTimes.startAt, eventTimes.endAt)
  }
}

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e6;

function getHrTimeDurationInMs (startTime, endTime) {
  const secondDiff = endTime[0] - startTime[0];
  const nanoSecondDiff = endTime[1] - startTime[1];
  const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff;

  return diffInNanoSecond / MS_PER_NS
}