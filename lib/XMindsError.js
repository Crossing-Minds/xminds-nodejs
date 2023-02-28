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
}

module.exports = {XMindsError};
