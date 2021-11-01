const { ApiClient } = require("./ApiClient.js")

const api = null;

export function initialize(refreshToken, userAgent = null, host = null) {
    this.api = new ApiClient(refreshToken, userAgent, host);
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
* @returns {Promise.<Object>} Object represents the ID of the created account if resolved. XMindsError if rejected
* 
*/
export function createIndividualAccount(firstName, lastName, email, password, role = 'backend') {
    return this.api.createIndividualAccount(firstName, lastName, email, password, role);
}

/**
   * Create a new service account, identified by a service name.
   * 
   * @param {String} name 
   * @param {String} password 
   * @param {String} role
   * @returns {Promise<Object>} Object represents the ID of the created account if resolved. XMindsError if rejected
   */
export function createServiceAccount(name, password, role = 'frontend') {
    return this.api.createServiceAccount(name, password, role);
}

/**
   * Send a new verification code to the email address of an individual account.
   * 
   * @param {String} email
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
export function resendVerificationCode(email) {
    return this.api.resendVerificationCode(email);
}

/**
   * Verify the email of an individual account.
   * 
   * @param {String} code 
   * @param {String} email
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
export function verifyAccount(code, email) {
    return this.api.verifyAccount(code, email);
}

/**
   * Retrieve all the accounts that belong to the organization of the token.
   * 
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of accounts. XMindsError if rejected
   */
export function listAllAccounts() {
    return this.api.listAllAccounts();
}

/**
   * Delete another individual account by email address that belong to the organization of the token.
   * 
   * @param {String} email 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
export function deleteIndividualAccount(email) {
    return this.api.deleteIndividualAccount(email);
}

/**
   * Delete another service account by name that belong to the organization of the token.
   * 
   * @param {String} name 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
export function deleteServiceAccount(name) {
    return this.api.deleteServiceAccount(name);
}

/**
   * Delete the account you’re logged to with your current token.
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   */
export function deleteCurrentAccount() {
    return this.api.deleteCurrentAccount();
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
export function loginIndividual(email, password, dbId, frontendUserId = null) {
    return this.api.loginIndividual(email, password, dbId, frontendUserId);
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
export function loginService(name, password, dbId, frontendUserId = null) {
    return this.api.loginService(name, password, dbId, frontendUserId);
}

/**
   * Login with the root account, without selecting any database.
   * 
   * @param {String} email 
   * @param {String} password 
   * @returns {Promise<Object>} Object represents the jwtToken information if resolved. XMindsError if rejected
   */
export function loginRoot(email, password) {
    return this.api.loginRoot(email, password);
}

/**
   * Login on a database with your account, using a refresh token.
   * 
   * @param {String} refreshToken 
   * @returns {Promise<Object>} Object represents the jwtToken, refreshToken and database information if resolved. XMindsError if rejected
   */
export function loginRefreshToken(refreshToken = '') {
    return this.api.loginRefreshToken(refreshToken);
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
export function createDatabase(name, description, itemIdType, userIdType) {
    return this.api.createDatabase(name, description, itemIdType, userIdType);
}

/**
   * Get all databases for the organization you’re logged to with your current token.
   * 
   * @param {Number} amt 
   * @param {Number} page 
   * @returns {Promise<Array<Object>>} Array of objects that represents a list of databases. XMindsError if rejected
   * 
   */
export function listAllDatabases(amt = 64, page = 1) {
    return this.api.listAllDatabases(amt, page);
}

/**
   * Get the metadata for the database you’re logged to with your current token.
   * 
   * @returns {Promise<Array<Object>>} Object that represents a database. XMindsError if rejected
   * 
   */
export function getCurrentDatabase() {
    return this.api.getCurrentDatabase();
}

/**
   * Delete the metadata for the database you’re logged to with your current token.
   * 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function deleteCurrentDatabase() {
    return this.api.deleteCurrentDatabase();
}

/**
   * Retrieve status of database. Initially the database will be in “pending” status. 
   * Until the status switch to “ready” you will not be able to get recommendations.
   * 
   * @returns {Promise<Array<Object>>} Object that represents the status. XMindsError if rejected
   * 
   */
export function getCurrentDatabaseStatus() {
    return this.api.getCurrentDatabaseStatus();
}

// USER-DATA-PROPERTIES ENDPOINTS

/**
 * Get one user-property given its propertyName.
 * 
 * @param {String} propertyName 
 * @returns {Promise.<Object>} Object that represents the user property, if resolved. XMindsError if rejected
 * 
 */
export function getUserProperty(propertyName) {
    return this.api.getUserProperty(propertyName);
}

/**
   * Get all user-properties for the current database.
   * 
   * @returns {Promise.<Object>} Object that represents an array of user properties, if resolved. XMindsError if rejected
   * 
   */
export function listAllUserProperties() {
    return this.api.listAllUserProperties();
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
export function createUserProperty(propertyName, valueType, repeated = false) {
    return this.api.createUserProperty(propertyName, valueType, repeated);
}

/**
   * Delete an user-property given by its name
   * 
   * @param {String} propertyName 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function deleteUserProperty(propertyName) {
    return this.api.deleteUserProperty(propertyName);
}

/**
   * Get one user given its ID.
   * 
   * @param {String} userId 
   * @returns {Promise.<Object>} Object that represents the user, if resolved. XMindsError if rejected
   * 
   */
export function getUser(userId) {
    return this.api.getUser(userId);
}

/**
   * Create a new user, or update it if the userId already exists.
   * 
   * @param {String} userId 
   * @param {Object} user
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function createOrUpdateUser(userId, user) {
    return this.api.createOrUpdateUser(userId, user);
}

/**
   * Create many users in bulk, or update the ones for which the id already exist.
   * 
   * @param {Array} users array of users
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function createOrUpdateUsersBulk(users, chunkSize = (1 << 10)) {
    return this.api.createOrUpdateUsersBulk(users, chunkSize);
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
export function listUsersPaginated(amt = 300, cursor) {
    return this.api.listUsersPaginated(amt, cursor);
}

/**
   * Get multiple users given their IDs.
   * 
   * @param {Array<String>} usersId an array of users id
   * @returns {Promise.<Object>} Object that represents the list of users, if resolved. XMindsError if rejected
   * 
   */
export function listUsers(usersId) {
    return this.api.listUsers(usersId);
}

// ITEM-DATA-PROPERTIES ENDPOINTS

/**
 * Get one item-property given its propertyName.
 * 
 * @param {String} propertyName 
 * @returns {Promise.<Object>} Object that represents the item property, if resolved. XMindsError if rejected
 * 
 */
export function getItemProperty(propertyName) {
    return this.api.getItemProperty(propertyName);
}

/**
   * Get all item-properties for the current database.
   * 
   * @returns {Promise.<Object>} Object that represents an array of item properties, if resolved. XMindsError if rejected
   * 
   */
export function listAllItemProperties() {
    return this.api.listAllItemProperties();
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
export function createItemProperty(propertyName, valueType, repeated = false) {
    return this.api.createItemProperty(propertyName, valueType, repeated);
}

/**
   * Delete an item-property given by its name
   * 
   * @param {String} propertyName 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function deleteItemProperty(propertyName) {
    return this.api.deleteItemProperty(propertyName);
}

/**
   * Get one item given its ID.
   * 
   * @param {String} itemId 
   * @returns {Promise.<Object>} Object that represents the item, if resolved. XMindsError if rejected
   * 
   */
export function getItem(itemId) {
    return this.api.getItem(itemId);
}

/**
   * Create a new item, or update it if the itemId already exists.
   * 
   * @param {String} itemId 
   * @param {Object} item
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function createOrUpdateItem(itemId, item) {
    return this.api.createOrUpdateItem(itemId, item);
}

/**
   * Create many items in bulk, or update the ones for which the id already exist.
   * 
   * @param {Array} items array of items
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function createOrUpdateItemsBulk(items, chunkSize = (1 << 10)) {
    return this.api.createOrUpdateItemsBulk(items, chunkSize);
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
export function listItemsPaginated(amt = 300, cursor) {
    return this.api.listItemsPaginated(amt, cursor);
}

/**
   * Get multiple items given their IDs.
   * 
   * @param {Array<String>} itemsId an array of items id
   * @returns {Promise.<Object>} Object that represents the list of items, if resolved. XMindsError if rejected
   * 
   */
export function listItems(itemsId) {
    return this.api.listItems(itemsId);
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
export function createOrUpdateRating(userId, itemId, rating, timestamp = null) {
    return this.api.createOrUpdateRating(userId, itemId, rating, timestamp);
}

/**
   * Delete a single rating for a given user.
   * 
   * @param {String} userId 
   * @param {String} itemId 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function deleteRating(userId, itemId) {
    return this.api.deleteRating(userId, itemId);
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
export function listUserRatings(userId, page = 1, amt = 64) {
    return this.api.listUserRatings(userId, page, amt);
}

/**
   * Create or update bulks of ratings for a single user and many items.
   * 
   * @param {String} userId 
   * @param {Array<Object>} ratings array of ratings
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function createOrUpdateUserRatingsBulk(userId, ratings) {
    return this.api.createOrUpdateUserRatingsBulk(userId, ratings);
}

/**
   * Delete all ratings of a given user.
   * 
   * @param {String} userId 
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function deleteUserRatings(userId) {
    return this.api.deleteUserRatings(userId);
}

/**
   * Create or update large bulks of ratings for many users and many items.
   * 
   * @param {Array<Object>} ratings array of ratings
   * @param {Number} chunkSize split the requests in chunks of this size (default: 1K)
   * @returns {Promise<Object>} Empty content if resolved. XMindsError if rejected
   * 
   */
export function createOrUpdateRatingsBulk(ratings, chunkSize = (1 << 14)) {
    return this.api.createOrUpdateRatingsBulk(ratings, chunkSize);
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
export function listRatings(page = 1, cursor = null) {
    return this.api.listRatings(page, cursor);
}

// RECOMMENDATIONS ENDPOINTS

/**
   * Get similar items.
   * 
   * @param {String} itemId 
   * @param {Number} amt 
   * @param {String} cursor 
   * @param {Array<Object>} filters 
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindsError if rejected
   * 
   */
export function getRecommendationsItemToItems(itemId, amt = null, cursor = null, filters = null) {
    return this.api.getRecommendationsItemToItems(itemId, amt, cursor, filters);
}

/**
   * Get items recommendations given the ratings of an anonymous session.
   * 
   * @param {Number} amt 
   * @param {String} cursor 
   * @param {Array<Object>} filters 
   * @param {Array<Object>} ratings 
   * @param {Object} userProperties 
   * @param {Boolean} excludeRatedItems 
   * @param {Array<Object>} interactions
   * @param {List<Object>} reranking 
   * @param {String} scenario
   * @param {Boolean} skipDefaultScenario
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindsError if rejected
   * 
   */
export function getRecommendationsSessionToItems(amt = null, cursor = null, filters = null, ratings = null, userProperties = null, excludeRatedItems = false, interactions = null, reranking = null, scenario = null, skipDefaultScenario = false) {
    return this.api.getRecommendationsSessionToItems(amt, cursor, filters, ratings, userProperties, excludeRatedItems, interactions, reranking, scenario, skipDefaultScenario);
}

/**
   * Get items recommendations given a user ID.
   * 
   * @param {String} userId 
   * @param {Number} amt 
   * @param {String} cursor 
   * @param {Array<Object>} filters 
   * @param {Boolean} excludeRatedItems 
   * @returns {Promise.<Object>} Object that represents the list of items id, if resolved. XMindsError if rejected
   * 
   */
export function getRecommendationsUserToItems(userId, amt = null, cursor = null, filters = null, excludeRatedItems = false) {
    return this.api.getRecommendationsUserToItems(userId, amt, cursor, filters, excludeRatedItems);
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
export function createInteraction(userId, itemId, interactionType, timestamp = null) {
    return this.api.createInteraction(userId, itemId, interactionType, timestamp);
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
export function createOrUpdateUserInteractionsBulk(userId, interactions) {
    return this.api.createOrUpdateUserInteractionsBulk(userId, interactions);
}
