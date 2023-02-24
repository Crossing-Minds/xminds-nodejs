const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');
require('./mockFetch')();

// USER-DATA-PROPERTIES ENDPOINTS
describe('USER-DATA-PROPERTIES TESTS', () => {
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
    globalThis.fetch.post(opts.host + '/v1/login/refresh-token/', loginRefreshTokenResponse);

    test('getUserProperty', async () => {
        const expectedResponse = { property_name: 'age', value_type: 'int8', repeated: false }
        globalThis.fetch.getOnce(opts.host + '/v1/users-properties/age/', expectedResponse);
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
        globalThis.fetch.getOnce(opts.host + '/v1/users-properties/', expectedResponse);
        const current = await api.listAllUserProperties();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createUserProperty', async () => {
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/users-properties/', expectedResponse);
        const current = await api.createUserProperty('age', 'int8', false);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteUserProperty', async () => {
        const expectedResponse = {}
        globalThis.fetch.deleteOnce(opts.host + '/v1/users-properties/age/', expectedResponse);
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
        globalThis.fetch.getOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/', expectedResponse);
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
        globalThis.fetch.putOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/', expectedResponse);
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
        globalThis.fetch.putOnce(opts.host + '/v1/users-bulk/', expectedResponse);
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
        let path = '/users-bulk/' + utils.convertToQueryString(queryParams);
        globalThis.fetch.get(opts.host + '/v1' + path, expectedResponse);
        const current = await api.listUsersPaginated(100, 'Q21vU1pHb1FjSEp...');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    }, 5000);

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
        globalThis.fetch.postOnce(opts.host + '/v1/users-bulk/list/', expectedResponse);
        const current = await api.listUsers(usersId);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteUser', async () => {
        const expectedResponse = {}
        globalThis.fetch.deleteOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/', expectedResponse);
        const current = await api.deleteUser('123e4567-e89b-12d3-a456-426614174000');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteUsersBulk', async () => {
        const expectedResponse = {}
        const usersId = [
            "123e4567-e89b-12d3-a456-426614174000",
            "c3391d83-553b-40e7-818e-fcf658ec397d"
        ]
        globalThis.fetch.deleteOnce(opts.host + '/v1/users-bulk/', expectedResponse);
        const current = await api.deleteUsersBulk(usersId);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('partialUpdateUser', async () => {
        const expectedResponse = {}
        const user = {
            user: {
                subscriptions: ["channel1", "channel2"],
                age: 25
            }
        }
        globalThis.fetch.patchOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/', expectedResponse);
        const current = await api.partialUpdateUser('123e4567-e89b-12d3-a456-426614174000', user);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('partialUpdateUsersBulk', async () => {
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
        globalThis.fetch.patchOnce(opts.host + '/v1/users-bulk/', expectedResponse);
        const current = await api.partialUpdateUsersBulk(users);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
