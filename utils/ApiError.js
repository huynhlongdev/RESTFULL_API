class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;

    // Giúp hiển thị stack trace chính xác
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
