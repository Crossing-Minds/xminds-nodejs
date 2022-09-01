const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');
jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

// USER-RATINGS ENDPOINTS
describe('USER-INTERACTION TESTS', () => {
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

    test('createInteraction', async () => {
        const expectedResponse = {}
        fetchMock.postOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/interactions/c3391d83-553b-40e7-818e-fcf658ec397d/', expectedResponse);
        const current = await api.createInteraction('123e4567-e89b-12d3-a456-426614174000', 'c3391d83-553b-40e7-818e-fcf658ec397d', 'productView', 1588812345);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateUserInteractionsBulk', async () => {
        const interactions = [
            { "item_id": "123e4567-e89b-12d3-a456-426614174000", "interaction_type": "productView", "timestamp": 1588812345 },
            { "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "productView", "timestamp": 1588854321 },
            { "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "addToCart", "timestamp": 1588811111 },
        ]
        const expectedResponse = {}
        fetchMock.postOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/interactions-bulk/', expectedResponse);
        const current = await api.createOrUpdateUserInteractionsBulk('123e4567-e89b-12d3-a456-426614174000', interactions);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateUsersInteractionsBulk', async () => {
        const interactions = [
            { "user_id": 1234, "item_id": "123e4567-e89b-12d3-a456-426614174000", "interaction_type": "productView", "timestamp": 1588812345 },
            { "user_id": 1234, "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "productView", "timestamp": 1588854321 },
            { "user_id": 333, "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "addToCart", "timestamp": 1588811111 },
        ]
        const expectedResponse = {}
        fetchMock.postOnce(opts.host + '/v1/interactions-bulk/', expectedResponse);
        const current = await api.createOrUpdateUsersInteractionsBulk(interactions);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
