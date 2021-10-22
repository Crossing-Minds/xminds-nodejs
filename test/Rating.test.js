require('jest-fetch-mock');
const fetchMock = require('fetch-mock');
jest.setMock('isomorphic-fetch', fetchMock);
const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');

// USER-RATINGS ENDPOINTS
describe('USER-RATINGS TESTS', () => {
    const host = "http://localhost";
    const api = new ApiClient(host);
    const headers = {
        'User-Agent': 'CrossingMinds/v1',
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer '
    }

    test('createOrUpdateRating', async () => {
        const expectedResponse = {}
        fetchMock.putOnce(host + '/users/123e4567-e89b-12d3-a456-426614174000/ratings/c3391d83-553b-40e7-818e-fcf658ec397d/', expectedResponse, { headers: headers });
        const current = await api.createOrUpdateRating('123e4567-e89b-12d3-a456-426614174000', 'c3391d83-553b-40e7-818e-fcf658ec397d', 8.5, 1588812345);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteRating', async () => {
        const expectedResponse = {}
        fetchMock.deleteOnce(host + '/users/123e4567-e89b-12d3-a456-426614174000/ratings/c3391d83-553b-40e7-818e-fcf658ec397d/', expectedResponse, { headers: headers });
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
        let path = '/users/123e4567-e89b-12d3-a456-426614174000/ratings/?' + utils.convertToQueryString(queryParams);
        fetchMock.getOnce(host + path, expectedResponse, { headers: headers });
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
        fetchMock.putOnce(host + '/users/123e4567-e89b-12d3-a456-426614174000/ratings/', expectedResponse, { headers: headers });
        const current = await api.createOrUpdateUserRatingsBulk('123e4567-e89b-12d3-a456-426614174000', ratings);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteUserRatings', async () => {
        const expectedResponse = {}
        fetchMock.deleteOnce(host + '/users/123e4567-e89b-12d3-a456-426614174000/ratings/', expectedResponse, { headers: headers });
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
        fetchMock.putOnce(host + '/ratings-bulk/', expectedResponse, { headers: headers });
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
        let path = '/ratings-bulk/?' + utils.convertToQueryString(queryParams);
        fetchMock.getOnce(host + path, expectedResponse, { headers: headers });
        const current = await api.listRatings(1, "Q21vU1pHb1FjSEp...");
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
