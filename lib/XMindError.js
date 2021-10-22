'use strict';

/**
 * XMindError is the Base Error from which all other more specific Xmind errors derive.
 * It is related to errors returned from CrossingMinds REST API.
 */
class XMindError extends Error {

  constructor(obj) {
    this.errorDetail = obj.error_data;
    this.message =
      this.errorDetail
        ? obj.message.replace('{error}', this.errorDetail.error)
          .replace('{type}', this.errorDetail.type)
          .replace('{key}', this.errorDetail.key)
          .replace('{method}', this.errorDetail.method)
        : obj.message;
  }

  /**
   * Error factory which takes an objXMindError and returns a specific instance of error
   * based on the error_name value.
   */
  static parseError(objXMindError) {
    switch (objXMindError.error_name) {
      case 'AuthError':
        throw new AuthError(objXMindError);
      case 'DuplicatedError':
        throw new DuplicatedError(objXMindError);
      case 'ForbiddenError':
        throw new ForbiddenError(objXMindError);
      case 'JwtTokenExpired':
        throw new JwtTokenExpiredError(objXMindError);
      case 'MethodNotAllowed':
        throw new MethodNotAllowedError(objXMindError);
      case 'NotFoundError':
        throw new NotFoundError(objXMindError);
      case 'RefreshTokenExpired':
        throw new RefreshTokenExpiredError(objXMindError);
      case 'ServerUnavailable':
        throw new ServerUnavailableError(objXMindError);
      case 'TooManyRequests':
        throw new TooManyRequestsError(objXMindError);
      case 'WrongData':
        throw new WrongDataError(objXMindError);
      case 'ServerError':
      default:
        throw new ServerError(objXMindError);
    }
  }
}

/**
 * AuthError is throwed when cannot perform authentication.
 */
class AuthError extends XMindError { }

/**
 * DuplicatedError is throwed when some resource is duplicated.
 */
class DuplicatedError extends XMindError { }

/**
 * ForbiddenError is throwed when the authenticated user does not 
 * have enough permissions to access this resource.
 */
class ForbiddenError extends XMindError { }

/**
 * JwtTokenExpiredError is throwed when the JWT token has expired.
 */
class JwtTokenExpiredError extends XMindError { }

/**
 * MethodNotAllowedError is throwed when the HTTP method is not allowed.
 */
class MethodNotAllowedError extends XMindError { }

/**
 * NotFoundError is throwed when some resource does not exist.
 */
class NotFoundError extends XMindError { }

/**
 * RefreshTokenExpiredError is throwed when the refresh token has expired
 */
class RefreshTokenExpiredError extends XMindError { }

/**
 * ServerError is throwed when the server encountered an internal error. 
 * You may be able to retry your request, but this usually indicates an 
 * error on the API side that require support.
 */
class ServerError extends XMindError { }

/**
 * ServerUnavailableError is throwed when the server is currently unavailable, 
 * please try again later.
 */
class ServerUnavailableError extends XMindError { }

/**
 * WrongDataError is throwed when there is an error in the submitted data.
 */
class WrongDataError extends XMindError { }

/**
 * TooManyRequestsError is throwed when the amount of requests exceeds the limit of your subscription.
 */
class TooManyRequestsError extends XMindError { }

module.exports.parseError = XMindError.parseError;
module.exports.XMindError = XMindError;
module.exports.AuthError = AuthError;
module.exports.DuplicatedError = DuplicatedError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.JwtTokenExpiredError = JwtTokenExpiredError;
module.exports.MethodNotAllowedError = MethodNotAllowedError;
module.exports.NotFoundError = NotFoundError;
module.exports.RefreshTokenExpiredError = RefreshTokenExpiredError;
module.exports.ServerError = ServerError;
module.exports.ServerUnavailableError = ServerUnavailableError;
module.exports.WrongDataError = WrongDataError;
module.exports.TooManyRequestsError = TooManyRequestsError;