require('jest-fetch-mock');
const fetchMock = require('fetch-mock');
jest.setMock('node-fetch', fetchMock);
const { ApiClient } = require("../lib/ApiClient");
const querystring = require('querystring');

// ACCOUNT ENDPOINTS
describe('ACCOUNT TESTS', () => {
  const host = "http://localhost";
  const api = new ApiClient(host);
  const headers = {
    'User-Agent': 'CrossingMinds/v1',
    'Content-type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer '
  }

  test('createIndividualAccount', async () => {
    const expectedResponse = { "id": "z3hn6UoSYWtK4KUA" }
    fetchMock.postOnce(host + '/accounts/individual/', expectedResponse, { headers: headers });
    const current = await api.createIndividualAccount("John", "Doe", "john@example.com", "MyP@ssw0rd", "manager");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('createServiceAccount', async () => {
    const expectedResponse = { "id": "z3hn6UoSYWtK4LFD" }
    fetchMock.postOnce(host + '/accounts/service/', expectedResponse, { headers: headers });
    const current = await api.createServiceAccount("serviceAccountNode", "MyP@ssw0rd");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('resendVerificationCode', async () => {
    const expectedResponse = {}
    fetchMock.putOnce(host + '/accounts/resend-verification-code/', expectedResponse, { headers: headers });
    const current = await api.resendVerificationCode("john@example.com");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('verifyAccount', async () => {
    const expectedResponse = {}
    let queryParams = {'code': 'abcd1234', 'email': 'john@example.com'}
    let path = '/accounts/verify/?' + querystring.stringify(queryParams);
    fetchMock.getOnce(host + path, expectedResponse, { headers: headers });
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
    fetchMock.getOnce(host + '/organizations/current/accounts/', expectedResponse, { headers: headers });
    const current = await api.listAllAccounts();
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('deleteIndividualAccount', async () => {
    const expectedResponse = {}
    fetchMock.deleteOnce(host + '/accounts/individual/', expectedResponse, { headers: headers });
    const current = await api.deleteIndividualAccount("john@example.com");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('deleteServiceAccount', async () => {
    const expectedResponse = {}
    fetchMock.deleteOnce(host + '/accounts/service/', expectedResponse, { headers: headers });
    const current = await api.deleteServiceAccount("serviceAccountNode");
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });

  test('deleteCurrentAccount', async () => {
    const expectedResponse = {}
    fetchMock.deleteOnce(host + '/accounts/', expectedResponse, { headers: headers });
    const current = await api.deleteCurrentAccount();
    expect(current).toEqual(expectedResponse);
    expect(current).toMatchSnapshot();
  });
});
