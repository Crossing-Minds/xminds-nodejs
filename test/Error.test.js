require('jest-fetch-mock');
const { ApiClient } = require("../lib/ApiClient");
const fetchMock = require('fetch-mock');
jest.setMock('isomorphic-fetch', fetchMock);
const { parseError, AuthError, JwtTokenExpiredError,
  DuplicatedError, TooManyRequestsError, RefreshTokenExpiredError,
  WrongDataError, ForbiddenError, NotFoundError, MethodNotAllowedError,
  ServerUnavailableError, ServerError, XmindsError } = require('../lib/XmindsError');

// ERROR TESTS
describe('ERRORS TESTS', () => {
  const host = "http://localhost";
  const api = new ApiClient(host);
  // Headers 
  const headers = {
    'User-Agent': 'CrossingMinds/v1',
    'Content-type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer '
  }

  test('AuthError', async () => {
    const expectedError = {
      error_code: 21,
      error_name: 'AuthError',
      message: 'Cannot perform authentication: account password is incorrect',
      error_data: {
        error: 'account password is incorrect',
        name: 'INCORRECT_PASSWORD'
      }
    }
    expect(() => parseError(expectedError)).toThrowError(AuthError);
  });

  test('JwtTokenExpiredError', async () => {
    const expectedError = {
      error_code: 22,
      error_name: 'JwtTokenExpired',
      message: 'The JWT token has expired',
      error_data: { name: 'JWT_TOKEN_EXPIRED' }
    }
    expect(() => parseError(expectedError)).toThrowError(JwtTokenExpiredError);
  });

  test('DuplicatedError', async () => {
    const expectedError = {
      "error_code": 42,
      "error_name": "DuplicatedError",
      "message": "The item 11111 is duplicated",
      "error_data": {
        "type": "item",
        "key": 11111,
        "name": "DUPLICATED_ITEM_ID"
      }
    }
    expect(() => parseError(expectedError)).toThrowError(DuplicatedError);
  });

  test('TooManyRequestsError', async () => {
    const expectedError = {
      "error_code": 2,
      "error_name": "TooManyRequests",
      "message": "The amount of requests exceeds the limit of your subscription.",
      "error_data": {
        "name": "RATE_LIMIT_OVERFLOW"
      }
    }
    expect(() => parseError(expectedError)).toThrowError(TooManyRequestsError);
  });

  test('RefreshTokenExpiredError', async () => {
    const expectedError = {
      "error_code": 28,
      "error_name": "RefreshTokenExpired",
      "message": "The refresh token has expired",
      "error_data": {
        "name": "REFRESH_TOKEN_EXPIRED"
      }
    }
    expect(() => parseError(expectedError)).toThrowError(RefreshTokenExpiredError);
  });

  test('WrongDataError', async () => {
    const expectedError = {
      "error_code": 40,
      "error_name": "WrongData",
      "message": "There is an error in the submitted data",
      "error_data": {
        "name": "WRONG_DATA_TYPE"
      }
    }
    expect(() => parseError(expectedError)).toThrowError(WrongDataError);
  });

  test('ForbiddenError', async () => {
    const expectedError = {
      "error_code": 50,
      "error_name": "ForbiddenError",
      "message": "You do not have enough permissions to access this resource",
      "error_data": {
        "name": "INCORRECT_FRONTEND_USER_ID"
      }
    }
    expect(() => parseError(expectedError)).toThrowError(ForbiddenError);
  });

  test('NotFoundError', async () => {
    const expectedError = {
      "error_code": 60,
      "error_name": "NotFoundError",
      "message": "Some resource does not exist",
      "error_data": {
        "name": "ACCOUNT_NOT_FOUND"
      }
    }
    expect(() => parseError(expectedError)).toThrowError(NotFoundError);
  });

  test('MethodNotAllowedError', async () => {
    const expectedError = {
      "error_code": 70,
      "error_name": "MethodNotAllowed",
      "message": "The HTTP method is not allowed",
      "error_data": {
        "name": "HTTP_METHOD_NOT_ALLOWED"
      }
    }
    expect(() => parseError(expectedError)).toThrowError(MethodNotAllowedError);
  });

  test('ServerUnavailableError', async () => {
    const expectedError = {
      "error_code": 1,
      "error_name": "ServerUnavailable",
      "message": "The server is currently unavailable, please try again later"
    }
    expect(() => parseError(expectedError)).toThrowError(ServerUnavailableError);
  });

  test('ServerError', async () => {
    const expectedError = {
      "error_code": 0,
      "error_name": "ServerError",
      "message": "The server encountered an internal error"
    }
    expect(() => parseError(expectedError)).toThrowError(ServerError);
  });

  test('XmindsError', async () => {
    const expectedError = {
      error_code: 21,
      error_name: 'AuthError',
      message: 'Cannot perform authentication: account password is incorrect',
      error_data: {
        error: 'account password is incorrect',
        name: 'INCORRECT_PASSWORD'
      }
    }
    let error = new XmindsError(expectedError);
    expect(error.message).toEqual('Cannot perform authentication: account password is incorrect');
  });

  test('listAllDatabases should throw a ServerError', async () => {
    const serverErrorResponse = new Response('{"error_code": "0", "message": "Internal Server Error"}', { status: 500 });
    fetchMock.getOnce(host + '/databases/?amt=64&page=1', serverErrorResponse, { headers: headers });
    api.listAllDatabases(64, 1).catch(err => {
      expect(err.message).toEqual('Internal Server Error');
    });
  });

});