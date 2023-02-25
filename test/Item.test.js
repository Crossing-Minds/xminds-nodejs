const { ApiClient } = require("../lib/ApiClient");
const utils = require('../lib/Utils');
require('./mockFetch')();

// ITEM-DATA-PROPERTIES ENDPOINTS
describe('ITEM-DATA-PROPERTIES TESTS', () => {
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

    test('getItemProperty', async () => {
        const expectedResponse = { property_name: 'price', value_type: 'int8', repeated: false }
        globalThis.fetch.getOnce(opts.host + '/v1/items-properties/price/', expectedResponse);
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
        globalThis.fetch.getOnce(opts.host + '/v1/items-properties/', expectedResponse);
        const current = await api.listAllItemProperties();
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('createItemProperty', async () => {
        const expectedResponse = {}
        globalThis.fetch.postOnce(opts.host + '/v1/items-properties/', expectedResponse);
        const current = await api.createItemProperty('price', 'float32', false);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteItemProperty', async () => {
        const expectedResponse = {}
        globalThis.fetch.deleteOnce(opts.host + '/v1/items-properties/price/', expectedResponse);
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
        globalThis.fetch.getOnce(opts.host + '/v1/items/123e4567-e89b-12d3-a456-426614174000/', expectedResponse);
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
        globalThis.fetch.putOnce(opts.host + '/v1/items/123e4567-e89b-12d3-a456-426614174000/', expectedResponse);
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
        globalThis.fetch.putOnce(opts.host + '/v1/items-bulk/', expectedResponse);
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
        let path = '/v1/items-bulk/' + utils.convertToQueryString(queryParams);
        globalThis.fetch.getOnce(opts.host + path, expectedResponse);
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
        globalThis.fetch.postOnce(opts.host + '/v1/items-bulk/list/', expectedResponse);
        const current = await api.listItems(itemsId);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteItem', async () => {
        const expectedResponse = {}
        globalThis.fetch.deleteOnce(opts.host + '/v1/items/123e4567-e89b-12d3-a456-426614174000/', expectedResponse);
        const current = await api.deleteItem('123e4567-e89b-12d3-a456-426614174000');
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('deleteItemsBulk', async () => {
        const expectedResponse = {}
        const itemsId = [
            "123e4567-e89b-12d3-a456-426614174000",
            "c3391d83-553b-40e7-818e-fcf658ec397d"
        ]
        globalThis.fetch.deleteOnce(opts.host + '/v1/items-bulk/', expectedResponse);
        const current = await api.deleteItemsBulk(itemsId);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('partialUpdateItem', async () => {
        const expectedResponse = {}
        const item = {
            item: {
                tags: ["family", "sci-fi"],
                genres: ["drama", "comedy"],
                price: 9.99
            }
        }
        globalThis.fetch.patchOnce(opts.host + '/v1/items/123e4567-e89b-12d3-a456-426614174000/', expectedResponse, { overwriteRoutes: false });
        const current = await api.partialUpdateItem('123e4567-e89b-12d3-a456-426614174000', item);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

    test('partialUpdateItemsBulk', async () => {
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
        globalThis.fetch.patchOnce(opts.host + '/v1/items-bulk/', expectedResponse, { overwriteRoutes: false });
        const current = await api.partialUpdateItemsBulk(items);
        expect(current).toEqual(expectedResponse);
        expect(current).toMatchSnapshot();
    });

});
