/**
 * Global error handler — last middleware in the Express pipeline.
 * Normalizes Mongoose, JWT, and operational errors into consistent JSON responses.
 */

const env = require('../config/env');

/**
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let errors = err.errors || null;

  // Mongoose duplicate key (e.g. unique email violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    statusCode = 409;
    message = `${field} already exists`;
    code = 'DUPLICATE_KEY';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = 'INVALID_ID';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Log unexpected errors in development/production monitoring
  if (statusCode >= 500) {
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  const response = {
    success: false,
    message,
    code,
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace only in development for debugging
  if (!env.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler for unmatched routes.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
};

module.exports = { errorHandler, notFoundHandler };
