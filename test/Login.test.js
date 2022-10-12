const { ApiClient } = require("../lib/ApiClient");
jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

// LOGIN ENDPOINTS
describe('LOGIN TESTS', () => {
  const opts = {
    host: "http://localhost"
  }
  const api = new ApiClient(opts);

  test('loginIndividual', async () => {
    const expectedResponse = {
      token: "eyJ0eX...",
      refresh_token: "mW+k/K...",
      database: {
        id: "wSSZQbPxKvBrk_n2B_m6ZA",
        name: "Example DB name",
        description: "Example DB longer description",
        item_id_type: "uuid",
        user_id_type: "uint32"
      }
    }
    fetchMock.postOnce(opts.host + '/v1/login/individual/', expectedResponse);
    const current = await api.loginIndividual('john@example.com', 'MyP@ssw0rd', 'wSSZQbPxKvBrk_n2B_m6ZA', 'test');
    expect(current).toEqual(expectedResponse);
    let jwtToken = api.getJwtToken();
    expect(jwtToken).toEqual("eyJ0eX...");
    expect(current).toMatchSnapshot();
  });

  test('loginService', async () => {
    const expectedResponse = {
      token: "eyJ0eX...",
      refresh_token: "mW+k/K...",
      database: {
        id: "wSSZQbPxKvBrk_n2B_m6ZA",
        name: "Example DB name",
        description: "Example DB longer description",
        item_id_type: "uuid",
        user_id_type: "uint32"
      }
    }
    fetchMock.postOnce(opts.host + '/v1/login/service/', expectedResponse, { overwriteRoutes: false });
    const current = await api.loginService('serviceAccountNode', 'MyP@ssw0rd', 'wSSZQbPxKvBrk_n2B_m6ZA', 'test');
    expect(current).toEqual(expectedResponse);
    let jwtToken = api.getJwtToken();
    expect(jwtToken).toEqual("eyJ0eX...");
    expect(current).toMatchSnapshot();
  });

  test('loginRoot', async () => {
    const expectedResponse = {
      token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbmNyeXB..."
    }
    fetchMock.postOnce(opts.host + '/v1/login/individual/', expectedResponse, { overwriteRoutes: false });
    const current = await api.loginRoot("john@example.com", "MyP@ssw0rd");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('loginRefreshToken', async () => {
    const expectedResponse = {
      token: "eyJ0eXXYZ...",
      refresh_token: "mW+k/K...",
      database: {
        id: "wSSZQbPxKvBrk_n2B_m6ZA",
        name: "Example DB name",
        description: "Example DB longer description",
        item_id_type: "uuid",
        user_id_type: "uint32"
      }
    }
    fetchMock.postOnce(opts.host + '/v1/login/refresh-token/', expectedResponse, { overwriteRoutes: false });
    const current = await api.loginRefreshToken();
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

});