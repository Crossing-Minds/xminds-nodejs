const { ApiClient } = require("../lib/ApiClient");
require('./mockFetch')();


// LOGIN REFRESH TOKEN 
describe('LOGIN REFRESH TOKEN ERROR TEST', () => {
  const opts = {
    host: "http://localhost"
  }
  const api = new ApiClient(opts);

  // Error response for first call of listAllDatabases service
  const responseErr = {"error_code": "22", "error_name": "JwtTokenExpired", "message": "The JWT token has expired", "error_data": { "name": "JWT_TOKEN_EXPIRED" }};
  // Error response for the Login Refresh Token 
  const refreshTokenExpiredError = {"error_code": "28", "error_name": "RefreshTokenExpired", "message": "The refresh token has expired", "error_data": { "name": "REFRESH_TOKEN_EXPIRED" }};

  test('Should fail because Refresh Token has expired', async () => {
    // Mock the globalThis.globalThis.fetch() get method for first call with an error response when called
    globalThis.globalThis.fetch.get(opts.host + '/v1/databases/?amt=64&page=1', { body: responseErr, status: 401});
    // Mock the globalThis.globalThis.fetch() post method to return a correct response when called
    globalThis.globalThis.fetch.post(opts.host + '/v1/login/refresh-token/', { body: refreshTokenExpiredError, status: 401});

    const current = await api.listAllDatabases(64, 1)
      .catch(err => {
        expect(err.message).toEqual('The refresh token has expired');
      });
    expect(current).toMatchSnapshot();
  });

});
