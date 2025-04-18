/**
 * Global error handler middleware
 */

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Format the error response
  const errorResponse = {
    error: {
      status: statusCode,
      message,
    },
  };

  // Add validation errors if available
  if (err.errors) {
    errorResponse.error.details = err.errors;
  }

  // Add request ID if available for tracking
  if (req.id) {
    errorResponse.error.requestId = req.id;
  }

  // Log the error (in a real app, you would use a proper logging service)
  console.error(`[${new Date().toISOString()}] Error ${statusCode}: ${message}`);

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

module.exports = {
  errorHandler,
  ApiError,
}; 