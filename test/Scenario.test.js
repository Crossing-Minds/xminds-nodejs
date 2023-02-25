const { ApiClient } = require("../lib/ApiClient");
require('./mockFetch')();

// SCENARIOS ENDPOINTS
describe('SCENARIOS TESTS', () => {
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

    test('getScenario', async () => {
        const expectedResponse = {
            "name": "my_scenar101",
            "reco_type": "profile_to_items",
            "scenario": {
                "scenario_type": "case",
                "case": {
                    "filters": [{"property_name": "year", "op": "eq", "value": 1988}],
                    "reranking": [{"property_name": "genres", "op": "diversity", "weight": 0.25}],
                    "exclude_rated_items": false,
                    "algorithms": "algo105|algo106",
                     "candidates_preselection": {
                        "method": "knn",
                        "params": {"algorithms": ["algo103"]}
                    }
                }
            }
        }
        globalThis.fetch.getOnce(opts.host + '/v1/scenarios/item-to-item/my-case-scenario/', expectedResponse);
        const current = await api.getScenario('item-to-item', 'my-case-scenario');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrReplaceScenario', async () => {
        const expectedResponse = {
            "warnings": ["Missing property value `test`"]
        }
        const scenario = {
            "scenario_type": "condition",
            "condition": {
                "condition_type": "user_function",
                "if": {"function_name": "n_ratings", "op": "gte", "value": 21},
                "then": "scenario1",
                "else": "scenario2"
            }
        }
        globalThis.fetch.putOnce(opts.host + '/v1/scenarios/item-to-item/my-case-scenario/', expectedResponse);
        const current = await api.createOrReplaceScenario('item-to-item', 'my-case-scenario', scenario);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteScenario', async () => {
        const expectedResponse = {}
        globalThis.fetch.deleteOnce(opts.host + '/v1/scenarios/item-to-item/my-case-scenario/', expectedResponse);
        const current = await api.deleteScenario('item-to-item', 'my-case-scenario');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getAllScenarios', async () => {
        const expectedResponse = {
            "scenarios": [
                {
                    "name": "my_scenar101",
                    "reco_type": "profile_to_items",
                    "scenario": {
                        "scenario_type": "case",
                        "case": {
                            "filters": [{"property_name": "year", "op": "eq", "value": 1988}],
                            "reranking": [{"property_name": "genres", "op": "diversity", "weight": 0.25}],
                            "exclude_rated_items": false,
                            "algorithms": "algo105|algo106",
                            "candidates_preselection": {
                                "method": "knn",
                                "params": {"algorithms": ["algo103"]}
                            }
                        }
                    }
                }, {
                    "name": "my_scenar_ab",
                    "reco_type": "profile_to_items",
                    "scenario": {
                        "scenario_type": "ab_test",
                        "ab_test": {
                            "id": "my_ab_test",
                            "scenario_a": "scenar1",
                            "scenario_b": "scenar2"
                        }
                    }
                }, {
                    "name": "my_condition_scenar",
                    "reco_type": "profile_to_items",
                    "scenario": {
                        "scenario_type": "condition",
                        "condition": {
                            "condition_type": "user_function",
                            "if": {"function_name": "n_ratings", "op": "gte", "value": 5},
                            "then": "scenario1",
                            "else": "scenario2"
                        }
                    },
                }, {
                    "scenario_type": "alias",
                    "alias": {
                        "scenario_name": "my_favourite_scenario"
                    }
                }
            ]
        }
        globalThis.fetch.getOnce(opts.host + '/v1/scenarios/', expectedResponse);
        const current = await api.getAllScenarios();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getDefaultScenario', async () => {
        const expectedResponse = {
            "name": "scenario_109"
        }
        globalThis.fetch.getOnce(opts.host + '/v1/scenarios-default/item-to-item/', expectedResponse);
        const current = await api.getDefaultScenario('item-to-item');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('setDefaultScenario', async () => {
        const expectedResponse = {}
        globalThis.fetch.patchOnce(opts.host + '/v1/scenarios-default/item-to-item/', expectedResponse);
        const current = await api.setDefaultScenario('item-to-item', 'my-case-scenario');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('unsetDefaultScenario', async () => {
        const expectedResponse = {}
        globalThis.fetch.deleteOnce(opts.host + '/v1/scenarios-default/item-to-item/', expectedResponse);
        const current = await api.unsetDefaultScenario('item-to-item', 'my-case-scenario');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
