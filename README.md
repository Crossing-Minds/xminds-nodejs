# Xminds-Node.JS API

Node.JS client for Crossing Minds B2B API

## Requirements

NodeJs 14+

## Installation

```shell
npm install xminds-nodejs --save
```

## Running Unit Tests

```shell
npm test -- -u --coverage
```

## Usage

1) using Promises
```js
const { ApiClient } = require("./ApiClient");

api.listAllAccounts()
    .then(data => {
	console.log(data)
    })
    .catch(err => {
        console.log(err);
    });
```

2) using ES modules and async/await


```js
const { ApiClient } = require("./ApiClient");

(async () => {
    const accounts = await api.listAllAccounts();
    console.log(accounts);
})();
```

## Design considerations

...
