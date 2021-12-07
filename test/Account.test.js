const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');
jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

// ACCOUNT ENDPOINTS
describe('ACCOUNT TESTS', () => {
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
  fetchMock.post(opts.host + '/v1/login/refresh-token/', loginRefreshTokenResponse);

  test('createIndividualAccount', async () => {
    const expectedResponse = { "id": "z3hn6UoSYWtK4KUA" }
    fetchMock.postOnce(opts.host + '/v1/accounts/individual/', expectedResponse);
    const current = await api.createIndividualAccount("John", "Doe", "john@example.com", "MyP@ssw0rd", "manager");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('createServiceAccount', async () => {
    const expectedResponse = { "id": "z3hn6UoSYWtK4LFD" }
    fetchMock.postOnce(opts.host + '/v1/accounts/service/', expectedResponse);
    const current = await api.createServiceAccount("serviceAccountNode", "MyP@ssw0rd");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('resendVerificationCode', async () => {
    const expectedResponse = {}
    fetchMock.putOnce(opts.host + '/v1/accounts/resend-verification-code/', expectedResponse);
    const current = await api.resendVerificationCode("john@example.com");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('verifyAccount', async () => {
    const expectedResponse = {}
    let queryParams = { 'code': 'abcd1234', 'email': 'john@example.com' }
    let path = '/v1/accounts/verify/' + utils.convertToQueryString(queryParams);
    fetchMock.getOnce(opts.host + path, expectedResponse);
    const current = await api.verifyAccount("abcd1234", "john@example.com");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('listAllAccounts', async () => {
    const expectedResponse = {
      "individual_accounts": [
        {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com",
          "role": "manager",
          "verified": true
        }
      ],
      "service_accounts": [
        {
          "name": "myapp-server",
          "role": "backend"
        }
      ]
    }
    fetchMock.getOnce(opts.host + '/v1/organizations/current/accounts/', expectedResponse);
    const current = await api.listAllAccounts();
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('deleteIndividualAccount', async () => {
    const expectedResponse = {}
    fetchMock.deleteOnce(opts.host + '/v1/accounts/individual/', expectedResponse);
    const current = await api.deleteIndividualAccount("john@example.com");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('deleteServiceAccount', async () => {
    const expectedResponse = {}
    fetchMock.deleteOnce(opts.host + '/v1/accounts/service/', expectedResponse);
    const current = await api.deleteServiceAccount("serviceAccountNode");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('deleteCurrentAccount', async () => {
    const expectedResponse = {}
    fetchMock.deleteOnce(opts.host + '/v1/accounts/', expectedResponse);
    const current = await api.deleteCurrentAccount();
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });
});
