/**
 * Runs express-validator rules and returns a structured 422 response on failure.
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(
      new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', formattedErrors)
    );
  }

  next();
};

module.exports = validate;
