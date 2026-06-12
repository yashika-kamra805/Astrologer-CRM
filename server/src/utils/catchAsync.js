/**
 * Wraps async route handlers to forward rejected promises to Express error middleware.
 * Eliminates repetitive try/catch blocks in controllers.
 *
 * @param {Function} fn - Async Express route handler (req, res, next)
 * @returns {Function}
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
