const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);
const { ApiClient } = require("../lib/ApiClient");
const { parseError, AuthError, XMindError } = require('../lib/XMindError');
const { when } = require('jest-when');

// LOGIN ENDPOINTS
describe('LOGIN TESTS', () => {
    const api = ApiClient.instance;

    test('loginIndividual', async () => {
      const expectedResponse = {
        "token": "eyJ0eX...",
        "refresh_token": "mW+k/K...",
        "database" : {
          "id": "wSSZQbPxKvBrk_n2B_m6ZA",
          "name": "Example DB name",
          "description": "Example DB longer description",
          "item_id_type": "uuid",
          "user_id_type": "uint32"
        }
    }
      fetch.mockResponse(JSON.stringify(expectedResponse));
      const current = await api.loginIndividual('jc_2203@hotmail.com', 'MyP@ssw0rd', '3_kpGNbqBbE_xPtKTg8fwA', 'test');
  
      expect(current).toEqual(expectedResponse);
      expect(current).toMatchSnapshot();
    });

    test('loginService', async () => {
        const expectedResponse = {
            "token": "eyLOeX...",
            "refresh_token": "mW+f/F...",
            "database" : {
              "id": "wSSZQbPxKvBrk_n3H_m6ZA",
              "name": "Example DB name",
              "description": "Example DB longer description",
              "item_id_type": "uuid",
              "user_id_type": "uint32"
            }
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.loginService('serviceAccountNode', 'MyP@ssw0rd', 'wSSZQbPxKvBrk_n3H_m6ZA');
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

      test('loginRoot', async () => {
        const expectedResponse = {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbmNyeXB..."
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.loginRoot("john@example.com", "MyP@ssw0rd");
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

      test('loginRefreshToken', async () => {
        const expectedResponse = {
            "token": "eyJ0eX...",
            "refresh_token": "mW+k/K...",
            "database" : {
              "id": "wSSZQbPxKvBrk_n2B_m6ZA",
              "name": "Example DB name",
              "description": "Example DB longer description",
              "item_id_type": "uuid",
              "user_id_type": "uint32"
            }
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.loginRefreshToken();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });
  
      test('AuthError', async () => {
        const expectedError = {
          error_code: 21,
          error_name: 'AuthError',
          message: 'Cannot perform authentication: account password is incorrect',
          error_data: {
            error: 'account password is incorrect',
            name: 'INCORRECT_PASSWORD'
          }
        }
        const theSpiedMethod = jest.spyOn(api, 'loginIndividual');
        when(theSpiedMethod)
          .calledWith('reject@hotmail.com', 'MyP@ssw0rd1', '3_kpGNbqBbE_xPtKTg8fwA')
          .mockRejectedValueOnce(new AuthError(expectedError));
        const returnValue = api.loginIndividual('reject@hotmail.com', 'MyP@ssw0rd1', '3_kpGNbqBbE_xPtKTg8fwA');
        expect(returnValue).rejects.toThrow(AuthError);
      });

});