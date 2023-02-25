const fetchRetry = require('fetch-retry');

const network = {
  /* assigned lazily to give jest an opportunity to patch */
  get fetchWithRetry() {
    if (typeof globalThis === 'undefined' || typeof globalThis.fetch !== 'function') {
      throw Error('fetch is not defined. Please install a fetch polyfill such as https://www.npmjs.com/package/node-fetch');
    }

    return fetchRetry(globalThis.fetch)
  }
};

const { ServerError, parseError } = require("./XMindsError");
const packageFile = require('../package.json');

// Constants values
const PKG_VERSION = ' ' + packageFile.name + '/' + packageFile.version;
const API_VERSION = 'v1';
const DEFAULT_TIMEOUT = 6;

/**
 * This module implements the low level request logic of Crossing Minds API:
 * headers and JTW token autentication
 * serialization/deserialization JSON-JS Object
 * translation from HTTP status code to XMindsError
 */
class XMindRequest {

  /**
   * Basic constructor
   * 
   * @param {String} host 
   */
  constructor(host, userAgent = null) {
    this.host = host ? host : "https://api.crossingminds.com";
    this.userAgent = userAgent ? ' ' + userAgent : '';
  }

  /**
   * Store the jwtToken
   */
  #jwtToken = '';

  getHeaders() {
    return {
      'User-Agent': 'CrossingMinds/' + API_VERSION + PKG_VERSION + this.userAgent,
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.#jwtToken
    }
  }

  getParams(method, body, opts) {
    return {
      headers: this.getHeaders(),
      method: method,
      body: JSON.stringify(body),
      timeout: ((opts.timeout || DEFAULT_TIMEOUT) * 1000)
    }
  }

  getUrl(path) {
    return this.host + '/' + API_VERSION + path;
  }

  setJwtToken(jwtToken) {
    this.#jwtToken = jwtToken;
  }

  clearJwtToken() {
    this.#jwtToken = '';
  }

  getJwtToken() {
    return this.#jwtToken;
  }

  get(endpoint, opts = {}) {
    let params = {
      headers: this.getHeaders(),
      method: 'GET',
      timeout: ((opts.timeout || DEFAULT_TIMEOUT) * 1000)
    }
    if (opts.retry && opts.retry.maxRetries == 0)
      return this.call(endpoint, params);
    else
      return this.callWithRetry(endpoint, params, opts.retry, [500, 503]);
  }

  post(endpoint, body = {}, opts = {}) {
    if (opts.retry && opts.retry.maxRetries == 0)
      return this.call(endpoint, this.getParams("POST", body, opts));
    else
      return this.callWithRetry(endpoint, this.getParams("POST", body, opts), opts.retry);
  }

  put(endpoint, body = {}, opts = {}) {
    if (opts.retry && opts.retry.maxRetries == 0)
      return this.call(endpoint, this.getParams("PUT", body, opts));
    else
      return this.callWithRetry(endpoint, this.getParams("PUT", body, opts), opts.retry, [500, 503]);
  }

  delete(endpoint, body = {}, opts = {}) {
    if (opts.retry && opts.retry.maxRetries == 0)
      return this.call(endpoint, this.getParams("DELETE", body, opts));
    else
      return this.callWithRetry(endpoint, this.getParams("DELETE", body, opts), opts.retry);
  }

  patch(endpoint, body = {}, opts = {}) {
    if (opts.retry && opts.retry.maxRetries == 0)
      return this.call(endpoint, this.getParams("PATCH", body, opts));
    else
      return this.callWithRetry(endpoint, this.getParams("PATCH", body, opts), opts.retry, [500, 503]);
  }

  async call(endpoint, config) {
    const response = await network.fetchWithRetry(this.getUrl(endpoint), config);
    return this.checkStatus(response);
  }

  async callWithRetry(endpoint, config, retryOptions = {}, errors = []) {
    const maxRetries = retryOptions.maxRetries || 3; // Default is 3
    const base = retryOptions.base || 100; // Default is 100ms
    const multiplier = retryOptions.multiplier || 5; // Default is 5
    const retryOnErrors = [...errors, 429];
    const response = await network.fetchWithRetry(this.getUrl(endpoint),
      {
        ...config,
        ...{
            retryOn: retryOnErrors, // Errors to be retried
            retries: maxRetries,
            retryDelay: function(attempt) {
              return Math.pow(multiplier, attempt) * base; // Default: 0.1 * (1 + 5 + 25) = 3.1sec
            }
        }
      }
    );
    return this.checkStatus(response);
  }

  checkStatus(response) {
    return response.text()
      .then(text => {
        var responseBody = (text && text !== '') ? JSON.parse(text) : {};
        if (response.ok) {
          return responseBody;
        } else {
          if (response.status >= 500) {
            throw new ServerError(responseBody);
          } else if (response.status >= 400) {
            return parseError(responseBody);
          }
        }
      })
  }


}

module.exports.XMindRequest = XMindRequest;
