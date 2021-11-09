const { ApiClient } = require("../lib/ApiClient");
const fetchMock = require('fetch-mock-jest');

// DATABASE ENDPOINTS
describe('DATABASE TESTS', () => {
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

    test('createDatabase', async () => {
        const expectedResponse = { id: "wSSZQbPxKvBrk_n2B_m6ZA" }
        fetchMock.postOnce(opts.host + '/v1/databases/', expectedResponse);
        const current = await api.createDatabase("Example DB name", "Example DB longer description", "uuid", "uint32");
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listAllDatabases', async () => {
        const expectedResponse = {
            has_next: false,
            next_page: 2,
            databases: [
                {
                    id: "wSSZQbPxKvBrk_n2B_m6ZA",
                    name: "Example DB name",
                    description: "Example DB longer description",
                    item_id_type: "uuid",
                    user_id_type: "uint32",
                }
            ]
        }
        fetchMock.getOnce(opts.host + '/v1/databases/?amt=64&page=1', expectedResponse);
        const current = await api.listAllDatabases(64, 1);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getCurrentDatabase', async () => {
        const expectedResponse = {
            id: "wSSZQbPxKvBrk_n2B_m6ZA",
            name: "Example DB name",
            description: "Example DB longer description",
            item_id_type: "uuid",
            user_id_type: "uint32",
            counters: {
                rating: 130,
                user: 70,
                item: 81
            }
        }
        fetchMock.getOnce(opts.host + '/v1/databases/current/', expectedResponse);
        const current = await api.getCurrentDatabase();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteCurrentDatabase', async () => {
        const expectedResponse = {}
        fetchMock.deleteOnce(opts.host + '/v1/databases/current/', expectedResponse);
        const current = await api.deleteCurrentDatabase();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getCurrentDatabaseStatus', async () => {
        const expectedResponse = { status: "ready" }
        fetchMock.getOnce(opts.host + '/v1/databases/current/status/', { body: expectedResponse });
        const current = await api.getCurrentDatabaseStatus();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });
});
