require('jest-fetch-mock');
const { ApiClient } = require("../lib/ApiClient");
const fetchMock = require('fetch-mock');
jest.setMock('isomorphic-fetch', fetchMock);

// LOGIN REFRESH TOKEN 
describe('LOGIN REFRESH TOKEN ERROR TEST', () => {

  const host = "http://localhost";
  const api = new ApiClient(host);
  // Headers 
  const headers = {
    'User-Agent': 'CrossingMinds/v1',
    'Content-type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer '
  }
  // Error response for first call of listAllDatabases service
  const responseErr = new Response('{"error_code": "22", "error_name": "JwtTokenExpired", "message": "The JWT token has expired", "error_data": { "name": "JWT_TOKEN_EXPIRED" }}', { status: 401 });
  // Error response for the Login Refresh Token 
  const refreshTokenExpiredError = new Response('{"error_code": "28", "error_name": "RefreshTokenExpired", "message": "The refresh token has expired", "error_data": { "name": "REFRESH_TOKEN_EXPIRED" }}', { status: 401 });

  test('Should fail because Refresh Token has expired', async () => {
    // Mock the fetch() get method for first call with an error response when called
    fetchMock.getOnce(host + '/databases/?amt=64&page=1', responseErr, { headers: headers });
    // Mock the fetch() post method to return a correct response when called
    fetchMock.post(host + '/login/refresh-token/', refreshTokenExpiredError, { headers: headers });

    const current = await api.listAllDatabases(64, 1).catch(err => {
      expect(err.message).toEqual('The refresh token has expired');
    });
    // Two calls must be made
    expect((fetchMock._calls.length)).toEqual(2);
    // The first call should be to listAllDatabases endpoint
    expect((fetchMock._calls[0].url)).toEqual(host + '/databases/');
    // The second call should be to loginRefreshToken endpoint
    expect((fetchMock._calls[1].url)).toEqual(host + '/login/refresh-token/');
    expect(current).toMatchSnapshot();
  });

});
