const { XMindRequest } = require('./ApiRequest');
const { JwtTokenExpiredError } = require('./XMindError');
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
   * Wrapper function to ensure that login refresh token is
   * executed if a JwtTokenExpiredError is received.
   * (it will be replaced in the future with a Decorator implementation)
   * 
   * @param {Function} method
   */
  #autoRefreshToken(method) {
    return function() {
      let args = [].splice.call(arguments, 0);
      return method.apply(this, args).catch(err => {
        if(err instanceof JwtTokenExpiredError) {
          return this.loginRefreshToken().then(response => {
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
  createIndividualAccount = function(firstName, lastName, email, password, role='backend') {
    let bodyParams = {
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'password': password,
      'role': role
    }
    return this.#request.post('/accounts/individual/', bodyParams);
  }
  // Wrapping
  createIndividualAccount = this.#autoRefreshToken(this.createIndividualAccount);

  /**
   * Create a new service account, identified by a service name.
   * 
   * @param {String} name 
   * @param {String} password 
   * @param {String} role
   * @returns {Promise<Object>} Object represents the ID of the created account if resolved. XMindError if rejected
   */
  createServiceAccount = function(name, password, role='frontend') {
    let bodyParams = {
      'name': name,
      'password': password,
      'role': role
    }
    return this.#request.post('/accounts/service/', bodyParams);
  }
  // Wrapping
  createServiceAccount = this.#autoRefreshToken(this.createServiceAccount);

  /**
   * Send a new verification code to the email address of an individual account.
   * 
   * @param {String} email
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  resendVerificationCode = function(email) {
    let bodyParams = {'email': email}
    return this.#request.put('/accounts/resend-verification-code/', bodyParams);
  }
  // Wrapping
  resendVerificationCode = this.#autoRefreshToken(this.resendVerificationCode);

  /**
   * Verify the email of an individual account.
   * 
   * @param {String} code 
   * @param {String} email
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  verifyAccount = function(code, email) {
    let queryParams = {'code': code, 'email': email}
    return this.#request.get('/accounts/verify/?' + querystring.stringify(queryParams));
  }
  // Wrapping
  verifyAccount = this.#autoRefreshToken(this.verifyAccount);

  /**
   * Retrieve all the accounts that belong to the organization of the token.
   * 
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of accounts. XMindError if rejected
   */
  listAllAccounts = function() {
    return this.#request.get('/organizations/current/accounts/');
  }
  // Wrapping
  listAllAccounts = this.#autoRefreshToken(this.listAllAccounts);

  /**
   * Delete another individual account by email address that belong to the organization of the token.
   * 
   * @param {String} email 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  deleteIndividualAccount = function(email) {
    let bodyParams = {'email': email};
    return this.#request.delete('/accounts/individual/', bodyParams);
  }
  // Wrapping
  deleteIndividualAccount = this.#autoRefreshToken(this.deleteIndividualAccount);

  /**
   * Delete another service account by name that belong to the organization of the token.
   * 
   * @param {String} name 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  deleteServiceAccount = function(name) {
    let bodyParams = {'name': name};
    return this.#request.delete('/accounts/service/', bodyParams);
  }
  // Wrapping
  deleteServiceAccount = this.#autoRefreshToken(this.deleteServiceAccount);

  /**
   * Delete the account you’re logged to with your current token.
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   */
  deleteCurrentAccount = function() {
    // Remove the cached data of the account being deleted
    this.#request.clearJwtToken();
    this.#setRefreshToken('');
    return this.#request.delete('/accounts/');
  }
  // Wrapping
  deleteCurrentAccount = this.#autoRefreshToken(this.deleteCurrentAccount);


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
  loginIndividual = function(email, password, dbId, frontendUserId='') {
    let bodyParams = {
      'email': email, 
      'password': password,
      'db_id' : dbId
    }
    if(frontendUserId !== '')
      bodyParams.frontend_user_id = frontendUserId;
    return this.#request.post('/login/individual/', bodyParams)
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
  loginService = function(name, password, dbId, frontendUserId='') {
    let bodyParams = {
      'name': name, 
      'password': password,
      'db_id' : dbId
    }
    if(frontendUserId !== '')
      bodyParams.frontend_user_id = frontendUserId;
    return this.#request.post('/login/service/', bodyParams)
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
  loginRoot = function(email, password) {
    let bodyParams = {'email': email, 'password': password};
    return this.#request.post('/login/root/', bodyParams)
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
  loginRefreshToken = function(refreshToken='') {
    let bodyParams = {'refresh_token': refreshToken!=='' ? refreshToken : this.#getRefreshToken()};
    return this.#request.post('/login/refresh-token/', bodyParams)
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
  createDatabase = function(name, description, itemIdType, userIdType) {
    let bodyParams = {
      'name': name,
      'description': description,
      'item_id_type': itemIdType,
      'user_id_type': userIdType
    }
    return this.#request.post('/databases/', bodyParams);
  }
  // Wrapping
  createDatabase = this.#autoRefreshToken(this.createDatabase);

  /**
   * Get all databases for the organization you’re logged to with your current token.
   * 
   * @param {Number} amt 
   * @param {Number} page 
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of databases. XMindError if rejected
   * 
   */
  listAllDatabases = function(amt=64, page=1) {
    let bodyParams = {
      'amt': amt,
      'page': page
    }
    return this.#request.get('/databases/');
  }
  // Wrapping
  listAllDatabases = this.#autoRefreshToken(this.listAllDatabases);

  /**
   * Get the metadata for the database you’re logged to with your current token.
   * 
   * @returns {Promise<Array<Object>>} Object that represents a database. XMindError if rejected
   * 
   */
  getCurrentDatabase = function() {
    return this.#request.get('/databases/current/');
  }
  // Wrapping
  getCurrentDatabase = this.#autoRefreshToken(this.getCurrentDatabase);

  /**
   * Delete the metadata for the database you’re logged to with your current token.
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindError if rejected
   * 
   */
  deleteCurrentDatabase = function() {
    return this.#request.delete('/databases/current/');
  }
  // Wrapping
  deleteCurrentDatabase = this.#autoRefreshToken(this.deleteCurrentDatabase);

  /**
   * Retrieve status of database. Initially the database will be in “pending” status. 
	 * Until the status switch to “ready” you will not be able to get recommendations.
   * 
   * @returns {Promise<Array<Object>>} Object that represents the status. XMindError if rejected
   * 
   */
  getCurrentDatabaseStatus = function() {
    return this.#request.get('/databases/current/status/');
  }
  // Wrapping
  getCurrentDatabaseStatus = this.#autoRefreshToken(this.getCurrentDatabaseStatus);

}

/**
* The default API client implementation.
* @type {module:ApiClient}
*/
ApiClient.instance = new ApiClient();
module.exports.ApiClient = ApiClient;
