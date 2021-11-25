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
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  #executeBulk(objPropertyName, array, chunkSize, endpoint, timeout) {
    return new Promise((resolve, reject) => {
      Promise.all(utils.chunk(array, chunkSize)
        .map(chunkedArr => {
          let bodyParams = {};
          bodyParams[objPropertyName] = chunkedArr;
          this.makeRequestWithAutoRefreshToken('PUT', endpoint, bodyParams, timeout)
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
   * @return {Promise}
   * 
   */
  #makeRequest(method, endpoint, bodyParams, timeout) {
    switch (method) {
      case 'GET':
        return this.#request.get(endpoint, timeout);
      case 'PUT':
        return this.#request.put(endpoint, bodyParams, timeout);
      case 'POST':
        return this.#request.post(endpoint, bodyParams, timeout);
      case 'DELETE':
        return this.#request.delete(endpoint, bodyParams, timeout);
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
   * @returns {Promise.<Object>} Object represents the ID of the created account if resolved. XMindsError if rejected
   * 
   */
  createIndividualAccount(firstName, lastName, email, password, role = 'backend') {
    let bodyParams = {
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'password': password,
      'role': role
    }
    let path = '/accounts/individual/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Create a new service account, identified by a service name.
   * 
   * @param {String} name 
   * @param {String} password 
   * @param {String} role
   * @returns {Promise<Object>} Object represents the ID of the created account if resolved. XMindsError if rejected
   */
  createServiceAccount(name, password, role = 'frontend') {
    let bodyParams = {
      'name': name,
      'password': password,
      'role': role
    }
    let path = '/accounts/service/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Send a new verification code to the email address of an individual account.
   * 
   * @param {String} email
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  resendVerificationCode(email) {
    let bodyParams = { 'email': email }
    let path = '/accounts/resend-verification-code/';
    return this.makeRequestWithAutoRefreshToken('PUT', path, bodyParams);
  }

  /**
   * Verify the email of an individual account.
   * 
   * @param {String} code 
   * @param {String} email
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  verifyAccount(code, email) {
    let queryParams = { 'code': code, 'email': email }
    let path = '/accounts/verify/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Retrieve all the accounts that belong to the organization of the token.
   * 
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of accounts. XMindsError if rejected
   */
  listAllAccounts() {
    let path = '/organizations/current/accounts/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Delete another individual account by email address that belong to the organization of the token.
   * 
   * @param {String} email 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  deleteIndividualAccount(email) {
    let bodyParams = { 'email': email };
    let path = '/accounts/individual/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams);
  }

  /**
   * Delete another service account by name that belong to the organization of the token.
   * 
   * @param {String} name 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  deleteServiceAccount(name) {
    let bodyParams = { 'name': name };
    let path = '/accounts/service/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams);
  }

  /**
   * Delete the account you’re logged to with your current token.
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
  deleteCurrentAccount() {
    // Remove the cached data of the account being deleted
    this.#request.clearJwtToken();
    this.#setRefreshToken('');
    let path = '/accounts/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }


  // LOGIN ENDPOINTS

  /**
   * Login on a database with your account, using your email and password combination.
   * 
   * @param {String} email 
   * @param {String} password 
   * @param {String} dbId 
   * @param {String} frontendUserId 
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindsError if rejected
   */
  async loginIndividual(email, password, dbId, frontendUserId = null) {
    let bodyParams = {
      'email': email,
      'password': password,
      'db_id': dbId
    }
    if (frontendUserId)
      bodyParams['frontend_user_id'] = frontendUserId;
    let path = '/login/individual/';
    return this.#makeRequest('POST', path, bodyParams)
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
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindsError if rejected
   */
  async loginService(name, password, dbId, frontendUserId = null) {
    let bodyParams = {
      'name': name,
      'password': password,
      'db_id': dbId
    }
    if (frontendUserId)
      bodyParams['frontend_user_id'] = frontendUserId;
    let path = '/login/service/';
    return this.#makeRequest('POST', path, bodyParams)
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
   * @returns {Promise<Object>} Object represents the jwtToken information if resolved. XMindsError if rejected
   */
  async loginRoot(email, password) {
    let bodyParams = { 'email': email, 'password': password };
    let path = '/login/root/';
    return this.#makeRequest('POST', path, bodyParams)
      .then(authData => {
        this.#setJwtToken(authData.token);
        return authData;
      });
  }

  /**
   * Login on a database with your account, using a refresh token.
   * 
   * @param {String} refreshToken 
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindsError if rejected
   */
  async loginRefreshToken(refreshToken = '') {
    let bodyParams = { 'refresh_token': refreshToken !== '' ? refreshToken : this.#getRefreshToken() };
    let path = '/login/refresh-token/';
    const authData = await this.#makeRequest('POST', path, bodyParams);
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
   * @returns {Promise.<Object>} Object represents the ID of the created database if resolved. XMindsError if rejected
   * 
   */
  createDatabase(name, description, itemIdType, userIdType) {
    let bodyParams = {
      'name': name,
      'description': description,
      'item_id_type': itemIdType,
      'user_id_type': userIdType
    }
    let path = '/databases/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Get all databases for the organization you’re logged to with your current token.
   * 
   * @param {Number} amt 
   * @param {Number} page 
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of databases. XMindsError if rejected
   * 
   */
  listAllDatabases(amt = 64, page = 1) {
    let queryParams = {
      'amt': amt,
      'page': page
    }
    let path = '/databases/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get the metadata for the database you’re logged to with your current token.
   * 
   * @returns {Promise<Array<Object>>} Object that represents a database. XMindsError if rejected
   * 
   */
  getCurrentDatabase() {
    let path = '/databases/current/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Delete the metadata for the database you’re logged to with your current token.
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteCurrentDatabase() {
    let path = '/databases/current/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, 30);
  }

  /**
   * Retrieve status of database. Initially the database will be in “pending” status. 
   * Until the status switch to “ready” you will not be able to get recommendations.
   * 
   * @returns {Promise<Array<Object>>} Object that represents the status. XMindsError if rejected
   * 
   */
  getCurrentDatabaseStatus() {
    let path = '/databases/current/status/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }


  // USER-DATA-PROPERTIES ENDPOINTS

  /**
   * Get one user-property given its propertyName.
   * 
   * @param {String} propertyName 
   * @returns {Promise.<Object>} Object that represents the user property, if resolved. XMindsError if rejected
   * 
   */
  getUserProperty(propertyName) {
    let path = `/users-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get all user-properties for the current database.
   * 
   * @returns {Promise.<Object>} Object that represents an array of user properties, if resolved. XMindsError if rejected
   * 
   */
  listAllUserProperties() {
    let path = '/users-properties/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create a new user-property, identified by propertyName (case-insensitive).
   * 
   * @param {String} propertyName 
   * @param {String} valueType 
   * @param {boolean} repeated 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createUserProperty(propertyName, valueType, repeated = false) {
    let bodyParams = {
      "property_name": propertyName,
      "value_type": valueType,
      "repeated": repeated
    }
    let path = '/users-properties/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Delete an user-property given by its name
   * 
   * @param {String} propertyName 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteUserProperty(propertyName) {
    let path = `/users-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * Get one user given its ID.
   * 
   * @param {String} userId 
   * @returns {Promise.<Object>} Object that represents the user, if resolved. XMindsError if rejected
   * 
   */
  getUser(userId) {
    let path = `/users/${userId}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create a new user, or update it if the userId already exists.
   * 
   * @param {String} userId 
   * @param {Object} user
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateUser(userId, user) {
    let path = `/users/${userId}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, user);
  }

  /**
   * Create many users in bulk, or update the ones for which the id already exist.
   * 
   * @param {Array} users array of users
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateUsersBulk(users, chunkSize = (1 << 10)) {
    let path = '/users-bulk/';
    return this.#executeBulk('users', users, chunkSize, path, 60);
  }

  /**
   * Get multiple users by page. The response is paginated, you can control 
   * the response amount and offset using the query parameters amt and cursor.
   * 
   * @param {Number} amt Maximum amount of users returned, by default is 300
   * @param {String} cursor Pagination cursor, typically from the next_cursor value from the previous response
   * @returns {Promise.<Object>} Object that represents a list of users, if resolved. XMindsError if rejected
   * 
   */
  listUsersPaginated(amt = 300, cursor) {
    let queryParams = {}
    queryParams['amt'] = amt;
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/users-bulk/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get multiple users given their IDs.
   * 
   * @param {Array<String>} usersId an array of users id
   * @returns {Promise.<Object>} Object that represents the list of users, if resolved. XMindsError if rejected
   * 
   */
  listUsers(usersId) {
    let bodyParams = { "users_id": usersId }
    let path = '/users-bulk/list/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Delete one user given its ID. 
   * Ratings and interactions are not deleted.
   * 
   * @param {String} userId 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
   deleteUser(userId) {
    let path = `/users/${userId}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * Delete many users in bulk.
   * Ratings and interactions are not deleted.
   * 
   * @param {Array<String>} usersId
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
   deleteUsersBulk(usersId) {
    let bodyParams = { "users_id": usersId }
    let path = `/users-bulk/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams);
  }


  // ITEM-DATA-PROPERTIES ENDPOINTS

  /**
   * Get one item-property given its propertyName.
   * 
   * @param {String} propertyName 
   * @returns {Promise.<Object>} Object that represents the item property, if resolved. XMindsError if rejected
   * 
   */
  getItemProperty(propertyName) {
    let path = `/items-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get all item-properties for the current database.
   * 
   * @returns {Promise.<Object>} Object that represents an array of item properties, if resolved. XMindsError if rejected
   * 
   */
  listAllItemProperties() {
    let path = '/items-properties/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create a new item-property, identified by propertyName (case-insensitive).
   * 
   * @param {String} propertyName 
   * @param {String} valueType 
   * @param {boolean} repeated 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createItemProperty(propertyName, valueType, repeated = false) {
    let bodyParams = {
      "property_name": propertyName,
      "value_type": valueType,
      "repeated": repeated
    }
    let path = '/items-properties/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Delete an item-property given by its name
   * 
   * @param {String} propertyName 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteItemProperty(propertyName) {
    let path = `/items-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * Get one item given its ID.
   * 
   * @param {String} itemId 
   * @returns {Promise.<Object>} Object that represents the item, if resolved. XMindsError if rejected
   * 
   */
  getItem(itemId) {
    let path = `/items/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create a new item, or update it if the itemId already exists.
   * 
   * @param {String} itemId 
   * @param {Object} item
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateItem(itemId, item) {
    let path = `/items/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, item);
  }

  /**
   * Create many items in bulk, or update the ones for which the id already exist.
   * 
   * @param {Array} items array of items
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateItemsBulk(items, chunkSize = (1 << 10)) {
    let path = '/items-bulk/';
    return this.#executeBulk('items', items, chunkSize, path, 60);
  }

  /**
   * Get multiple items by page. The response is paginated, you can control 
   * the response amount and offset using the query parameters amt and cursor.
   * 
   * @param {Number} amt Maximum amount of items returned, by default is 300
   * @param {String} cursor Pagination cursor, typically from the next_cursor value from the previous response
   * @returns {Promise.<Object>} Object that represents a list of items, if resolved. XMindsError if rejected
   * 
   */
  listItemsPaginated(amt = 300, cursor) {
    let queryParams = {}
    queryParams['amt'] = amt;
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/items-bulk/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get multiple items given their IDs.
   * 
   * @param {Array<String>} itemsId an array of items id
   * @returns {Promise.<Object>} Object that represents the list of items, if resolved. XMindsError if rejected
   * 
   */
  listItems(itemsId) {
    let bodyParams = { "items_id": itemsId }
    let path = '/items-bulk/list/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Delete one item given its ID. 
   * Ratings and interactions are not deleted.
   * 
   * @param {String} itemId
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteItem(itemId) {
    let path = `/items/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * Delete many items in bulk.
   * Ratings and interactions are not deleted.
   * 
   * @param {Array<String>} itemsId
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteItemsBulk(itemsId) {
    let bodyParams = { "items_id": itemsId }
    let path = `/items-bulk/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams);
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
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateRating(userId, itemId, rating, timestamp = null) {
    let bodyParams = {
      "rating": rating
    }
    if (timestamp)
      bodyParams['timestamp'] = timestamp;
    let path = `/users/${userId}/ratings/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, bodyParams);
  }

  /**
   * Delete a single rating for a given user.
   * 
   * @param {String} userId 
   * @param {String} itemId 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteRating(userId, itemId) {
    let path = `/users/${userId}/ratings/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * List the ratings of one user. 
   * The response is paginated, you can control the response amount 
   * and offset using the query parameters amt and page.
   * 
   * @param {String} userId 
   * @param {Number} page Page to be listed. Default value is 1
   * @param {Number} amt Amount of ratings to return. Default value is 64
   * @returns {Promise.<Object>} Object that represents the list of ratings, if resolved. XMindsError if rejected
   * 
   */
  listUserRatings(userId, page = 1, amt = 64) {
    let queryParams = { "page": page, "amt": amt };
    let path = `/users/${userId}/ratings/` + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create or update bulks of ratings for a single user and many items.
   * 
   * @param {String} userId 
   * @param {Array<Object>} ratings array of ratings
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateUserRatingsBulk(userId, ratings) {
    let bodyParams = { "ratings": ratings }
    let path = `/users/${userId}/ratings/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, bodyParams, 10);
  }

  /**
   * Delete all ratings of a given user.
   * 
   * @param {String} userId 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  deleteUserRatings(userId) {
    let path = `/users/${userId}/ratings/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * Create or update large bulks of ratings for many users and many items.
   * 
   * @param {Array<Object>} ratings array of ratings
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
  createOrUpdateRatingsBulk(ratings, chunkSize = (1 << 14)) {
    let path = '/ratings-bulk/';
    return this.#executeBulk('ratings', ratings, chunkSize, path, 60);
  }

  /**
   * List the ratings of one database. 
   * The response is paginated, you can control the response amount 
   * and offset using the query parameters amt and cursor.
   * 
   * @param {Number} page Page to be listed. Default value is 1
   * @param {String} cursor Pagination cursor, typically from the next_cursor value from the previous response
   * @returns {Promise.<Object>} Object that represents the list of ratings, if resolved. XMindsError if rejected
   * 
   */
  listRatings(page = 1, cursor = null) {
    let queryParams = { "page": page };
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/ratings-bulk/' + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }


  // RECOMMENDATIONS ENDPOINTS

  /**
   * Get similar items.
   * 
   * @param {String} itemId 
   * @param {Map<String, String>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindsError if rejected
   * 
   */
  getRecommendationsItemToItems(itemId, opts = {}) {
    const queryParams = {
      ...opts,
      ...(opts.filters && { filters: utils.getFormattedFiltersArray(opts.filters) })
    }
    let path = `/recommendation/items/${itemId}/items/` + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get items recommendations given the ratings of an anonymous session.
   * 
   * @param {Map<String, String>} opts Optional parameters
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
   * @param {Map<String, String>} opts Optional parameters
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindsError if rejected
   * 
   */
  getRecommendationsUserToItems(userId, opts = {}) {
    const queryParams = {
      ...opts,
      ...(opts.filters && { filters: utils.getFormattedFiltersArray(opts.filters) })
    }
    let path = `/recommendation/users/${userId}/items/` + utils.convertToQueryString(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

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
   * @returns {Promise.<Object>}
   * 
   */
  createInteraction(userId, itemId, interactionType, timestamp = null) {
    let bodyParams = {};
    bodyParams['interaction_type'] = interactionType;
    if (timestamp)
      bodyParams['timestamp'] = timestamp;
    let path = `/users/${userId}/interactions/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Create or update large bulks of interactions for a user and many items.
   * Inferred ratings will be created or updated for all tuples (user_id, item_id)
   * 
   * @param {ID} userId 
   * @param {Array<Object} interactions
   * @returns {Promise.<Object>}
   * 
   */
  createOrUpdateUserInteractionsBulk(userId, interactions) {
    let path = `/users/${userId}/interactions-bulk/`;
    return this.makeRequestWithAutoRefreshToken('POST', path, { 'interactions': interactions });
  }


}

/**
* The default API client implementation.
* @type {module:ApiClient}
*/
ApiClient.instance = new ApiClient();
module.exports.ApiClient = ApiClient;
