const { XMindRequest } = require('./ApiRequest');
const { JwtTokenExpiredError } = require('./XMindsError');
const utils = require('./Utils');

class ApiClient {

  /**
   * Basic constructor
   * 
   * @param {Map<String, String>} opts Optional parameters The authentication options.
   * 
   *  {
        host: String,
        userAgent: String,
        refreshToken: String
      }
   */
  constructor(opts = null) {
    const { host, userAgent, refreshToken } = opts || {};
    this.#request = new XMindRequest(host, userAgent);
    this.#setRefreshToken(refreshToken || '');
  }

  /**
   * Private object that executes http requests
   */
  #request = null;

  /**
   * Private refresh token attribute
   */
  #refreshToken = '';

  /**
   * Private setter to refresh token
   */
  #setRefreshToken(refreshToken) {
    this.#refreshToken = refreshToken;
  }

  /**
   * Private getter of refresh token
   */
  #getRefreshToken() {
    return this.#refreshToken;
  }

  /**
   * Private setter to jwtToken
   */
  #setJwtToken(jwtToken) {
    this.#request.setJwtToken(jwtToken);
  }

  /**
   * Getter of jwtToken
   */
  getJwtToken() {
    return this.#request.getJwtToken();
  }

  /**
   * Wrapper function to ensure that login refresh token is
   * executed if a JwtTokenExpiredError is received.
   * (it will be replaced in the future with a Decorator implementation)
   * 
   * @param {Function} method
   */
  #autoRefreshToken(method) {
    return function () {
      let args = [].splice.call(arguments, 0);
      if (this.getJwtToken() == '') {
        return this.loginRefreshToken()
          .then(() => {
            return method.apply(this, args);
          })
          .catch(error => {
            throw error;
          });
      } else {
        return method.apply(this, args).catch(err => {
          if (err instanceof JwtTokenExpiredError) {
            return this.loginRefreshToken()
              .then(() => {
                return method.apply(this, args);
              })
              .catch(error => {
                throw error;
              })
          } else
            throw err;
        });
      }
    }
  }


  /**
   * Execute multiple requests by chunking a given array
   * (It's implemented to the PUT method only)
   * 
   * @param {String} objPropertyName the property name of the objects containing the chunked data
   * @param {Array} array the array to be processed
   * @param {Number} chunkSize the size of the chunks
   * @param {String} endpoint the endpoint to make the requests
   * @param {Map<String, Object>} opts Optional parameters
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  #executeBulk(method, objPropertyName, array, chunkSize, endpoint, opts = {}) {
    return new Promise((resolve, reject) => {
      Promise.all(utils.chunk(array, chunkSize)
        .map(chunkedArr => {
          let bodyParams = {};
          bodyParams[objPropertyName] = chunkedArr;
          if (opts) {
            bodyParams["wait_for_completion"] = opts.waitForCompletion;
            bodyParams["create_if_missing"] = opts.createIfMissing;
          }
          this.makeRequestWithAutoRefreshToken(method, endpoint, bodyParams, opts)
            .then(resolve)
            .catch(reject)
        })
      )
    })
  }

  /**
   * Executes the request call given the method, endpoint and bodyParams
   * 
   * @param {String} method the method to execute
   * @param {String} endpoint
   * @param {Object} bodyParams
   * @param {Map<String, Object>} opts Optional parameters
   * 
   * @return {Promise}
   * 
   */
  #makeRequest(method, endpoint, bodyParams, opts = {}) {
    switch (method) {
      case 'GET':
        return this.#request.get(endpoint, opts);
      case 'PUT':
        return this.#request.put(endpoint, bodyParams, opts);
      case 'POST':
        return this.#request.post(endpoint, bodyParams, opts);
      case 'DELETE':
        return this.#request.delete(endpoint, bodyParams, opts);
      case 'PATCH':
        return this.#request.patch(endpoint, bodyParams, opts);
    }
  }

  /**
   * Wrapped function of makeRequest using autoRefreshToken wrapper
   */
  makeRequestWithAutoRefreshToken = this.#autoRefreshToken(this.#makeRequest);


  // ACCOUNT ENDPOINTS

  /**
   * Create a new account for an individual, identified by an email.
   * 
   * @param {String} firstName 
   * @param {String} lastName 
   * @param {String} email 
   * @param {String} password 
   * @param {String} role
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object represents the ID of the created account if resolved. XMindsError if rejected
   * 
   */
  createIndividualAccount(firstName, lastName, email, password, role = 'backend', opts = {}) {
    let bodyParams = {
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'password': password,
      'role': role
    }
    let path = '/accounts/individual/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams, opts);
  }

  /**
   * Create a new service account, identified by a service name.
   * 
   * @param {String} name 
   * @param {String} password 
   * @param {String} role
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Object represents the ID of the created account if resolved. XMindsError if rejected
   */
  createServiceAccount(name, password, role = 'frontend', opts = {}) {
    let bodyParams = {
      'name': name,
      'password': password,
      'role': role
    }
    let path = '/accounts/service/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams, opts);
  }

  /**
   * Send a new verification code to the email address of an individual account.
   * 
   * @param {String} email
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  resendVerificationCode(email, opts = {}) {
    let bodyParams = { 'email': email }
    let path = '/accounts/resend-verification-code/';
    return this.makeRequestWithAutoRefreshToken('PUT', path, bodyParams, opts);
  }

  /**
   * Verify the email of an individual account.
   * 
   * @param {String} code 
   * @param {String} email
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  verifyAccount(code, email, opts = {}) {
    let queryParams = { 'code': code, 'email': email }
    let path = '/accounts/verify/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Retrieve all the accounts that belong to the organization of the token.
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of accounts. XMindsError if rejected
   */
  listAllAccounts(opts = {}) {
    let path = '/organizations/current/accounts/';
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Delete another individual account by email address that belong to the organization of the token.
   * 
   * @param {String} email 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  deleteIndividualAccount(email, opts = {}) {
    let bodyParams = { 'email': email };
    let path = '/accounts/individual/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams, opts);
  }

  /**
   * Delete another service account by name that belong to the organization of the token.
   * 
   * @param {String} name 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  deleteServiceAccount(name, opts = {}) {
    let bodyParams = { 'name': name };
    let path = '/accounts/service/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams, opts);
  }

  /**
   * Delete the account you’re logged to with your current token.
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  deleteCurrentAccount(opts = {}) {
    // Remove the cached data of the account being deleted
    this.#request.clearJwtToken();
    this.#setRefreshToken('');
    let path = '/accounts/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }


  // LOGIN ENDPOINTS

  /**
   * Login on a database with your account, using your email and password combination.
   * 
   * @param {String} email 
   * @param {String} password 
   * @param {String} dbId 
   * @param {String} frontendUserId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindsError if rejected
   */
  async loginIndividual(email, password, dbId, frontendUserId = null, opts = {}) {
    let bodyParams = {
      'email': email,
      'password': password,
      'db_id': dbId
    }
    if (frontendUserId)
      bodyParams['frontend_user_id'] = frontendUserId;
    let path = '/login/individual/';
    return this.#makeRequest('POST', path, bodyParams, opts)
      .then(authData => {
        this.#setJwtToken(authData.token);
        this.#setRefreshToken(authData.refresh_token);
        return authData;
      });
  }

  /**
   * Login on a database with a service account, using a service name and password combination.
   * 
   * @param {String} name 
   * @param {String} password 
   * @param {String} dbId 
   * @param {String} frontendUserId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindsError if rejected
   */
  async loginService(name, password, dbId, frontendUserId = null, opts = {}) {
    let bodyParams = {
      'name': name,
      'password': password,
      'db_id': dbId
    }
    if (frontendUserId)
      bodyParams['frontend_user_id'] = frontendUserId;
    let path = '/login/service/';
    return this.#makeRequest('POST', path, bodyParams, opts)
      .then(authData => {
        this.#setJwtToken(authData.token);
        this.#setRefreshToken(authData.refresh_token);
        return authData;
      });
  }

  /**
   * Login with the root account, without selecting any database.
   * 
   * @param {String} email 
   * @param {String} password 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Object represents the jwtToken information if resolved. XMindsError if rejected
   */
  async loginRoot(email, password, opts = {}) {
    let bodyParams = { 'email': email, 'password': password };
    let path = '/login/root/';
    return this.#makeRequest('POST', path, bodyParams, opts)
      .then(authData => {
        this.#setJwtToken(authData.token);
        return authData;
      });
  }

  /**
   * Login on a database with your account, using a refresh token.
   * 
   * @param {String} refreshToken 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindsError if rejected
   */
  async loginRefreshToken(refreshToken = '', opts = {}) {
    let bodyParams = { 'refresh_token': refreshToken !== '' ? refreshToken : this.#getRefreshToken() };
    let path = '/login/refresh-token/';
    const authData = await this.#makeRequest('POST', path, bodyParams, opts);
    this.#setJwtToken(authData.token);
    this.#setRefreshToken(authData.refresh_token);
    return authData;
  }


  // DATABASE ENDPOINTS

  /**
   * Create a new database.
   * 
   * @param {String} name 
   * @param {String} description 
   * @param {String} itemIdType 
   * @param {String} userIdType
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object represents the ID of the created database if resolved. XMindsError if rejected
   * 
   */
  createDatabase(name, description, itemIdType, userIdType, opts = {}) {
    let bodyParams = {
      'name': name,
      'description': description,
      'item_id_type': itemIdType,
      'user_id_type': userIdType
    }
    let path = '/databases/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams, opts);
  }

  /**
   * Get all databases for the organization you’re logged to with your current token.
   * 
   * @param {Number} amt 
   * @param {Number} page 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of databases. XMindsError if rejected
   * 
   */
  listAllDatabases(amt = 64, page = 1, opts = {}) {
    let queryParams = {
      'amt': amt,
      'page': page
    }
    let path = '/databases/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Get the metadata for the database you’re logged to with your current token.
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Array<Object>>} Object that represents a database. XMindsError if rejected
   * 
   */
  getCurrentDatabase(opts = {}) {
    let path = '/databases/current/';
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Delete the metadata for the database you’re logged to with your current token.
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteCurrentDatabase(opts = {}) {
    let path = '/databases/current/';
    opts.timeout = opts.timeout || 30;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

  /**
   * Retrieve status of database. Initially the database will be in “pending” status. 
   * Until the status switch to “ready” you will not be able to get recommendations.
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Array<Object>>} Object that represents the status. XMindsError if rejected
   * 
   */
  getCurrentDatabaseStatus(opts = {}) {
    let path = '/databases/current/status/';
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }


  // USER-DATA-PROPERTIES ENDPOINTS

  /**
   * Get one user-property given its propertyName.
   * 
   * @param {String} propertyName 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the user property, if resolved. XMindsError if rejected
   * 
   */
  getUserProperty(propertyName, opts = {}) {
    let path = `/users-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Get all user-properties for the current database.
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents an array of user properties, if resolved. XMindsError if rejected
   * 
   */
  listAllUserProperties(opts = {}) {
    let path = '/users-properties/';
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Create a new user-property, identified by propertyName (case-insensitive).
   * 
   * @param {String} propertyName 
   * @param {String} valueType 
   * @param {boolean} repeated 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createUserProperty(propertyName, valueType, repeated = false, opts = {}) {
    let bodyParams = {
      "property_name": propertyName,
      "value_type": valueType,
      "repeated": repeated
    }
    let path = '/users-properties/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams, opts);
  }

  /**
   * Delete an user-property given by its name
   * 
   * @param {String} propertyName 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteUserProperty(propertyName, opts = {}) {
    let path = `/users-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

  /**
   * Get one user given its ID.
   * 
   * @param {String} userId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the user, if resolved. XMindsError if rejected
   * 
   */
  getUser(userId, opts = {}) {
    let path = `/users/${userId}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Create a new user, or update it if the userId already exists.
   * 
   * @param {String} userId 
   * @param {Object} user
   * @param {Map<String, Object>} opts Optional parameters
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateUser(userId, user, opts = {}) {
    let path = `/users/${userId}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, user, opts);
  }

  /**
   * Create many users in bulk, or update the ones for which the id already exist.
   * 
   * @param {Array} users array of users
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateUsersBulk(users, chunkSize = (1 << 10), opts = {}) {
    let path = '/users-bulk/';
    opts.timeout = opts.timeout || 60;
    return this.#executeBulk('PUT', 'users', users, chunkSize, path, opts);
  }

  /**
   * Get multiple users by page. The response is paginated, you can control 
   * the response amount and offset using the query parameters amt and cursor.
   * 
   * @param {Number} amt Maximum amount of users returned, by default is 300
   * @param {String} cursor Pagination cursor, typically from the next_cursor value from the previous response
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents a list of users, if resolved. XMindsError if rejected
   * 
   */
  listUsersPaginated(amt = 300, cursor = null, opts = {}) {
    let queryParams = {}
    queryParams['amt'] = amt;
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/users-bulk/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Get multiple users given their IDs.
   * 
   * @param {Array<String>} usersId an array of users id
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of users, if resolved. XMindsError if rejected
   * 
   */
  listUsers(usersId, opts = {}) {
    let bodyParams = { "users_id": usersId }
    let path = '/users-bulk/list/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams, opts);
  }

  /**
   * Delete one user given its ID. 
   * Ratings and interactions are not deleted.
   * 
   * @param {String} userId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteUser(userId, opts = {}) {
    let path = `/users/${userId}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

  /**
   * Delete many users in bulk.
   * Ratings and interactions are not deleted.
   * 
   * @param {Array<String>} usersId
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteUsersBulk(usersId, opts = {}) {
    let bodyParams = { "users_id": usersId }
    let path = `/users-bulk/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams, opts);
  }

  /**
   * Partially update some properties of an user. 
   * The properties that are not listed in the request body will be left unchanged. 
   * The list of values given for repeated properties will replace (not append) 
   * the previous list of values.
   * 
   * Use the optional boolean parameter createIfMissing to control whether an error should be 
   * returned or a new user should be created when the user_id does not already exist.
   * 
   * @param {String} userId 
   * @param {Object} user
   * @param {Map<String, Object>} opts Optional parameters
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  partialUpdateUser(userId, user, opts = {}) {
    let path = `/users/${userId}/`;
    let bodyParams = {
      "user": user,
      "create_if_missing": (opts && opts.createIfMissing) || false
    }
    return this.makeRequestWithAutoRefreshToken('PATCH', path, bodyParams, opts);
  }

  /**
   * Partially update some properties of many users. 
   * The properties that are not listed in the request body will be left unchanged. 
   * The list of values given for repeated properties will replace (not append) 
   * the previous list of values.
   * 
   * Use the optional boolean parameter createIfMissing to control whether an error should be 
   * returned or a new user should be created when the user_id does not already exist.
   * 
   * @param {Array} users array of users
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  partialUpdateUsersBulk(users, chunkSize = (1 << 10), opts = {}) {
    let path = '/users-bulk/';
    opts.timeout = opts.timeout || 60;
    return this.#executeBulk('PATCH', 'users', users, chunkSize, path, opts);
  }


  // ITEM-DATA-PROPERTIES ENDPOINTS

  /**
   * Get one item-property given its propertyName.
   * 
   * @param {String} propertyName 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the item property, if resolved. XMindsError if rejected
   * 
   */
  getItemProperty(propertyName, opts = {}) {
    let path = `/items-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Get all item-properties for the current database.
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents an array of item properties, if resolved. XMindsError if rejected
   * 
   */
  listAllItemProperties(opts = {}) {
    let path = '/items-properties/';
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Create a new item-property, identified by propertyName (case-insensitive).
   * 
   * @param {String} propertyName 
   * @param {String} valueType 
   * @param {boolean} repeated 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createItemProperty(propertyName, valueType, repeated = false, opts = {}) {
    let bodyParams = {
      "property_name": propertyName,
      "value_type": valueType,
      "repeated": repeated
    }
    let path = '/items-properties/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams, opts);
  }

  /**
   * Delete an item-property given by its name
   * 
   * @param {String} propertyName 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteItemProperty(propertyName, opts = {}) {
    let path = `/items-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

  /**
   * Get one item given its ID.
   * 
   * @param {String} itemId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the item, if resolved. XMindsError if rejected
   * 
   */
  getItem(itemId, opts = {}) {
    let path = `/items/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Create a new item, or update it if the itemId already exists.
   * 
   * @param {String} itemId 
   * @param {Object} item
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateItem(itemId, item, opts = {}) {
    let path = `/items/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, item, opts);
  }

  /**
   * Create many items in bulk, or update the ones for which the id already exist.
   * 
   * @param {Array} items array of items
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateItemsBulk(items, chunkSize = (1 << 10), opts = {}) {
    let path = '/items-bulk/';
    opts.timeout = opts.timeout || 60;
    return this.#executeBulk('PUT', 'items', items, chunkSize, path, opts);
  }

  /**
   * Get multiple items by page. The response is paginated, you can control 
   * the response amount and offset using the query parameters amt and cursor.
   * 
   * @param {Number} amt Maximum amount of items returned, by default is 300
   * @param {String} cursor Pagination cursor, typically from the next_cursor value from the previous response
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents a list of items, if resolved. XMindsError if rejected
   * 
   */
  listItemsPaginated(amt = 300, cursor = null, opts = {}) {
    let queryParams = {}
    queryParams['amt'] = amt;
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/items-bulk/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Get multiple items given their IDs.
   * 
   * @param {Array<String>} itemsId an array of items id
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of items, if resolved. XMindsError if rejected
   * 
   */
  listItems(itemsId, opts = {}) {
    let bodyParams = { "items_id": itemsId }
    let path = '/items-bulk/list/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams, opts);
  }

  /**
   * Delete one item given its ID. 
   * Ratings and interactions are not deleted.
   * 
   * @param {String} itemId
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteItem(itemId, opts = {}) {
    let path = `/items/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

  /**
   * Delete many items in bulk.
   * Ratings and interactions are not deleted.
   * 
   * @param {Array<String>} itemsId
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteItemsBulk(itemsId, opts = {}) {
    let bodyParams = { "items_id": itemsId }
    let path = `/items-bulk/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams, opts);
  }

  /**
   * Partially update some properties of an item. 
   * The properties that are not listed in the request body will be left unchanged. 
   * The list of values given for repeated properties will replace (not append) 
   * the previous list of values.
   * 
   * Use the optional boolean parameter createIfMissing to control whether an error should be 
   * returned or a new item should be created when the item_id does not already exist.
   * 
   * @param {String} itemId 
   * @param {Object} item
   * @param {Map<String, Object>} opts Optional parameters
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  partialUpdateItem(itemId, item, opts = {}) {
    let path = `/items/${itemId}/`;
    let bodyParams = {
      "item": item,
      "create_if_missing": (opts && opts.createIfMissing) || false
    }
    return this.makeRequestWithAutoRefreshToken('PATCH', path, bodyParams, opts);
  }

  /**
   * Partially update some properties of many items. 
   * The properties that are not listed in the request body will be left unchanged. 
   * The list of values given for repeated properties will replace (not append) 
   * the previous list of values.
   * 
   * Use the optional boolean parameter createIfMissing to control whether an error should be 
   * returned or a new item should be created when the item_id does not already exist.
   * 
   * @param {Array} items array of items
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  partialUpdateItemsBulk(items, chunkSize = (1 << 10), opts = {}) {
    let path = '/items-bulk/';
    opts.timeout = opts.timeout || 60;
    return this.#executeBulk('PATCH', 'items', items, chunkSize, path, opts);
  }


  // USER-RATING ENDPOINTS

  /**
   * Create or update a rating for a user and an item.
   * If the rating exists for the tuple (userId, itemId) then it is updated,
   * otherwise it is created.
   * 
   * @param {String} userId 
   * @param {String} itemId 
   * @param {Number} rating
   * @param {Number} timestamp 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateRating(userId, itemId, rating, timestamp = null, opts = {}) {
    let bodyParams = {
      "rating": rating
    }
    if (timestamp)
      bodyParams['timestamp'] = timestamp;
    let path = `/users/${userId}/ratings/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, bodyParams, opts);
  }

  /**
   * Delete a single rating for a given user.
   * 
   * @param {String} userId 
   * @param {String} itemId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteRating(userId, itemId, opts = {}) {
    let path = `/users/${userId}/ratings/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

  /**
   * List the ratings of one user. 
   * The response is paginated, you can control the response amount 
   * and offset using the query parameters amt and page.
   * 
   * @param {String} userId 
   * @param {Number} page Page to be listed. Default value is 1
   * @param {Number} amt Amount of ratings to return. Default value is 64
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of ratings, if resolved. XMindsError if rejected
   * 
   */
  listUserRatings(userId, page = 1, amt = 64, opts = {}) {
    let queryParams = { "page": page, "amt": amt };
    let path = `/users/${userId}/ratings/` + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Create or update bulks of ratings for a single user and many items.
   * 
   * @param {String} userId 
   * @param {Array<Object>} ratings array of ratings
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateUserRatingsBulk(userId, ratings, opts = {}) {
    let bodyParams = { "ratings": ratings }
    let path = `/users/${userId}/ratings/`;
    opts.timeout = opts.timeout || 10;
    return this.makeRequestWithAutoRefreshToken('PUT', path, bodyParams, opts);
  }

  /**
   * Delete all ratings of a given user.
   * 
   * @param {String} userId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteUserRatings(userId, opts = {}) {
    let path = `/users/${userId}/ratings/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

  /**
   * Create or update large bulks of ratings for many users and many items.
   * 
   * @param {Array<Object>} ratings array of ratings
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateRatingsBulk(ratings, chunkSize = (1 << 14), opts = {}) {
    let path = '/ratings-bulk/';
    opts.timeout = opts.timeout || 60;
    return this.#executeBulk('PUT', 'ratings', ratings, chunkSize, path, opts);
  }

  /**
   * List the ratings of one database. 
   * The response is paginated, you can control the response amount 
   * and offset using the query parameters amt and cursor.
   * 
   * @param {Number} page Page to be listed. Default value is 1
   * @param {String} cursor Pagination cursor, typically from the next_cursor value from the previous response
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of ratings, if resolved. XMindsError if rejected
   * 
   */
  listRatings(page = 1, cursor = null, opts = {}) {
    let queryParams = { "page": page };
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/ratings-bulk/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }


  // RECOMMENDATIONS ENDPOINTS

  /**
   * Get similar items.
   * 
   * @param {String} itemId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindsError if rejected
   * 
   */
  getRecommendationsItemToItems(itemId, opts = {}) {
    const queryParams = {
      ...opts,
      ...(opts.filters && { filters: utils.getFormattedFiltersArray(opts.filters) })
    }
    let path = `/recommendation/items/${itemId}/items/` + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Get items recommendations given the ratings of an anonymous session.
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindsError if rejected
   * 
   */
  getRecommendationsSessionToItems(opts = {}) {
    let path = '/recommendation/sessions/items/';
    return this.makeRequestWithAutoRefreshToken('POST', path, opts);
  }

  /**
   * Get items recommendations given a user ID.
   * 
   * @param {String} userId 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindsError if rejected
   * 
   */
  getRecommendationsUserToItems(userId, opts = {}) {
    const queryParams = {
      ...opts,
      ...(opts.filters && { filters: utils.getFormattedFiltersArray(opts.filters) })
    }
    let path = `/recommendation/users/${userId}/items/` + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }


  // USER INTERACTIONS

  /**
   * This endpoint allows you to create a new interaction for a user and an item.
   * An inferred rating will be created or updated for the tuple (user_id, item_id).
   * The taste profile of the user will then be updated in real-time by the online 
   * machine learning algorithm.
   * 
   * @param {ID} userId 
   * @param {ID} itemId 
   * @param {String} interactionType 
   * @param {Float} timestamp 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>}
   * 
   */
  createInteraction(userId, itemId, interactionType, timestamp = null, opts = {}) {
    let bodyParams = {};
    bodyParams['interaction_type'] = interactionType;
    if (timestamp)
      bodyParams['timestamp'] = timestamp;
    let path = `/users/${userId}/interactions/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams, opts);
  }

  /**
   * Deprecated.
   * 
   * @deprecated use createUserInteractionsBulk(userId, interactions, opts = {}) 
   * instead of this one since this endpoint is only for creating not for updating
   * 
   */
  createOrUpdateUserInteractionsBulk(userId, interactions, opts = {}) {
    let path = `/users/${userId}/interactions-bulk/`;
    return this.makeRequestWithAutoRefreshToken('POST', path, { 'interactions': interactions }, opts);
  }

  /**
   * Create a small bulk of interactions for a single user and many items.
   * Inferred ratings will be created or updated for all tuples (user_id, item_id)
   * 
   * @param {ID} userId 
   * @param {Array<Object} interactions
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>}
   * 
   */
  createUserInteractionsBulk(userId, interactions, opts = {}) {
    let path = `/users/${userId}/interactions-bulk/`;
    return this.makeRequestWithAutoRefreshToken('POST', path, { 'interactions': interactions }, opts);
  }

  /**
   * Deprecated.
   * 
   * @deprecated use createUsersInteractionsBulk(interactions, chunkSize = (1 << 12), opts = {})
   * instead of this one since this endpoint is only for creating not for updating.
   * 
   */
  createOrUpdateUsersInteractionsBulk(interactions, chunkSize = (1 << 12), opts = {}) {
    let path = '/interactions-bulk/';
    return this.#executeBulk('POST', 'interactions', interactions, chunkSize, path, opts);
  }

  /**
   * Create large bulks of interactions for many users and many items.
   * Inferred ratings will be created or updated for all tuples (user_id, item_id)
   * 
   * @param {Array<Object>} interactions
   * @param {Number} chunkSize the size of the chunks
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>}
   * 
   */
  createUsersInteractionsBulk(interactions, chunkSize = (1 << 12), opts = {}) {
    let path = '/interactions-bulk/';
    return this.#executeBulk('POST', 'interactions', interactions, chunkSize, path, opts);
  }


  // SCENARIOS

  /**
   * Return scenario.
   * See https://docs.api.crossingminds.com/endpoints/scenario.html#get-scenario
   * 
   * @param {String} recoType 
   * @param {String} name 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} - The scenario info
   * 
   */
  getScenario(recoType, name, opts = {}) {
    let path = `/scenarios/${recoType}/${name}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Create or replace a scenario. Only scenarios of type “case” can be replaced.
   * Only one of case/condition/ab_test can be non-null, according to scenario_type.
   * See https://docs.api.crossingminds.com/endpoints/scenario.html#create-or-replace-scenario
   * 
   * @param {String} recoType 
   * @param {String} name 
   * @param {*} scenario 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} - warnings (list-of-string) – Warnings about the scenario
   * 
   */
  createOrReplaceScenario(recoType, name, scenario, opts = {}) {
    let path = `/scenarios/${recoType}/${name}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, scenario, opts);
  }

  /**
   * Delete single scenario.
   * See: https://docs.api.crossingminds.com/endpoints/scenario.html#delete-a-scenario
   * 
   * @param {String} recoType 
   * @param {String} name 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} - Empty response
   * 
   */
  deleteScenario(recoType, name, opts = {}) {
    let path = `/scenarios/${recoType}/${name}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

  /**
   * Return all scenarios.
   * See https://docs.api.crossingminds.com/endpoints/scenario.html#get-all-scenarios
   * 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} - The scenarios info
   * 
   */
  getAllScenarios(opts = {}) {
    let path = '/scenarios/';
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Get default scenario.
   * See https://docs.api.crossingminds.com/endpoints/scenario.html#get-default-scenario
   * 
   * @param {String} recoType 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} - The default scenario info
   * 
   */
  getDefaultScenario(recoType, opts = {}) {
    let path = `/scenarios-default/${recoType}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path, null, opts);
  }

  /**
   * Set scenario as default.
   * See https://docs.api.crossingminds.com/endpoints/scenario.html#set-default-scenario
   * 
   * @param {String} recoType 
   * @param {String} name 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} - Empty response
   * 
   */
  setDefaultScenario(recoType, name, opts = {}) {
    let path = `/scenarios-default/${recoType}/`;
    return this.makeRequestWithAutoRefreshToken('PATCH', path, { "name": name }, opts);
  }

  /**
   * Unset a scenario from being by default.
   * See https://docs.api.crossingminds.com/endpoints/scenario.html#unset-default-scenario
   * 
   * @param {String} recoType 
   * @param {Map<String, Object>} opts Optional parameters
   * @returns {Promise.<Object>} - Empty response
   * 
   */
  unsetDefaultScenario(recoType, opts = {}) {
    let path = `/scenarios-default/${recoType}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, opts);
  }

}

/**
* The default API client implementation.
* @type {module:ApiClient}
*/
ApiClient.instance = new ApiClient();
module.exports.ApiClient = ApiClient;
