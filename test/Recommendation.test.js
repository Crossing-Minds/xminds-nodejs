const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');
jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

// RECOMMENDATIONS ENDPOINTS
describe('RECOMMENDATIONS TESTS', () => {
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

    test('getRecommendationsItemToItems', async () => {
        const expectedResponse = {
            "items_id": [
                "c3391d83-553b-40e7-818e-fcf658ec397d",
                "c2a73584-bbd0-4f04-b497-26bf70152932"
            ],
            "next_cursor": "HLe-e1Sq..."
        }
        const filters = [
            { "property_name": "price", "op": "lt", "value": 10 },
            { "property_name": "genres", "op": "eq", "value": "drama" }
        ]
        const amt = 10;
        let queryParams = {
            amt: amt,
            cursor: 'Q21vU1pHb1FjSEp...',
            filters: utils.getFormattedFiltersArray(filters)
        }
        let path = '/v1/recommendation/items/c3391d83-553b-40e7-818e-fcf658ec397d/items/' + utils.convertToQueryString(queryParams);
        fetchMock.getOnce(opts.host + path, expectedResponse);
        const opts_params = {
            amt: amt,
            cursor: "Q21vU1pHb1FjSEp...",
            filters: filters
        }
        const current = await api.getRecommendationsItemToItems("c3391d83-553b-40e7-818e-fcf658ec397d", opts_params);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getRecommendationsSessionToItems', async () => {
        const expectedResponse = {
            "items_id": [
                "c3391d83-553b-40e7-818e-fcf658ec397d",
                "c2a73584-bbd0-4f04-b497-26bf70152932"
            ],
            "next_cursor": "HLe-e1Sq..."
        }
        const ratings = [
            { "item_id": "123e4567-e89b-12d3-a456-426614174000", "rating": 8.5 },
            { "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "rating": 2.0 }
        ]
        const userProperties = {
            "subscriptions": ["channel1", "channel2"],
            "age": 25
        }
        const amt = 10;
        const filters = [
            { "property_name": "price", "op": "lt", "value": 10 },
            { "property_name": "genres", "op": "eq", "value": "drama" },
            { "property_name": "tags", "op": "in", "value": ["family", "fiction"] },
            { "property_name": "poster", "op": "notempty" },
        ]
        const excludeRatedItems = true;
        fetchMock.postOnce(opts.host + '/v1/recommendation/sessions/items/', expectedResponse);
        const opts_params = {
            amt: amt,
            cursor: "Q21vU1pHb1FjSEp...",
            filters: filters,
            ratings: ratings,
            userProperties: userProperties,
            excludeRatedItems: excludeRatedItems,
            skipDefaultScenario: false
        }
        const current = await api.getRecommendationsSessionToItems(opts_params);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getRecommendationsUserToItems', async () => {
        const expectedResponse = {
            "items_id": [
                "c3391d83-553b-40e7-818e-fcf658ec397d",
                "c2a73584-bbd0-4f04-b497-26bf70152932"
            ],
            "next_cursor": "HLe-e1Sq..."
        }
        const userProperties = {
            "subscriptions": ["channel1", "channel2"],
            "age": 25
        }
        const amt = 10;
        const filters = [
            { "property_name": "price", "op": "lt", "value": 10 },
            { "property_name": "genres", "op": "eq", "value": "drama" },
            { "property_name": "tags", "op": "in", "value": ["family", "fiction"] },
            { "property_name": "poster", "op": "notempty" }
        ]
        const userId = "c3391d83-553b-40e7-818e-fcf658ec397d";
        const excludeRatedItems = true;
        let queryParams = {
            amt: amt,
            cursor: 'Q21vU1pHb1FjSEp...',
            filters: utils.getFormattedFiltersArray(filters),
            exclude_rated_items: excludeRatedItems,
            user_properties: userProperties
        }
        let path = `/v1/recommendation/users/${userId}/items/` + utils.convertToQueryString(queryParams);
        fetchMock.getOnce(opts.host + path, expectedResponse);
        const opts_params = {
            amt: amt,
            cursor: "Q21vU1pHb1FjSEp...",
            filters: filters,
            exclude_rated_items: excludeRatedItems,
            user_properties: userProperties
        }
        const current = await api.getRecommendationsUserToItems(userId, opts_params);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
