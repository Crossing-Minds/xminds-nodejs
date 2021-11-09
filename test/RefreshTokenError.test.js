const { ApiClient } = require("../lib/ApiClient");
const fetchMock = require('fetch-mock-jest');

// LOGIN REFRESH TOKEN 
describe('LOGIN REFRESH TOKEN ERROR TEST', () => {
  const opts = {
    host: "http://localhost"
  }
  const api = new ApiClient(opts);

  // Error response for first call of listAllDatabases service
  const responseErr = new Response('{"error_code": "22", "error_name": "JwtTokenExpired", "message": "The JWT token has expired", "error_data": { "name": "JWT_TOKEN_EXPIRED" }}', { status: 401 });
  // Error response for the Login Refresh Token 
  const refreshTokenExpiredError = new Response('{"error_code": "28", "error_name": "RefreshTokenExpired", "message": "The refresh token has expired", "error_data": { "name": "REFRESH_TOKEN_EXPIRED" }}', { status: 401 });

  test('Should fail because Refresh Token has expired', async () => {
    // Mock the fetch() get method for first call with an error response when called
    fetchMock.get(opts.host + '/v1/databases/?amt=64&page=1', responseErr);
    // Mock the fetch() post method to return a correct response when called
    fetchMock.post(opts.host + '/v1/login/refresh-token/', refreshTokenExpiredError);

    const current = await api.listAllDatabases(64, 1)
      .catch(err => {
        expect(err.message).toEqual('The refresh token has expired');
      });
    expect(current).toMatchSnapshot();
  });

});
