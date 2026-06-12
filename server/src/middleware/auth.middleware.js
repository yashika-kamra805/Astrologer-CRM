/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches the astrologer ID to req.astrologer.
 */

const Astrologer = require('../models/Astrologer');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../services/token.service');

/**
 * Protect routes that require a valid access token.
 * Sets req.astrologer = { id, email } on success.
 */
const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      ApiError.unauthorized('Access token is required', 'TOKEN_REQUIRED')
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(
      ApiError.unauthorized('Access token is required', 'TOKEN_REQUIRED')
    );
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(err);
  }

  const astrologer = await Astrologer.findById(decoded.sub).select(
    '_id email isActive'
  );

  if (!astrologer) {
    return next(
      ApiError.unauthorized('Astrologer no longer exists', 'ASTROLOGER_NOT_FOUND')
    );
  }

  if (!astrologer.isActive) {
    return next(
      ApiError.forbidden('Your account has been deactivated', 'ACCOUNT_INACTIVE')
    );
  }

  req.astrologer = {
    id: astrologer._id.toString(),
    email: astrologer.email,
  };

  next();
};

module.exports = { protect };
