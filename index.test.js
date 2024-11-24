const request = require('superagent');
const logNetworkTime = require('./index');
const https = require('https')
jest.setTimeout(10000);

const httpAgent = new https.Agent({keepAlive: true});
describe('GIVEN plugin was used WHEN response arrives THEN callback should get timings information', () => {
  test('timings', () => {
    const assertions = [
      'verified that timings were populated'
    ];
    expect.assertions(assertions.length);
    return expect(makeRequest()).resolves.toMatchSnapshot();
  });

  test('works with reusable keepAlive agent, we simply call the same request again with the same agent', () => {
    const assertions = [
      'verified that timings were populated'
    ];
    expect.assertions(assertions.length);
    return expect(makeRequest()).resolves.toMatchSnapshot();
  })

  function makeRequest() {
    return new Promise((res, rej) => {
      request
        .get(`https://google.com`)
        .use(logNetworkTime((err, result) => {
          if (err) {
            return rej(err)
          }
          res(valuesToTypes(result))
        }))
        .agent(httpAgent)
        .then(x => x)
        .catch(rej)
    })
  }
});

function valuesToTypes(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const type = typeof value;
    acc[key] = type === 'object' ? valuesToTypes(value) : type;
    return acc;
  }, {})
}
