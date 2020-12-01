require('jest-fetch-mock');
const fetchMock = require('fetch-mock');
jest.setMock('node-fetch', fetchMock);
const { ApiClient } = require("../lib/ApiClient");
const querystring = require('querystring');

// ITEM-DATA-PROPERTIES ENDPOINTS
describe('ITEM-DATA-PROPERTIES TESTS', () => {
    const host = "http://localhost";
    const api = new ApiClient(host);
    const headers = {
        'User-Agent': 'CrossingMinds/v1',
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer '
    }

    test('getItemProperty', async () => {
        const expectedResponse = { property_name: 'price', value_type: 'int8', repeated: false }
        fetchMock.getOnce(host + '/items-properties/price/', expectedResponse, { headers: headers });
        const current = await api.getItemProperty("price");
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listAllItemProperties', async () => {
        const expectedResponse = {
            properties: [
                {
                    property_name: "price",
                    value_type: "float32",
                    repeated: false
                },
                {
                    property_name: "tags",
                    value_type: "unicode32",
                    repeated: true
                },
                {
                    property_name: "genres",
                    value_type: "unicode16",
                    repeated: true
                }
            ]
        }
        fetchMock.getOnce(host + '/items-properties/', expectedResponse, { headers: headers });
        const current = await api.listAllItemProperties();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createItemProperty', async () => {
        const expectedResponse = {}
        fetchMock.postOnce(host + '/items-properties/', expectedResponse, { headers: headers });
        const current = await api.createItemProperty('price', 'float32', false);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteItemProperty', async () => {
        const expectedResponse = {}
        fetchMock.deleteOnce(host + '/items-properties/price/', expectedResponse, { headers: headers });
        const current = await api.deleteItemProperty('price');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('getItem', async () => {
        const expectedResponse = {
            property_name: "price",
            value_type: "float32",
            repeated: false
        }
        fetchMock.getOnce(host + '/items/123e4567-e89b-12d3-a456-426614174000/', expectedResponse, { headers: headers });
        const current = await api.getItem('123e4567-e89b-12d3-a456-426614174000');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateItem', async () => {
        const expectedResponse = {}
        const item = {
            item: {
                tags: ["family", "sci-fi"],
                genres: ["drama", "comedy"],
                price: 9.99
            }
        }
        fetchMock.putOnce(host + '/items/123e4567-e89b-12d3-a456-426614174000/', expectedResponse, { headers: headers });
        const current = await api.createOrUpdateItem('123e4567-e89b-12d3-a456-426614174000', item);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createOrUpdateItemsBulk', async () => {
        const expectedResponse = {}
        const items = [
            {
                item_id: "123e4567-e89b-12d3-a456-426614174000",
                price: 9.99,
                tags: ["family", "sci-fi"],
                genres: ["drama", "comedy"]
            },
            {
                item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
                price: 4.49,
                tags: ["family"],
                genres: ["thriller"]
            }
        ]
        fetchMock.putOnce(host + '/items-bulk/', expectedResponse, { headers: headers });
        const current = await api.createOrUpdateItemsBulk(items);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listItemsPaginated', async () => {
        const expectedResponse = {
            items: [
                {
                    item_id: "123e4567-e89b-12d3-a456-426614174000",
                    price: 9.99,
                    tags: ["family", "sci-fi"],
                    genres: ["drama", "comedy"]
                },
                {
                    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
                    price: 4.49,
                    tags: ["family"],
                    genres: ["thriller"]
                }
            ],
            has_next: true,
            next_cursor: "Q21vU1pHb1FjSEp..."
        }
        let queryParams = {}
        queryParams['amt'] = 100;
        queryParams['cursor'] = 'Q21vU1pHb1FjSEp...';
        let path = '/items-bulk/?' + querystring.stringify(queryParams);
        fetchMock.getOnce(host + path, expectedResponse, { headers: headers });
        const current = await api.listItemsPaginated(100, 'Q21vU1pHb1FjSEp...');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('listItems', async () => {
        const expectedResponse = {
            items: [
                {
                    item_id: "123e4567-e89b-12d3-a456-426614174000",
                    price: 9.99,
                    tags: ["family", "sci-fi"],
                    genres: ["drama", "comedy"]
                },
                {
                    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
                    price: 4.49,
                    tags: ["family"],
                    genres: ["thriller"]
                }
            ]
        }
        const itemsId = [
            "123e4567-e89b-12d3-a456-426614174000",
            "c3391d83-553b-40e7-818e-fcf658ec397d"
        ]
        fetchMock.postOnce(host + '/items-bulk/list/', expectedResponse, { headers: headers });
        const current = await api.listItems(itemsId);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
