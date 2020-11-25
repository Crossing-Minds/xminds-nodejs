const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);
const { ApiClient } = require("../lib/ApiClient");

// ITEM-DATA-PROPERTIES ENDPOINTS
describe('ITEM-DATA-PROPERTIES TESTS', () => {
    const api = ApiClient.instance;
  
    test('getItemProperty', async () => {
      const expectedResponse = { property_name: 'age', value_type: 'int8', repeated: false }
      fetch.mockResponse(JSON.stringify(expectedResponse));
      const current = await api.getItemProperty("age");
  
      expect(current).toEqual(expectedResponse);
      expect(current).toMatchSnapshot();
    });

    test('listAllItemProperties', async () => {
        const expectedResponse = {
            "properties": [
                {
                    "property_name": "price",
                    "value_type": "float32",
                    "repeated": false
                },
                {
                    "property_name": "tags",
                    "value_type": "unicode32",
                    "repeated": true
                },
                {
                    "property_name": "genres",
                    "value_type": "unicode16",
                    "repeated": true
                }
            ]
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.listAllItemProperties();
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
      });

    test('createItemProperty', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.createItemProperty('price', 'float32', false);
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteItemProperty', async () => {
        const expectedResponse = {}
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.deleteItemProperty('price');
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getItem', async () => {
        const expectedResponse = {
            "property_name": "price",
            "value_type": "float32",
            "repeated": false
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.getItem('123e4567-e89b-12d3-a456-426614174000');
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateItem', async () => {
        const expectedResponse = {}
        const item = {
            "item": {
                "tags": ["family", "sci-fi"],
                "genres": ["drama", "comedy"],
                "price": 9.99
            }
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.createOrUpdateItem('123e4567-e89b-12d3-a456-426614174000', item);
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateItemsBulk', async () => {
        const expectedResponse = {}
        const items = [
            {
                "item_id": "123e4567-e89b-12d3-a456-426614174000",
                "price": 9.99,
                "tags": ["family", "sci-fi"],
                "genres": ["drama", "comedy"]
            },
            {
                "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d",
                "price": 4.49,
                "tags": ["family"],
                "genres": ["thriller"]
            }
        ]
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.createOrUpdateItemsBulk(items);
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listItemsPaginated', async () => {
        const expectedResponse = {
            "items": [
                {
                    "item_id": "123e4567-e89b-12d3-a456-426614174000",
                    "price": 9.99,
                    "tags": ["family", "sci-fi"],
                    "genres": ["drama", "comedy"]
                },
                {
                    "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d",
                    "price": 4.49,
                    "tags": ["family"],
                    "genres": ["thriller"]
                }
            ],
            "has_next": true,
            "next_cursor": "Q21vU1pHb1FjSEp..."
        }
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.listItemsPaginated(100, 'Q21vU1pHb1FjSEp...');
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listItems', async () => {
        const expectedResponse = {
            "items": [
                {
                    "item_id": "123e4567-e89b-12d3-a456-426614174000",
                    "price": 9.99,
                    "tags": ["family", "sci-fi"],
                    "genres": ["drama", "comedy"]
                },
                {
                    "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d",
                    "price": 4.49,
                    "tags": ["family"],
                    "genres": ["thriller"]
                }
            ]
        }
        const itemsId = [
            "123e4567-e89b-12d3-a456-426614174000",
            "c3391d83-553b-40e7-818e-fcf658ec397d"
        ]
        fetch.mockResponse(JSON.stringify(expectedResponse));
        const current = await api.listItems(itemsId);
    
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
