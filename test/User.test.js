const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);
const { ApiClient } = require("../lib/ApiClient");

// USER-DATA-PROPERTIES ENDPOINTS
describe('USER-DATA-PROPERTIES TESTS', () => {
    const api = ApiClient.instance;
  
    test('getUserProperty', async () => {
      const expectedResponse = { property_name: 'age', value_type: 'int8', repeated: false }
      fetch.mockResponse(JSON.stringify(expectedResponse));
      const current = await api.getUserProperty("age");
  
      expect(current).toEqual(expectedResponse);
      expect(current).toMatchSnapshot();
    });

    test('listAllUserProperties', async () => {
        const expectedResponse = {
            "properties": [
                {
                    "property_name": "age",
                    "value_type": "int8",
                    "repeated": false
                },
                {
                    "property_name": "subscriptions",
                    "value_type": "unicode32",
                    "repeated": true
                }
            ]
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.listAllUserProperties();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

    test('createUserProperty', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.createUserProperty('age', 'int8', false);
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteUserProperty', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.deleteUserProperty('age');
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getUser', async () => {
        const expectedResponse = {
            "user": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "subscriptions": ["channel1", "channel2"],
                "age": 25
            }
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.getUser('123e4567-e89b-12d3-a456-426614174000');
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateUser', async () => {
        const expectedResponse = {}
        const user = {
            "user": {
                "subscriptions": ["channel1", "channel2"],
                "age": 25
            }
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.createOrUpdateUser('123e4567-e89b-12d3-a456-426614174000', user);
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateUsersBulk', async () => {
        const expectedResponse = {}
        const users = [
            {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "age": 25,
                "subscriptions": ["channel1", "channel2"]
            },
            {
                "user_id": "c3391d83-553b-40e7-818e-fcf658ec397d",
                "age": 32,
                "subscriptions": ["channel1"]
            }
        ]
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.createOrUpdateUsersBulk(users);
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listUsersPaginated', async () => {
        const expectedResponse = {
            "users": [
                {
                    "user_id": "123e4567-e89b-12d3-a456-426614174000",
                    "age": 25,
                    "subscriptions": ["channel1", "channel2"]
                },
                {
                    "user_id": "c3391d83-553b-40e7-818e-fcf658ec397d",
                    "age": 32,
                    "subscriptions": ["channel1"]
                }
            ],
            "has_next": true,
            "next_cursor": "Q21vU1pHb1FjSEp..."
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.listUsersPaginated(100, 'Q21vU1pHb1FjSEp...');
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listUsers', async () => {
        const expectedResponse = {
            "users": [
                {
                    "user_id": "123e4567-e89b-12d3-a456-426614174000",
                    "age": 25,
                    "subscriptions": ["channel1", "channel2"]
                },
                {
                    "user_id": "c3391d83-553b-40e7-818e-fcf658ec397d",
                    "age": 32,
                    "subscriptions": ["channel1"]
                }
            ]
        }
        const usersId = [
            "123e4567-e89b-12d3-a456-426614174000",
            "c3391d83-553b-40e7-818e-fcf658ec397d"
        ]
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.listUsers(usersId);
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
