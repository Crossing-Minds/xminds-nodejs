require("node-fetch");
const { ServerError, parseError } = require("./XMindError");

// Constants values
const API_VERSION = 'v1'
const DEFAULT_TIMEOUT = 6;

/**
 * This module implements the low level request logic of Crossing Minds API:
 * headers and JTW token autentication
 * serialization/deserialization JSON-JS Object
 * translation from HTTP status code to XMindError
 */
class XMindRequest {

  /**
   * Basic constructor
   * 
   * @param {String} basePath 
   */
  constructor(basePath) {
    this.basePath = basePath ? basePath : "https://api.crossingminds.com";
  }

  /**
   * Store the jwtToken
   */
  #jwtToken = '';

  getHeaders() {
    return {
      'User-Agent': 'CrossingMinds/' + API_VERSION,
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.#jwtToken
    }
  }

  getConfig(options) {
    return {
      "headers": this.getHeaders(),
      ...options
    }
  }

  getUrl(endpoint) {
    return this.basePath + endpoint;
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

  get(endpoint = "", timeout = DEFAULT_TIMEOUT) {
    let options = {
      method: 'GET',
      timeout: (timeout * 1000)
    }
    return this.call(endpoint, this.getConfig(options));
  }

  post(endpoint = "", body = {}, timeout = DEFAULT_TIMEOUT) {
    let options = {
      method: 'POST',
      body: JSON.stringify(body),
      timeout: (timeout * 1000)
    }
    return this.call(endpoint, this.getConfig(options));
  }

  put(endpoint = "", body = {}, timeout = DEFAULT_TIMEOUT) {
    let options = {
      method: 'PUT',
      body: JSON.stringify(body),
      timeout: (timeout * 1000)
    }
    return this.call(endpoint, this.getConfig(options));
  }

  delete(endpoint = "", body = {}, timeout = DEFAULT_TIMEOUT) {
    let options = {
      method: 'DELETE',
      body: JSON.stringify(body),
      timeout: (timeout * 1000)
    }
    return this.call(endpoint, this.getConfig(options));
  }

  call(endpoint, config) {
    return fetch(this.getUrl(endpoint), config)
      .then(this.checkStatus)
      .catch(err => {
        throw err;
      });
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
