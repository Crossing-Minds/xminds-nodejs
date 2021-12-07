require('es6-promise').polyfill();

const originalFetch = require('isomorphic-fetch');
var fetch = require('fetch-retry')(originalFetch);

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

  getParams(params) {
    return {
      "headers": this.getHeaders(),
      ...params
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

  get(endpoint = "", opts = {}) {
    let params = {
      method: 'GET',
      timeout: ((opts.timeout || DEFAULT_TIMEOUT) * 1000)
    }
    if (opts.retry && opts.retry.maxRetries == 0)
      return this.call(endpoint, this.getParams(params));
    else
      return this.callWithRetry(endpoint, this.getParams(params), opts.retry);
  }

  post(endpoint = "", body = {}, opts = {}) {
    let params = {
      method: 'POST',
      body: JSON.stringify(body),
      timeout: ((opts.timeout || DEFAULT_TIMEOUT) * 1000)
    }
    return this.call(endpoint, this.getParams(params));
  }

  put(endpoint = "", body = {}, opts = {}) {
    let params = {
      method: 'PUT',
      body: JSON.stringify(body),
      timeout: ((opts.timeout || DEFAULT_TIMEOUT) * 1000)
    }
    if (opts.retry && opts.retry.maxRetries == 0)
      return this.call(endpoint, this.getParams(params));
    else
      return this.callWithRetry(endpoint, this.getParams(params), opts.retry);
  }

  delete(endpoint = "", body = {}, opts = {}) {
    let params = {
      method: 'DELETE',
      body: JSON.stringify(body),
      timeout: ((opts.timeout || DEFAULT_TIMEOUT) * 1000)
    }
    return this.call(endpoint, this.getParams(params));
  }

  async call(endpoint, config) {
    const response = await fetch(this.getUrl(endpoint), config);
    return this.checkStatus(response);
  }

  async callWithRetry(endpoint, config, retryOptions = {}) {
    const maxRetries = retryOptions.maxRetries || 3; // Default is 3
    const base = retryOptions.base || 100; // Default is 100ms
    const multiplier = retryOptions.multiplier || 5; // Default is 5
    const response = await fetch(this.getUrl(endpoint),
      {
        ...config,
        ...{
            retryOn: [429], // Errors to be retried
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
