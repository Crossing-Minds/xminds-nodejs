const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');
jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

// USER-RATINGS ENDPOINTS
describe('USER-RATINGS TESTS', () => {
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

    test('createOrUpdateRating', async () => {
        const expectedResponse = {}
        fetchMock.putOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/ratings/c3391d83-553b-40e7-818e-fcf658ec397d/', expectedResponse);
        const current = await api.createOrUpdateRating('123e4567-e89b-12d3-a456-426614174000', 'c3391d83-553b-40e7-818e-fcf658ec397d', 8.5, 1588812345);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteRating', async () => {
        const expectedResponse = {}
        fetchMock.deleteOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/ratings/c3391d83-553b-40e7-818e-fcf658ec397d/', expectedResponse);
        const current = await api.deleteRating('123e4567-e89b-12d3-a456-426614174000', 'c3391d83-553b-40e7-818e-fcf658ec397d');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listUserRatings', async () => {
        const expectedResponse = {
            has_next: false,
            next_page: 2,
            user_ratings: [
                { item_id: "123e4567-e89b-12d3-a456-426614174000", rating: 8.5, timestamp: 1588812345 },
                { item_id: "c3391d83-553b-40e7-818e-fcf658ec397d", rating: 2.0, timestamp: 1588854321 }
            ]
        }
        let queryParams = { "page": 1, "amt": 10 };
        let path = '/v1/users/123e4567-e89b-12d3-a456-426614174000/ratings/' + utils.convertToQueryString(queryParams);
        fetchMock.getOnce(opts.host + path, expectedResponse);
        const current = await api.listUserRatings('123e4567-e89b-12d3-a456-426614174000', 1, 10);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateUserRatingsBulk', async () => {
        const ratings = [
            { item_id: "123e4567-e89b-12d3-a456-426614174000", rating: 8.5, timestamp: 1588812345 },
            { item_id: "c3391d83-553b-40e7-818e-fcf658ec397d", rating: 2.0, timestamp: 1588854321 }
        ]
        const expectedResponse = {}
        fetchMock.putOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/ratings/', expectedResponse);
        const current = await api.createOrUpdateUserRatingsBulk('123e4567-e89b-12d3-a456-426614174000', ratings);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteUserRatings', async () => {
        const expectedResponse = {}
        fetchMock.deleteOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/ratings/', expectedResponse);
        const current = await api.deleteUserRatings('123e4567-e89b-12d3-a456-426614174000');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateRatingsBulk', async () => {
        const ratings = [
            { user_id: 1234, item_id: "123e4567-e89b-12d3-a456-426614174000", rating: 8.5, timestamp: 1588812345 },
            { user_id: 1234, item_id: "c3391d83-553b-40e7-818e-fcf658ec397d", rating: 2.0, timestamp: 1588854321 },
            { user_id: 333, item_id: "c3391d83-553b-40e7-818e-fcf658ec397d", rating: 5.5, timestamp: 1588811111 },
        ]
        const expectedResponse = {}
        fetchMock.putOnce(opts.host + '/v1/ratings-bulk/', expectedResponse);
        const current = await api.createOrUpdateRatingsBulk(ratings);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listRatings', async () => {
        const expectedResponse = {
            has_next: true,
            next_cursor: "Q21vU1pHb1FjSEp...",
            ratings: [
                { user_id: 1234, item_id: "123e4567-e89b-12d3-a456-426614174000", rating: 8.5, timestamp: 1588812345 },
                { user_id: 1234, item_id: "c3391d83-553b-40e7-818e-fcf658ec397d", rating: 2.0, timestamp: 1588854321 },
                { user_id: 333, item_id: "c3391d83-553b-40e7-818e-fcf658ec397d", rating: 5.5, timestamp: 1588811111 },
            ]
        }
        let queryParams = {};
        queryParams['page'] = '1';
        queryParams['cursor'] = 'Q21vU1pHb1FjSEp...';
        let path = '/v1/ratings-bulk/' + utils.convertToQueryString(queryParams);
        fetchMock.getOnce(opts.host + path, expectedResponse);
        const current = await api.listRatings(1, "Q21vU1pHb1FjSEp...");
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
