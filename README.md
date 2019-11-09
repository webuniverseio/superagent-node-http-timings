```
yarn add superagent-node-http-timings
npm i --save superagent-node-http-timings
```

# HTTP Timings
This plugin for superagent gives you an easy interface to get http timings information. Primary use case is to be able to monitor and optimize network requests in node in a similar way to how you do it in browser with network inspector.

# Example
```js
const request = require('superagent');
const logNetworkTime = require('superagent-node-http-timings');
request
  .get(`https://google.com`)
  .use(logNetworkTime((err, result) => {
    if (err) {
      return console.error(err);
    }
    console.log(result);
  }))
  .then(x => x);
```
Sample results (timings are in milliseconds)1:
```json
{
  "status": 301,
  "timings": {
    "socketAssigned": 4.0982,
    "dnsLookup": 38.9614,
    "tcpConnection": 42.1931,
    "tlsHandshake": 105.221,
    "firstByte": 67.0892,
    "contentTransfer": 0.6482,
    "total": 258.2111
  },
  "url": "https://google.com"
}
```
 ## Results interpretation
  - `socketAssigned` - time since call was initiated until socket got assigned to request
  - `dnsLookup` - time since socketAssigned until dns lookup end, will be `undefined` when request was sent to IP (no domain)
  - `tcpConnection` - time since dnsLookup (or socketAssigned if IP was used) until connection was established
  - `tlsHandshake` - time since tcpConnection until until ssl negotiation end, will be `undefined` when request was sent via http
  - `firstByte` - time since tlsHandshake (or tcpConnection for http request) until first byte
  - `contentTransfer` - time since firstByte until response end  

# Inspired by 
 - https://blog.risingstack.com/measuring-http-timings-node-js/
 - https://github.com/RisingStack/example-http-timings
 
# Contributing to this repo
PRs are welcome! :)