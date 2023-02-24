const fetchMockJest = require('fetch-mock-jest')

module.exports = () => globalThis.fetch = fetchMockJest.sandbox()
