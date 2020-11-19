const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);
const { ApiClient } = require("../lib/ApiClient");

// ACCOUNT ENDPOINTS
describe('ACCOUNT TESTS', () => {
    const api = ApiClient.instance;
  
    test('createIndividualAccount', async () => {
      const expectedResponse = {"id":"z3hn6UoSYWtK4KUA"}
      fetch.mockResponse(JSON.stringify(expectedResponse));
      const current = await api.createIndividualAccount("John", "Doe", "john@example.com", "MyP@ssw0rd", "manager");
  
      expect(current).toEqual(expectedResponse);
      expect(current).toMatchSnapshot();
    });

    test('createServiceAccount', async () => {
        const expectedResponse = {"id":"z3hn6UoSYWtK4LFD"}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.createServiceAccount("serviceAccountNode", "MyP@ssw0rd");
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

      test('resendVerificationCode', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.resendVerificationCode("john@example.com");
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

      test('verifyAccount', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
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
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.listAllAccounts();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

      test('deleteIndividualAccount', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.deleteIndividualAccount("john@example.com");
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

      test('deleteServiceAccount', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.deleteServiceAccount("serviceAccountNode");
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

      test('deleteCurrentAccount', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.deleteCurrentAccount();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });
});
