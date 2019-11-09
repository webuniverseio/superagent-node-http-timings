const request = require('superagent');
const logNetworkTime = require('./index');
jest.setTimeout(10000);
describe('GIVEN plugin was used WHEN response arrives THEN callback should get timings information', () => {
  test('timings', () => {
    const assertions = [
      'verified that timings were populated'
    ];
    expect.assertions(assertions.length);
    return expect(new Promise((res, rej) => {
      request
      .get(`https://google.com`)
      .use(logNetworkTime((err, result) => {
        if (err) {
          return rej(err);
        }
        res(valuesToTypes(result));
      }))
      .then(x => x)
      .catch(rej);
    })).resolves.toMatchSnapshot();
  });
});

function valuesToTypes(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const type = typeof value;
    acc[key] = type === 'object' ? valuesToTypes(value) : type;
    return acc;
  }, {})
}