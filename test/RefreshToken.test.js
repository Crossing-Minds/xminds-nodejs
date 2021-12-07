const { ApiClient } = require("../lib/ApiClient");
jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

// LOGIN REFRESH TOKEN 
describe('LOGIN REFRESH TOKEN TEST', () => {
  const opts = {
    host: "http://localhost"
  }
  const api = new ApiClient(opts);
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

  // Error response for first call of listAllDatabases service
  const responseErr = {
    json: function(){
      return {"error_code": "22", "error_name": "JwtTokenExpired", "message": "The JWT token has expired", 
              "error_data": { "name": "JWT_TOKEN_EXPIRED"}}
    },
    status: 401
  };
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
    fetchMock.getOnce(opts.host + '/v1/databases/?amt=64&page=1', responseErr);
    // Mock the fetch() post method to return a correct response when called
    fetchMock.post(opts.host + '/v1/login/refresh-token/', loginRefreshTokenResponse);
    // Mock the fetch() get method for second call with a correct response when called
    fetchMock.getOnce(opts.host + '/v1/databases/?amt=64&page=1', expectedResponseOK, { overwriteRoutes: true });

    const current = await api.listAllDatabases(64, 1);
    // Two calls must be made
    expect((fetchMock._calls.length)).toEqual(2);
    // The second call should be to loginRefreshToken endpoint
    expect((fetchMock._calls[0].url)).toEqual(opts.host + '/v1/login/refresh-token/');
    // The third call should be to listAllDatabases endpoint
    expect((fetchMock._calls[1].url)).toEqual(opts.host + '/v1/databases/?amt=64&page=1');
    // The final response must be as expected
    expect(current).toEqual(expectedResponseOK);
    expect(current).toMatchSnapshot();
  });

});
