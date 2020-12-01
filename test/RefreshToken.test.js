require('jest-fetch-mock');
const { ApiClient } = require("../lib/ApiClient");
const fetchMock = require('fetch-mock');
jest.setMock('node-fetch', fetchMock);

// LOGIN REFRESH TOKEN 
describe('LOGIN REFRESH TOKEN TEST', () => {

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
  // Correct response of loginRefreshToken service (after first call with error)
  const loginRefreshTokenResponse = {
    "token": "eyJ0eX...",
    "refresh_token": "mW+k/K...",
    "database": {
      "id": "wSSZQbPxKvBrk_n2B_m6ZA",
      "name": "Example DB name",
      "description": "Example DB longer description",
      "item_id_type": "uuid",
      "user_id_type": "uint32"
    }
  }
  // Correct response for second call of listAllDatabases service
  const expectedResponseOK = {
    "has_next": false,
    "next_page": 2,
    "databases": [
      {
        "id": "wSSZQbPxKvBrk_n2B_m6ZA",
        "name": "Example DB name",
        "description": "Example DB longer description",
        "item_id_type": "uuid",
        "user_id_type": "uint32",
      }
    ]
  }

  test('Should generate a new JWTToken using the cached Refresh Token and execute again the initial method', async () => {
    // Mock the fetch() get method for first call with an error response when called
    fetchMock.getOnce(host + '/databases/', responseErr, { headers: headers });
    // Mock the fetch() post method to return a correct response when called
    fetchMock.post(host + '/login/refresh-token/', loginRefreshTokenResponse, { headers: headers });
    // Mock the fetch() get method for second call with a correct response when called
    fetchMock.getOnce(host + '/databases/', expectedResponseOK, { overwriteRoutes: false });

    const current = await api.listAllDatabases();
    // Three calls must be made
    expect((fetchMock._calls.length)).toEqual(3);
    // The first call should be to listAllDatabases endpoint
    expect((fetchMock._calls[0].url)).toEqual(host + '/databases/');
    // The second call should be to loginRefreshToken endpoint
    expect((fetchMock._calls[1].url)).toEqual(host + '/login/refresh-token/');
    // The third call should be to listAllDatabases endpoint
    expect((fetchMock._calls[2].url)).toEqual(host + '/databases/');
    // The final response must be as expected
    expect(current).toEqual(expectedResponseOK);
    expect(current).toMatchSnapshot();
  });

});
