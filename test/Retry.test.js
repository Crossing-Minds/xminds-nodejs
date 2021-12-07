const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');
jest.mock('isomorphic-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('isomorphic-fetch');

// USER-DATA-PROPERTIES ENDPOINTS
describe('RETRY FEATURE TESTS', () => {
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

    test('Must retry 2 times', async () => {
        
        const responseErr = { "error_code": "2", "error_name": "TooManyRequests", "message": "The amount of requests exceeds the limit of your subscription.", 
            "error_data": { "name": "RATE_LIMIT_OVERFLOW" } }
        const item = {
            item: {
                tags: ["family", "sci-fi"],
                genres: ["drama", "comedy"],
                price: 9.99
            }
        }

        fetchMock.put(opts.host + '/v1/items/123e4567-e89b-12d3-a456-426614174000/', { body: responseErr, status: 429 });
   
        // Must retry 2 times
        var retryOpts = {
            retry: {
                maxRetries: 2, // 2 retries
                base: 500,
                multiplier: 2
            }
        }
        const current = await api.createOrUpdateItem('123e4567-e89b-12d3-a456-426614174000', item, retryOpts)
            .catch(err => {
                expect(err.message).toEqual('The amount of requests exceeds the limit of your subscription.');
            });
        // fetchMock.mock.calls includes call to POST (loginRefreshToken)
        expect(fetchMock.mock.calls.length - 1).toBe(3); // Must be called 3 times
        expect(current).toMatchSnapshot();
    }, 5000);

});