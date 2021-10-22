require('jest-fetch-mock');
const fetchMock = require('fetch-mock');
jest.setMock('isomorphic-fetch', fetchMock);
const { ApiClient } = require("../lib/ApiClient");

// DATABASE ENDPOINTS
describe('DATABASE TESTS', () => {
    const host = "http://localhost";
    const api = new ApiClient(host);
    const headers = {
        'User-Agent': 'CrossingMinds/v1',
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer '
    }

    test('createDatabase', async () => {
        const expectedResponse = { id: "wSSZQbPxKvBrk_n2B_m6ZA" }
        fetchMock.postOnce(host + '/databases/', expectedResponse, { headers: headers });
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
        fetchMock.getOnce(host + '/databases/?amt=64&page=1', expectedResponse, { headers: headers });
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
        fetchMock.getOnce(host + '/databases/current/', expectedResponse, { headers: headers });
        const current = await api.getCurrentDatabase();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteCurrentDatabase', async () => {
        const expectedResponse = {}
        fetchMock.deleteOnce(host + '/databases/current/', expectedResponse, { headers: headers });
        const current = await api.deleteCurrentDatabase();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getCurrentDatabaseStatus', async () => {
        const expectedResponse = { status: "ready" }
        fetchMock.getOnce(host + '/databases/current/status/', { body: expectedResponse }, { headers: headers });
        const current = await api.getCurrentDatabaseStatus();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });
});
