const { ApiClient } = require("../lib/ApiClient");
require('./mockFetch')();

// USER AND SESSION INTERACTIONS ENDPOINTS
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
    globalThis.fetch.post(opts.host + '/v1/login/refresh-token/', loginRefreshTokenResponse);

    // User Interactions
    test('createInteraction', async () => {
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/interactions/c3391d83-553b-40e7-818e-fcf658ec397d/', expectedResponse);
        const current = await api.createInteraction('123e4567-e89b-12d3-a456-426614174000', 'c3391d83-553b-40e7-818e-fcf658ec397d', 'productView', 1588812345);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createUserInteractionsBulk', async () => {
        const interactions = [
            { "item_id": "123e4567-e89b-12d3-a456-426614174000", "interaction_type": "productView", "timestamp": 1588812345 },
            { "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "productView", "timestamp": 1588854321 },
            { "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "addToCart", "timestamp": 1588811111 },
        ]
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/users/123e4567-e89b-12d3-a456-426614174000/interactions-bulk/', expectedResponse);
        const current = await api.createUserInteractionsBulk('123e4567-e89b-12d3-a456-426614174000', interactions);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createUsersInteractionsBulk', async () => {
        const interactions = [
            { "user_id": 1234, "item_id": "123e4567-e89b-12d3-a456-426614174000", "interaction_type": "productView", "timestamp": 1588812345 },
            { "user_id": 1234, "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "productView", "timestamp": 1588854321 },
            { "user_id": 333, "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "addToCart", "timestamp": 1588811111 },
        ]
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/interactions-bulk/', expectedResponse);
        const current = await api.createUsersInteractionsBulk(interactions);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    // Anonymous Session Interactions
    test('createAnonymousSessionInteraction', async () => {
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/sessions/123e4567-e89b-12d3-a456-426614174000/items/c3391d83-553b-40e7-818e-fcf658ec397d/interactions/', expectedResponse);
        const current = await api.createAnonymousSessionInteraction('123e4567-e89b-12d3-a456-426614174000', 'c3391d83-553b-40e7-818e-fcf658ec397d', 'productView', 1588812345);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createAnonymousSessionInteractionsBulk', async () => {
        const interactions = [
            { "item_id": "123e4567-e89b-12d3-a456-426614174000", "interaction_type": "productView", "timestamp": 1588812345 },
            { "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "productView", "timestamp": 1588854321 },
            { "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "addToCart", "timestamp": 1588811111 },
        ]
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/sessions/123e4567-e89b-12d3-a456-426614174000/interactions-bulk/', expectedResponse);
        const current = await api.createAnonymousSessionInteractionsBulk('123e4567-e89b-12d3-a456-426614174000', interactions);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createAnonymousSessionsInteractionsBulk', async () => {
        const interactions = [
            { "session_id": 1234, "item_id": "123e4567-e89b-12d3-a456-426614174000", "interaction_type": "productView", "timestamp": 1588812345 },
            { "session_id": 1234, "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "productView", "timestamp": 1588854321 },
            { "session_id": 333, "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "addToCart", "timestamp": 1588811111 },
        ]
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/sessions-interactions-bulk/', expectedResponse);
        const current = await api.createAnonymousSessionsInteractionsBulk(interactions);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listAnonymousSessionsInteractions', async () => {
        const expectedResponse = {
            "has_next": true,
            "next_cursor": "Q21vU1pHb1FjSEp...",
            "interactions": [
                { "session_id": 1234, "item_id": "123e4567-e89b-12d3-a456-426614174000", "interaction_type": "productView", "timestamp": 1588812345 },
                { "session_id": 1234, "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "addToCart", "timestamp": 1588854321 },
                { "session_id": 333, "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "productView", "timestamp": 1588811111 },
            ]
        }
        globalThis.fetch.getOnce(opts.host + '/v1/sessions-interactions-bulk/', expectedResponse);
        const current = await api.listAnonymousSessionsInteractions();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('resolveAnonymousSession', async () => {
        const userId = "123e4567-e89b-12d3-a456-426614174000";
        const sessionId = "c3391d83-553b-40e7-818e-fcf658ec397d";
        const timestamp = 1588812345;
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + `/v1/sessions/${sessionId}/resolve/`, expectedResponse);
        const current = await api.resolveAnonymousSession(userId, sessionId, timestamp);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listResolvedAnonymousSessionsByUsers', async () => {
        const usersId = [
            "123e4567-e89b-12d3-a456-426614174000",
            "c3391d83-553b-40e7-818e-fcf658ec397d"
        ];
        const amt = 10;
        const cursor = "F25pU1vHb1LjSEp...";
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/resolved-sessions/', expectedResponse);
        const current = await api.listResolvedAnonymousSessionsByUsers(usersId, amt, cursor);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
