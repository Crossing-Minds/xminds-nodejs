require("isomorphic-fetch");
const { ServerError, parseError } = require("./XMindError");
const packageFile = require('../package.json');

// Constants values
const PKG_VERSION = ' ' + packageFile.name + '/' + packageFile.version;
const API_VERSION = 'v1';
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

  getConfig(options) {
    return {
      "headers": this.getHeaders(),
      ...options
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

  async call(endpoint, config) {
    const response = await fetch(this.getUrl(endpoint), config);
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
