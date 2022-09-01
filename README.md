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
import { ApiClient } from "xminds-sdk-nodejs";

// Optional parameters
const opts = {
  host: "https://staging-api.crossingminds.com",
  userAgent: "CUSTOM_USER_AGENT", // To identify the origin of the requests. e.g.: 'Shopify/SHOP_NAME'
  refreshToken:
    "wUiVkYKGssmYnoH7C1ydxnrcML1T/6e2ip3YMCHagtxPJa1xARva0f4am2fo3aixo0+cd4+dIivIURMZzfvcRg==", // comes from the backend, and is linked to db_id and userId. If it is null it will use production host
};

// Initialize the client instance
const client = new ApiClient(opts);
// const client = new ApiClient(); // Default
```

**Fetching recommendations**

```js
// 1.- Get Profile-Based Items Recommendations

// Optional parameters
const opts = {
    amt: 5,
    filters: [
        { "property_name": "year", "op": "gt", "value": 2000 }
    ],
    exclude_rated_items: false
}

// a) Get items recommendations given a user ID.
client.getRecommendationsUserToItems("192251", opts)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });


// 2.- Get Session-Based Items Recommendations
// ***** Ratings and Interactions are mutually exclusive *****

// a) Example with Interactions

// Optional parameters
const opts = {
    amt: 10,
    filters: [
        {"property_name": "tags", "op": "in", "value": ["family", "fiction"]},
        {"property_name": "poster", "op": "notempty"},
    ],
    user_properties: { "age": 25 },
    interactions = [
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
}

// Get items recommendations given the ratings or interactions of an anonymous session.
client.getRecommendationsSessionToItems(opts)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });


// b) Example with Ratings

// Optional parameters
const opts = {
    amt: 10,
    filters: [
        {"property_name": "tags", "op": "in", "value": ["family", "fiction"]},
        {"property_name": "poster", "op": "notempty"},
    ],
    user_properties: { "age": 25 },
    ratings: [
        {"item_id": "123e4567-e89b-12d3-a456-426614174000", "rating": 8.5},
        {"item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "rating": 2.0}
    ]
}

// Get items recommendations given the ratings or interactions of an anonymous session.
client.getRecommendationsSessionToItems(opts)
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });


// c) Example with session Id

// Optional parameters
const opts = {
    amt: 10,
    filters: [
        {"property_name": "tags", "op": "in", "value": ["family", "fiction"]},
        {"property_name": "poster", "op": "notempty"},
    ],
    user_properties: { "age": 25 },
    ratings: [
        {"item_id": "123e4567-e89b-12d3-a456-426614174000", "rating": 8.5},
        {"item_id": "c3391d83-553b-40e7-818e-fcf658ec397d", "rating": 2.0}
    ],
    session_id: "c2a73584-bbd0-4f04-b497-26bf70152932"
}

// Get items recommendations given the ratings for a specific session.
client.getRecommendationsSessionToItems(opts)
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
client
  .getUser("192251")
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

// Get multiple users given their IDs.
client
  .listUsers(usersId)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
```

**Fetching items**

```js
// Get one item given its ID.
client
  .getItem("031242227X")
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

// Get multiple items given their IDs.
client
  .listItems(itemsId)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
```

**Creating interactions**

```js
// Examples for User Interactions

// Create a new interaction for a user and an item
const userId = "192251";
const itemId = "031242227X";
const interactionType = "ProductAction/ADD_TO_CART";
client
  .createInteraction(userId, itemId, interactionType, null)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

// Create large bulks of interactions for a user and many items
const userId = "192251";
const interactions = [
  {
    item_id: "123e4567-e89b-12d3-a456-426614174000",
    interaction_type: "productView",
    timestamp: 1588812345,
  },
  {
    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
    interaction_type: "productView",
    timestamp: 1588854321,
  },
  {
    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
    interaction_type: "addToCart",
    timestamp: 1588866349,
  },
];
client
  .createUserInteractionsBulk(userId, interactions)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

// Examples for Anonymous Session Interactions

// Create a new interaction for an anonymous session and an item
const sessionId = "1234";
const itemId = "c3391d83-553b-40e7-818e-fcf658ec397d";
const interactionType = "productView";
const timestamp = 1588812345;
client
  .createAnonymousSessionInteraction(
    sessionId,
    itemId,
    interactionType,
    timestamp
  )
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

// Create large bulks of interactions for an anonymous session and many items
const sessionId = "1234";
const interactions = [
  {
    item_id: "123e4567-e89b-12d3-a456-426614174000",
    interaction_type: "productView",
    timestamp: 1588812345,
  },
  {
    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
    interaction_type: "productView",
    timestamp: 1588854321,
  },
  {
    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
    interaction_type: "addToCart",
    timestamp: 1588866349,
  },
];
client
  .createAnonymousSessionInteractionsBulk(sessionId, interactions)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

// Create large bulks of interactions for many anonymous sessions and many items.
const interactions = [
  {
    session_id: 1234,
    item_id: "123e4567-e89b-12d3-a456-426614174000",
    interaction_type: "productView",
    timestamp: 1588812345,
  },
  {
    session_id: 1234,
    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
    interaction_type: "productView",
    timestamp: 1588854321,
  },
  {
    session_id: 333,
    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
    interaction_type: "addToCart",
    timestamp: 1588811111,
  },
];
client
  .createAnonymousSessionsInteractionsBulk(interactions)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
```

**Creating/Updating user ratings in bulk**

```js
const ratings = [
  {
    item_id: "123e4567-e89b-12d3-a456-426614174000",
    rating: 8.5,
    timestamp: 1588812345,
  },
  {
    item_id: "c3391d83-553b-40e7-818e-fcf658ec397d",
    rating: 2.0,
    timestamp: 1588854321,
  },
];
const userId = "192251";

// Create or update ratings for a user in bulk
client
  .createOrUpdateUserRatingsBulk(userId, ratings)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
```

**Fetching user ratings**

```js
const userId = "192251";
const page = 1;
const amount = 10;

// List the ratings of one user.
client
  .listUserRatings(userId, page, amount)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
```

**Retrying requests on failure**

A retry policy is provided for use in some SDK methods, it is implemented with the exponential backoff strategy.

The exponential attempt increment is calculated with _Math.pow(multiplier, attempt) \* base_

Optional parameters can be send to replace the default values.

**Note:** Only error 429 is retried.

```js
// Example of using retry with custom values
opts = {
  retry: {
    // Optional. If not present, the default values are used
    maxRetries: 2, // Optional. Default value: 3
    base: 200, // Optional. Default value: 100
    multiplier: 2, // Optional. Default value: 5
  },
};

// opts parameter is Optional if not present, default values are used to retry
client
  .createOrUpdateItem(itemId, item, opts)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
```

Automatic retry can be skipped by providing the parameter as **`opts.retry.maxRetries = 0`**

```js
// Example of skipping retry
opts = {
  retry: {
    maxRetries: 0, // Will skip the retry policy
  },
};

client
  .createOrUpdateItem(itemId, item, opts)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
```

## Documentation

[API documentation](https://docs.api.crossingminds.com/index.html)

