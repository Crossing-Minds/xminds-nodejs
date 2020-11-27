const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);
const { ApiClient } = require("../lib/ApiClient");

// RECOMMENDATIONS ENDPOINTS
describe('RECOMMENDATIONS TESTS', () => {
    const api = ApiClient.instance;
  
    test('getRecommendationsItemToItems', async () => {
        const expectedResponse = {
            "items_id": [
                "c3391d83-553b-40e7-818e-fcf658ec397d",
                "c2a73584-bbd0-4f04-b497-26bf70152932"
            ],
            "next_cursor": "HLe-e1Sq..."
        }
        const filters = [
            {"property_name": "price", "op": "lt", "value": 10},
            {"property_name": "genres", "op": "eq", "value": "drama"}
        ]
        const amt = 10;
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.getRecommendationsItemToItems("c3391d83-553b-40e7-818e-fcf658ec397d", filters, amt, "Q21vU1pHb1FjSEp...");
    
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
            {"item_id": "123e4567-e89b-12d3-a456-426614174000", "rating": 8.5},
            {"item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "rating": 2.0}
        ]
        const userProperties = {
            "subscriptions": ["channel1", "channel2"],
            "age": 25
        }
        const amt = 10;
        const filters = [
            {"property_name": "price", "op": "lt", "value": 10},
            {"property_name": "genres", "op": "eq", "value": "drama"},
            {"property_name": "tags", "op": "in", "value": ["family", "fiction"]},
            {"property_name": "poster", "op": "notempty"},
        ]
        const excludeRatedItems = true;
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.getRecommendationsSessionToItems(ratings, userProperties, filters, excludeRatedItems, amt, "Q21vU1pHb1FjSEp...");
    
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
            {"property_name": "price", "op": "lt", "value": 10},
            {"property_name": "genres", "op": "eq", "value": "drama"},
            {"property_name": "tags", "op": "in", "value": ["family", "fiction"]},
            {"property_name": "poster", "op": "notempty"}
        ]
        const userId = "c3391d83-553b-40e7-818e-fcf658ec397d";
        const excludeRatedItems = true;
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.getRecommendationsUserToItems(userId, filters, excludeRatedItems, amt, "Q21vU1pHb1FjSEp...");
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

});
