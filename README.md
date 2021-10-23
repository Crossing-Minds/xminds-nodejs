# Xminds-Node.JS API

The Node JS client SDK is a lightweight library that allows you to integrate Crossing Minds into your website using a `refresh_token`. 

It is based on the Crossing Minds B2B API and will have access to the three types of recommendation endpoints:
- profile-to-items recommendations (requires user_id)
- session-to-items recommendations (does not require user_id)
- item-to-items recommendations (does not require user_id)


As well as managing user/item ratings or interactions, such as:
- create new interaction e.g. add one purchase (requires user_id)
- get items and users



## Installation

With NPM:
```
npm install xminds-sdk-nodejs
```

## Compile
```
npm run build
```

## Usage

**In Node.js**

```js
const { ApiClient } = require("xminds-sdk-nodejs");
```

## Examples

**Initializing the client**
```js
import {ApiClient} from "xminds-sdk-nodejs";

// comes from the backend, and is linked to db_id and userId
const refreshToken = "/lDHAxJIFwGg02B3Z8m1XA/RtqgoWRONGceS/kmJfe8p++50hOBJnyaqjrU8pPGmFmCvSxk6JPdxTg==";
// To identify the origin of the requests
const userAgent = "CUSTOM_USER_AGENT" // OPTIONAL parameter. e.g.: 'Shopify/SHOP_NAME'
// if it is null it will use production host
const host = "https://staging-api.crossingminds.com"; // OPTIONAL parameter

// Initialize the client instance
const client = new ApiClient(refreshToken, userAgent, host);
// const client = new ApiClient(refreshToken, userAgent);
// const client = new ApiClient(refreshToken);
```

**Fetching recommendations**
```js
// 1.- Get Profile-Based Items Recommendations

// Params
const amt = 5
const filters = [
    { "property_name": "year", "op": "gt", "value": 2000 }
];
// a) Get items recommendations given a user ID.
client.getRecommendationsUserToItems("192251", amt, null, filters, false)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });


// 2.- Get Session-Based Items Recommendations
// ***** Ratings and Interactions are mutually exclusive *****

// Params
const amt = 10
const cursor = null
const filters = [
    {"property_name": "tags", "op": "in", "value": ["family", "fiction"]},
    {"property_name": "poster", "op": "notempty"},
]
const user_properties = { "age": 25 }
const excludeRatedItems = undefined // enable default value (false)
const reranking = null
const scenario = null
const skipDefaultScenario = undefined // enable default value (false)

    // a) Example with Interactions
    const ratings = null
    const interactions = [
        {
            "item_id": "123e4567-e89b-12d3-a456-426614174000",
            "interaction_type": "like",
            "timestamp": 1632759339.123
        },
        {
            "item_id": "c3391d83-553b-40e7-818e-fcf658ec397d",
            "interaction_type": "dislike",
            "timestamp": 1632759339.123
        }
    ]
    // Get items recommendations given the ratings or interactions of an anonymous session.
    client.getRecommendationsSessionToItems(amt, cursor, filters, ratings, userProperties, 
        excludeRatedItems, interactions, reranking, scenario, skipDefaultScenario)
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.log(err);
        });

    // b) Example with Ratings
    const interactions = null
    const ratings = "ratings": [
        {"item_id": "123e4567-e89b-12d3-a456-426614174000", "rating": 8.5},
        {"item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "rating": 2.0}
    ]
    // Get items recommendations given the ratings or interactions of an anonymous session.
    client.getRecommendationsSessionToItems(amt, cursor, filters, ratings, userProperties, 
        excludeRatedItems, interactions, reranking, scenario, skipDefaultScenario)
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.log(err);
        });
```

**Fetching users**
```js
// Get one user given its ID.
client.getUser("192251")
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });

// Get multiple users given their IDs.
client.listUsers(usersId)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });
```

**Fetching items**
```js
// Get one item given its ID.
client.getItem("031242227X")
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });

// Get multiple items given their IDs.
client.listItems(itemsId)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });
```

**Creating interactions**
```js
// Create a new interaction for a user and an item
const userId = "192251"
const itemId = "031242227X"
const interactionType = "ProductAction/ADD_TO_CART"
client.createInteraction(userId, itemId, interactionType, null)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });

// Create or update large bulks of interactions for a user and many items
const userId = "192251"
const interactions = [
    {"item_id": "123e4567-e89b-12d3-a456-426614174000", "interaction_type": "productView", "timestamp": 1588812345},
    {"item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "productView", "timestamp": 1588854321},
    {"item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "interaction_type": "addToCart", "timestamp": 1588866349}
]
client.createOrUpdateUserInteractionsBulk(userId, interactions)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });
```

**Creating/Updating user ratings in bulk**
```js
const ratings = [
    {"item_id": "123e4567-e89b-12d3-a456-426614174000", "rating": 8.5, "timestamp": 1588812345},
    {"item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "rating": 2.0, "timestamp": 1588854321}
]
const userId = "192251"

// Create or update ratings for a user in bulk
client.createOrUpdateUserRatingsBulk(userId, ratings)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });
```

**Fetching user ratings**
```js
const userId = "192251";
const page = 1;
const amount = 10;

// List the ratings of one user.
client.listUserRatings(userId, page, amount)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });
```

## Documentation

[API documentation](https://docs.api.crossingminds.com/index.html)

Release version: 1.0.0
