const fetch = require("node-fetch");
const { ServerError, XMindError, parseError } = require("./XMindError");

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
      'User-Agent' : 'CrossingMinds/1.0',
      'Content-type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.#jwtToken
    }
  }

  getConfig(options) {
    return {
      "headers" : this.getHeaders(),
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

  get(endpoint = "") {
    let options = {
      method: 'GET'
    }
    return this.call(endpoint, this.getConfig(options));
  }

  post(endpoint = "", body = {}) {
    let options = {
      method: 'POST',
      body: JSON.stringify(body)
    }
    return this.call(endpoint, this.getConfig(options));
  }

  put(endpoint = "", body = {}) {
    let options = {
      method: 'PUT',
      body: JSON.stringify(body)
    }
    return this.call(endpoint, this.getConfig(options));
  }

  delete(endpoint = "", body = {}) {
    let options = {
      method: 'DELETE',
      body: JSON.stringify(body)
    }
    return this.call(endpoint, this.getConfig(options));
  }

  call(endpoint, config) {
    return fetch(this.getUrl(endpoint), config)
    .then(response => {
      return response.text()
      .then((text) => {
        var responseBody = (text && text!=='') ? JSON.parse(text) : {};
        if(response.status >= 500) {
          throw new ServerError(responseBody);
        } else if(response.status >= 400) {
          return parseError(responseBody);
        }
        return this.handleResponse(response, responseBody);
      })
    }).catch(err => {
      throw err;
    });
  }

  handleResponse(response, responseBody) {
    return response.ok ? responseBody : parseError(responseBody);
  }

}

module.exports.XMindRequest = XMindRequest;
