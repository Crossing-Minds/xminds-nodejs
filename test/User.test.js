require('jest-fetch-mock');
const fetchMock = require('fetch-mock');
jest.setMock('node-fetch', fetchMock);
const { ApiClient } = require("../lib/ApiClient");
const querystring = require('querystring');

// USER-DATA-PROPERTIES ENDPOINTS
describe('USER-DATA-PROPERTIES TESTS', () => {
    const host = "http://localhost";
    const api = new ApiClient(host);
    const headers = {
        'User-Agent': 'CrossingMinds/v1',
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer '
    }

    test('getUserProperty', async () => {
        const expectedResponse = { property_name: 'age', value_type: 'int8', repeated: false }
        fetchMock.getOnce(host + '/users-properties/age/', expectedResponse, { headers: headers });
        const current = await api.getUserProperty("age");
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listAllUserProperties', async () => {
        const expectedResponse = {
            properties: [
                {
                    property_name: "age",
                    value_type: "int8",
                    repeated: false
                },
                {
                    property_name: "subscriptions",
                    value_type: "unicode32",
                    repeated: true
                }
            ]
        }
        fetchMock.getOnce(host + '/users-properties/', expectedResponse, { headers: headers });
        const current = await api.listAllUserProperties();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createUserProperty', async () => {
        const expectedResponse = {}
        fetchMock.postOnce(host + '/users-properties/', expectedResponse, { headers: headers });
        const current = await api.createUserProperty('age', 'int8', false);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteUserProperty', async () => {
        const expectedResponse = {}
        fetchMock.deleteOnce(host + '/users-properties/age/', expectedResponse, { headers: headers });
        const current = await api.deleteUserProperty('age');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getUser', async () => {
        const expectedResponse = {
            user: {
                user_id: "123e4567-e89b-12d3-a456-426614174000",
                subscriptions: ["channel1", "channel2"],
                age: 25
            }
        }
        fetchMock.getOnce(host + '/users/123e4567-e89b-12d3-a456-426614174000/', expectedResponse, { headers: headers });
        const current = await api.getUser('123e4567-e89b-12d3-a456-426614174000');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateUser', async () => {
        const expectedResponse = {}
        const user = {
            user: {
                subscriptions: ["channel1", "channel2"],
                age: 25
            }
        }
        fetchMock.putOnce(host + '/users/123e4567-e89b-12d3-a456-426614174000/', expectedResponse, { headers: headers });
        const current = await api.createOrUpdateUser('123e4567-e89b-12d3-a456-426614174000', user);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateUsersBulk', async () => {
        const expectedResponse = {}
        const users = [
            {
                user_id: "123e4567-e89b-12d3-a456-426614174000",
                age: 25,
                subscriptions: ["channel1", "channel2"]
            },
            {
                user_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
                age: 32,
                subscriptions: ["channel1"]
            }
        ]
        fetchMock.putOnce(host + '/users-bulk/', expectedResponse, { headers: headers });
        const current = await api.createOrUpdateUsersBulk(users);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listUsersPaginated', async () => {
        const expectedResponse = {
            users: [
                {
                    user_id: "123e4567-e89b-12d3-a456-426614174000",
                    age: 25,
                    subscriptions: ["channel1", "channel2"]
                },
                {
                    user_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
                    age: 32,
                    subscriptions: ["channel1"]
                }
            ],
            has_next: true,
            next_cursor: "Q21vU1pHb1FjSEp..."
        }
        let queryParams = {}
        queryParams['amt'] = 100;
        queryParams['cursor'] = 'Q21vU1pHb1FjSEp...';
        let path = '/users-bulk/?' + querystring.stringify(queryParams);
        fetchMock.getOnce(host + path, expectedResponse, { headers: headers });
        const current = await api.listUsersPaginated(100, 'Q21vU1pHb1FjSEp...');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listUsers', async () => {
        const expectedResponse = {
            users: [
                {
                    user_id: "123e4567-e89b-12d3-a456-426614174000",
                    age: 25,
                    subscriptions: ["channel1", "channel2"]
                },
                {
                    user_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
                    age: 32,
                    subscriptions: ["channel1"]
                }
            ]
        }
        const usersId = [
            "123e4567-e89b-12d3-a456-426614174000",
            "c3391d83-553b-40e7-818e-fcf658ec397d"
        ]
        fetchMock.postOnce(host + '/users-bulk/list/', expectedResponse, { headers: headers });
        const current = await api.listUsers(usersId);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
