'use strict';

/**
 * XMindsError is the Base Error from which all other more specific Xmind errors derive.
 * It is related to errors returned from CrossingMinds REST API.
 */
class XMindsError {

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
   * Error factory which takes an objXMindsError and returns a specific instance of error
   * based on the error_name value.
   */
  static parseError(objXMindsError) {
    switch (objXMindsError.error_name) {
      case 'AuthError':
        throw new AuthError(objXMindsError);
      case 'DuplicatedError':
        throw new DuplicatedError(objXMindsError);
      case 'ForbiddenError':
        throw new ForbiddenError(objXMindsError);
      case 'JwtTokenExpired':
        throw new JwtTokenExpiredError(objXMindsError);
      case 'MethodNotAllowed':
        throw new MethodNotAllowedError(objXMindsError);
      case 'NotFoundError':
        throw new NotFoundError(objXMindsError);
      case 'RefreshTokenExpired':
        throw new RefreshTokenExpiredError(objXMindsError);
      case 'ServerUnavailable':
        throw new ServerUnavailableError(objXMindsError);
      case 'TooManyRequests':
        throw new TooManyRequestsError(objXMindsError);
      case 'WrongData':
        throw new WrongDataError(objXMindsError);
      case 'ServerError':
      default:
        throw new ServerError(objXMindsError);
    }
  }
}

/**
 * AuthError is throwed when cannot perform authentication.
 */
class AuthError extends XMindsError { }

/**
 * DuplicatedError is throwed when some resource is duplicated.
 */
class DuplicatedError extends XMindsError { }

/**
 * ForbiddenError is throwed when the authenticated user does not 
 * have enough permissions to access this resource.
 */
class ForbiddenError extends XMindsError { }

/**
 * JwtTokenExpiredError is throwed when the JWT token has expired.
 */
class JwtTokenExpiredError extends XMindsError { }

/**
 * MethodNotAllowedError is throwed when the HTTP method is not allowed.
 */
class MethodNotAllowedError extends XMindsError { }

/**
 * NotFoundError is throwed when some resource does not exist.
 */
class NotFoundError extends XMindsError { }

/**
 * RefreshTokenExpiredError is throwed when the refresh token has expired
 */
class RefreshTokenExpiredError extends XMindsError { }

/**
 * ServerError is throwed when the server encountered an internal error. 
 * You may be able to retry your request, but this usually indicates an 
 * error on the API side that require support.
 */
class ServerError extends XMindsError { }

/**
 * ServerUnavailableError is throwed when the server is currently unavailable, 
 * please try again later.
 */
class ServerUnavailableError extends XMindsError { }

/**
 * WrongDataError is throwed when there is an error in the submitted data.
 */
class WrongDataError extends XMindsError { }

/**
 * TooManyRequestsError is throwed when the amount of requests exceeds the limit of your subscription.
 */
class TooManyRequestsError extends XMindsError { }

module.exports.parseError = XMindsError.parseError;
module.exports.XMindsError = XMindsError;
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