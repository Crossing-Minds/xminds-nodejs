require('jest-fetch-mock');
const fetchMock = require('fetch-mock');
jest.setMock('node-fetch', fetchMock);
const { ApiClient } = require("../lib/ApiClient");

// LOGIN ENDPOINTS
describe('LOGIN TESTS', () => {
  const host = "http://localhost";
  const api = new ApiClient(host);
  const headers = {
    'User-Agent': 'CrossingMinds/v1',
    'Content-type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer '
  }

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
    fetchMock.postOnce(host + '/login/individual/', expectedResponse, { headers: headers });
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
    fetchMock.postOnce(host + '/login/service/', expectedResponse, { overwriteRoutes: false });
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
    fetchMock.postOnce(host + '/login/root/', expectedResponse, { overwriteRoutes: false });
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
    fetchMock.postOnce(host + '/login/refresh-token/', expectedResponse, { overwriteRoutes: false });
    const current = await api.loginRefreshToken();
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

});