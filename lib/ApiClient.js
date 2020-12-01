const { XMindRequest } = require('./ApiRequest');
const { JwtTokenExpiredError } = require('./XMindError');
const utils = require('./Utils');
const querystring = require('querystring');

class ApiClient {

  /**
   * Basic constructor
   * 
   * @param {String} basePath 
   */
  constructor(basePath) {
    this.#request = basePath ? new XMindRequest(basePath) : new XMindRequest();
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
  #getRefreshToken(refreshToken) {
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
      return method.apply(this, args).catch(err => {
        if (err instanceof JwtTokenExpiredError) {
          return this.loginRefreshToken()
            .then(response => {
              return method.apply(this, args);
            })
            .catch(err => {
              throw err;
            })
        } else
          throw err;
      });
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
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
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
  #makeRequest (method, endpoint, bodyParams, timeout) {
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
   * @returns {Promise.<Object>} Object represents the ID of the created account if resolved. XMindError if rejected
   * 
   */
  createIndividualAccount (firstName, lastName, email, password, role = 'backend') {
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
   * @returns {Promise<Object>} Object represents the ID of the created account if resolved. XMindError if rejected
   */
  createServiceAccount (name, password, role = 'frontend') {
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
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  resendVerificationCode (email) {
    let bodyParams = { 'email': email }
    let path = '/accounts/resend-verification-code/';
    return this.makeRequestWithAutoRefreshToken('PUT', path, bodyParams);
  }

  /**
   * Verify the email of an individual account.
   * 
   * @param {String} code 
   * @param {String} email
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  verifyAccount (code, email) {
    let queryParams = { 'code': code, 'email': email }
    let path = '/accounts/verify/?' + querystring.stringify(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Retrieve all the accounts that belong to the organization of the token.
   * 
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of accounts. XMindError if rejected
   */
  listAllAccounts () {
    let path = '/organizations/current/accounts/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Delete another individual account by email address that belong to the organization of the token.
   * 
   * @param {String} email 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  deleteIndividualAccount (email) {
    let bodyParams = { 'email': email };
    let path = '/accounts/individual/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams);
  }

  /**
   * Delete another service account by name that belong to the organization of the token.
   * 
   * @param {String} name 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  deleteServiceAccount (name) {
    let bodyParams = { 'name': name };
    let path = '/accounts/service/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, bodyParams);
  }

  /**
   * Delete the account you’re logged to with your current token.
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  deleteCurrentAccount () {
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
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindError if rejected
   */
  loginIndividual (email, password, dbId, frontendUserId = null) {
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
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindError if rejected
   */
  loginService (name, password, dbId, frontendUserId = null) {
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
   * @returns {Promise<Object>} Object represents the jwtToken information if resolved. XMindError if rejected
   */
  loginRoot (email, password) {
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
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindError if rejected
   */
  loginRefreshToken (refreshToken = '') {
    let bodyParams = { 'refresh_token': refreshToken !== '' ? refreshToken : this.#getRefreshToken() };
    let path = '/login/refresh-token/';
    return this.#makeRequest('POST', path, bodyParams)
      .then(authData => {
        this.#setJwtToken(authData.token);
        this.#setRefreshToken(authData.refresh_token);
        return authData;
      });
  }


  // DATABASE ENDPOINTS

  /**
   * Create a new database.
   * 
   * @param {String} name 
   * @param {String} description 
   * @param {String} itemIdType 
   * @param {String} userIdType
   * @returns {Promise.<Object>} Object represents the ID of the created database if resolved. XMindError if rejected
   * 
   */
  createDatabase (name, description, itemIdType, userIdType) {
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
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of databases. XMindError if rejected
   * 
   */
  listAllDatabases (amt = 64, page = 1) {
    let queryParams = {
      'amt': amt,
      'page': page
    }
    let path = '/databases/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get the metadata for the database you’re logged to with your current token.
   * 
   * @returns {Promise<Array<Object>>} Object that represents a database. XMindError if rejected
   * 
   */
  getCurrentDatabase () {
    let path = '/databases/current/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Delete the metadata for the database you’re logged to with your current token.
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteCurrentDatabase () {
    let path = '/databases/current/';
    return this.makeRequestWithAutoRefreshToken('DELETE', path, null, 30);
  }

  /**
   * Retrieve status of database. Initially the database will be in “pending” status. 
   * Until the status switch to “ready” you will not be able to get recommendations.
   * 
   * @returns {Promise<Array<Object>>} Object that represents the status. XMindError if rejected
   * 
   */
  getCurrentDatabaseStatus () {
    let path = '/databases/current/status/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }


  // USER-DATA-PROPERTIES ENDPOINTS

  /**
   * Get one user-property given its propertyName.
   * 
   * @param {String} propertyName 
   * @returns {Promise.<Object>} Object that represents the user property, if resolved. XMindError if rejected
   * 
   */
  getUserProperty (propertyName) {
    let path = `/users-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get all user-properties for the current database.
   * 
   * @returns {Promise.<Object>} Object that represents an array of user properties, if resolved. XMindError if rejected
   * 
   */
  listAllUserProperties () {
    let path = '/users-properties/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create a new user-property, identified by propertyName (case-insensitive).
   * 
   * @param {String} propertyName 
   * @param {String} valueType 
   * @param {boolean} repeated 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createUserProperty (propertyName, valueType, repeated = false) {
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
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteUserProperty (propertyName) {
    let path = `/users-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * Get one user given its ID.
   * 
   * @param {String} userId 
   * @returns {Promise.<Object>} Object that represents the user, if resolved. XMindError if rejected
   * 
   */
  getUser (userId) {
    let path = `/users/${userId}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create a new user, or update it if the userId already exists.
   * 
   * @param {String} userId 
   * @param {Object} user
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createOrUpdateUser (userId, user) {
    let path = `/users/${userId}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, user);
  }

  /**
   * Create many users in bulk, or update the ones for which the id already exist.
   * 
   * @param {Array} users array of users
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createOrUpdateUsersBulk (users, chunkSize = (1 << 10)) {
    let path = '/users-bulk/';
    return this.#executeBulk('users', users, chunkSize, path, 60);
  }

  /**
   * Get multiple users by page. The response is paginated, you can control 
   * the response amount and offset using the query parameters amt and cursor.
   * 
   * @param {Number} amt Maximum amount of users returned, by default is 300
   * @param {String} cursor Pagination cursor, typically from the next_cursor value from the previous response
   * @returns {Promise.<Object>} Object that represents a list of users, if resolved. XMindError if rejected
   * 
   */
  listUsersPaginated (amt = 300, cursor) {
    let queryParams = {}
    queryParams['amt'] = amt;
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/users-bulk/?' + querystring.stringify(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get multiple users given their IDs.
   * 
   * @param {Array<String>} usersId an array of users id
   * @returns {Promise.<Object>} Object that represents the list of users, if resolved. XMindError if rejected
   * 
   */
  listUsers (usersId) {
    let bodyParams = { "users_id": usersId }
    let path = '/users-bulk/list/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }


  // ITEM-DATA-PROPERTIES ENDPOINTS

  /**
   * Get one item-property given its propertyName.
   * 
   * @param {String} propertyName 
   * @returns {Promise.<Object>} Object that represents the item property, if resolved. XMindError if rejected
   * 
   */
  getItemProperty (propertyName) {
    let path = `/items-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get all item-properties for the current database.
   * 
   * @returns {Promise.<Object>} Object that represents an array of item properties, if resolved. XMindError if rejected
   * 
   */
  listAllItemProperties () {
    let path = '/items-properties/';
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create a new item-property, identified by propertyName (case-insensitive).
   * 
   * @param {String} propertyName 
   * @param {String} valueType 
   * @param {boolean} repeated 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createItemProperty (propertyName, valueType, repeated = false) {
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
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteItemProperty (propertyName) {
    let path = `/items-properties/${propertyName}/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * Get one item given its ID.
   * 
   * @param {String} itemId 
   * @returns {Promise.<Object>} Object that represents the item, if resolved. XMindError if rejected
   * 
   */
  getItem (itemId) {
    let path = `/items/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create a new item, or update it if the itemId already exists.
   * 
   * @param {String} itemId 
   * @param {Object} item
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createOrUpdateItem (itemId, item) {
    let path = `/items/${itemId}/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, item);
  }

  /**
   * Create many items in bulk, or update the ones for which the id already exist.
   * 
   * @param {Array} items array of items
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createOrUpdateItemsBulk (items, chunkSize = (1 << 10)) {
    let path = '/items-bulk/';
    return this.#executeBulk('items', items, chunkSize, path, 60);
  }

  /**
   * Get multiple items by page. The response is paginated, you can control 
   * the response amount and offset using the query parameters amt and cursor.
   * 
   * @param {Number} amt Maximum amount of items returned, by default is 300
   * @param {String} cursor Pagination cursor, typically from the next_cursor value from the previous response
   * @returns {Promise.<Object>} Object that represents a list of items, if resolved. XMindError if rejected
   * 
   */
  listItemsPaginated (amt = 300, cursor) {
    let queryParams = {}
    queryParams['amt'] = amt;
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/items-bulk/?' + querystring.stringify(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get multiple items given their IDs.
   * 
   * @param {Array<String>} itemsId an array of items id
   * @returns {Promise.<Object>} Object that represents the list of items, if resolved. XMindError if rejected
   * 
   */
  listItems (itemsId) {
    let bodyParams = { "items_id": itemsId }
    let path = '/items-bulk/list/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
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
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createOrUpdateRating (userId, itemId, rating, timestamp = null) {
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
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteRating (userId, itemId) {
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
   * @returns {Promise.<Object>} Object that represents the list of ratings, if resolved. XMindError if rejected
   * 
   */
  listUserRatings (userId, page = 1, amt = 64) {
    let queryParams = { "page": page, "amt": amt };
    let path = `/users/${userId}/ratings/?` + querystring.stringify(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Create or update bulks of ratings for a single user and many items.
   * 
   * @param {String} userId 
   * @param {Array<Object>} ratings array of ratings
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createOrUpdateUserRatingsBulk (userId, ratings) {
    let bodyParams = { "ratings": ratings }
    let path = `/users/${userId}/ratings/`;
    return this.makeRequestWithAutoRefreshToken('PUT', path, bodyParams, 10);
  }

  /**
   * Delete all ratings of a given user.
   * 
   * @param {String} userId 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteUserRatings (userId) {
    let path = `/users/${userId}/ratings/`;
    return this.makeRequestWithAutoRefreshToken('DELETE', path);
  }

  /**
   * Create or update large bulks of ratings for many users and many items.
   * 
   * @param {Array<Object>} ratings array of ratings
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  createOrUpdateRatingsBulk (ratings, chunkSize = (1 << 14)) {
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
   * @returns {Promise.<Object>} Object that represents the list of ratings, if resolved. XMindError if rejected
   * 
   */
  listRatings (page = 1, cursor = null) {
    let queryParams = { "page": page };
    if (cursor)
      queryParams['cursor'] = cursor;
    let path = '/ratings-bulk/?' + querystring.stringify(queryParams);
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }


  // RECOMMENDATIONS ENDPOINTS

  /**
   * Get similar items.
   * 
   * @param {String} itemId 
   * @param {Array<Object>} filters 
   * @param {Number} amt 
   * @param {String} cursor 
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindError if rejected
   * 
   */
  getRecommendationsItemToItems (itemId, filters = null, amt = null, cursor = null) {
    let queryParams = {};
    if (amt)
      queryParams['amt'] = amt;
    if (cursor)
      queryParams['cursor'] = cursor;
    if (filters && filters.length > 0)
      queryParams['filters'] = utils.getFormattedFiltersArray(filters);
    let path = `/recommendation/items/${itemId}/items/` +
      (JSON.stringify(queryParams) !== {}
        ? ('?' + querystring.stringify(queryParams))
        : '');
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

  /**
   * Get items recommendations given the ratings of an anonymous session.
   * 
   * @param {Array<Object>} ratings 
   * @param {Object} userProperties 
   * @param {Number} amt 
   * @param {String} cursor 
   * @param {Array<Object>} filters 
   * @param {Boolean} excludeRatedItems 
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindError if rejected
   * 
   */
  getRecommendationsSessionToItems (ratings, userProperties, filters, excludeRatedItems, amt, cursor) {
    let bodyParams = {};
    if (ratings)
      bodyParams['ratings'] = ratings;
    if (userProperties)
      bodyParams['user_properties'] = userProperties;
    if (amt)
      bodyParams['amt'] = amt;
    if (cursor)
      bodyParams['cursor'] = cursor;
    if (filters)
      bodyParams['filters'] = filters;
    if (excludeRatedItems)
      bodyParams['exclude_rated_items'] = excludeRatedItems;
    let path = '/recommendation/sessions/items/';
    return this.makeRequestWithAutoRefreshToken('POST', path, bodyParams);
  }

  /**
   * Get items recommendations given a user ID.
   * 
   * @param {String} userId 
   * @param {Number} amt 
   * @param {String} cursor 
   * @param {Array<Object>} filters 
   * @param {Boolean} excludeRatedItems 
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindError if rejected
   * 
   */
  getRecommendationsUserToItems (userId, filters, excludeRatedItems, amt, cursor) {
    let queryParams = {};
    if (amt)
      queryParams['amt'] = amt;
    if (cursor)
      queryParams['cursor'] = cursor;
    if (filters && filters.length > 0)
      queryParams['filters'] = utils.getFormattedFiltersArray(filters);
    if (excludeRatedItems)
      queryParams['exclude_rated_items'] = excludeRatedItems;
    let path = `/recommendation/users/${userId}/items/` +
      (JSON.stringify(queryParams) !== {}
        ? ('?' + querystring.stringify(queryParams))
        : '');
    return this.makeRequestWithAutoRefreshToken('GET', path);
  }

}

/**
* The default API client implementation.
* @type {module:ApiClient}
*/
ApiClient.instance = new ApiClient();
module.exports.ApiClient = ApiClient;
