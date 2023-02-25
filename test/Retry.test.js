const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');
require('./mockFetch')();

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
    globalThis.fetch.post(opts.host + '/v1/login/refresh-token/', loginRefreshTokenResponse);

    test('Must retry 3 times since the opts.retry parameter is not provided, then it uses default', async () => {
        const responseErr = { "error_code": "2", "error_name": "TooManyRequests", "message": "The amount of requests exceeds the limit of your subscription.", 
            "error_data": { "name": "RATE_LIMIT_OVERFLOW" } }
        const item = {
            item: {
                tags: ["family", "sci-fi"],
                genres: ["drama", "comedy"],
                price: 9.99
            }
        }
        globalThis.fetch.put(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/ratings/c3391d83-553b-40e7-818e-fcf658ec397d/', { body: responseErr, status: 429 });
        // Must retry 3 times (Default)
        var retryOpts = {}
        const current = await api.createOrUpdateRating('123e4567-e89b-12d3-a456-426614174000', 'c3391d83-553b-40e7-818e-fcf658ec397d', 8.5, 1588812345, retryOpts)
            .catch(err => {
                expect(err.message).toEqual('The amount of requests exceeds the limit of your subscription.');
            });
        // globalThis.fetchMock.mock.calls includes call to POST (loginRefreshToken)
        expect(globalThis.fetch.mock.calls.length - 1).toBe(4); // Must be called 3 times
        expect(current).toMatchSnapshot();
    }, 5000);

    test('Must retry 2 times since the maxRetries param is equal to 2', async () => {
        globalThis.fetch.mockReset();
        const responseErr = { "error_code": "2", "error_name": "TooManyRequests", "message": "The amount of requests exceeds the limit of your subscription.", 
            "error_data": { "name": "RATE_LIMIT_OVERFLOW" } }
        const item = {
            item: {
                tags: ["family", "sci-fi"],
                genres: ["drama", "comedy"],
                price: 9.99
            }
        }
        globalThis.fetch.put(opts.host + '/v1/items/123e4567-e89b-12d3-a456-426614174000/', { body: responseErr, status: 429 });
        // Must retry 2 times
        var retryOpts = {
            retry: {
                maxRetries: 2, // 2 retries
                base: 200,
                multiplier: 2
            }
        }
        const current = await api.createOrUpdateItem('123e4567-e89b-12d3-a456-426614174000', item, retryOpts)
            .catch(err => {
                expect(err.message).toEqual('The amount of requests exceeds the limit of your subscription.');
            });
        // globalThis.fetchMock.mock.calls includes call to POST (loginRefreshToken)
        expect(globalThis.fetch.mock.calls.length).toBe(3); // Must be called 3 times
        expect(current).toMatchSnapshot();
    }, 5000);

    test('Must not retry since the maxRetries parameter is equal to 0', async () => {
        globalThis.fetch.mockReset();
        const responseErr = { "error_code": "2", "error_name": "TooManyRequests", "message": "The amount of requests exceeds the limit of your subscription.", 
            "error_data": { "name": "RATE_LIMIT_OVERFLOW" } }
        const user = {
            user: {
                subscriptions: ["channel1", "channel2"],
                age: 25
            }
        }
        globalThis.fetch.putOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/', { body: responseErr, status: 429 });
        // Must not retry
        var retryOpts = {
            retry: {
                maxRetries: 0, // 0 retries
                base: 200,
                multiplier: 2
            }
        }
        const current = await api.createOrUpdateUser('123e4567-e89b-12d3-a456-426614174000', user, retryOpts)
            .catch(err => {
                expect(err.message).toEqual('The amount of requests exceeds the limit of your subscription.');
            });
        expect(globalThis.fetch.mock.calls.length).toBe(1); // Must be called 1 time only
        expect(current).toMatchSnapshot();
    }, 5000);

});