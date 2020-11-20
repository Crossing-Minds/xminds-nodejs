const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);
const { ApiClient } = require("../lib/ApiClient");

// DATABASE ENDPOINTS
describe('DATABASE TESTS', () => {
    const api = ApiClient.instance;
  
    test('createDatabase', async () => {
      const expectedResponse = { "id": "wSSZQbPxKvBrk_n2B_m6ZA" }
      fetch.mockResponse(JSON.stringify(expectedResponse));
      const current = await api.createIndividualAccount("Example DB name", "Example DB longer description", "uuid", "uint32");
  
      expect(current).toEqual(expectedResponse);
      expect(current).toMatchSnapshot();
    });

    test('listAllDatabases', async () => {
        const expectedResponse = {
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
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.listAllDatabases();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

    test('getCurrentDatabase', async () => {
        const expectedResponse = {
            "id": "wSSZQbPxKvBrk_n2B_m6ZA",
            "name": "Example DB name",
            "description": "Example DB longer description",
            "item_id_type": "uuid",
            "user_id_type": "uint32",
            "counters": {
                "rating": 130,
                "user": 70,
                "item": 81
            }
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.getCurrentDatabase();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteCurrentDatabase', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.deleteCurrentDatabase();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getCurrentDatabaseStatus', async () => {
        const expectedResponse = {
            "status": "ready"
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.getCurrentDatabaseStatus();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });
});
