/**
 * Authentication business logic.
 * Controllers delegate here; no HTTP concerns in this layer.
 */

const Astrologer = require('../models/Astrologer');
const ApiError = require('../utils/ApiError');
const { generateAuthTokens } = require('./token.service');

/**
 * Register a new astrologer account.
 * @param {{ name: string, email: string, password: string, phone?: string }} data
 * @returns {Promise<{ astrologer: object, tokens: { accessToken: string, refreshToken: string } }>}
 */
const register = async ({ name, email, password, phone }) => {
  const existing = await Astrologer.findOne({ email });

  if (existing) {
    throw ApiError.conflict('An account with this email already exists', 'EMAIL_EXISTS');
  }

  const astrologer = await Astrologer.create({
    name,
    email,
    password,
    phone: phone || null,
  });

  const tokens = await generateAuthTokens(astrologer);

  return {
    astrologer: astrologer.toJSON(),
    tokens,
  };
};

/**
 * Authenticate an astrologer with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ astrologer: object, tokens: { accessToken: string, refreshToken: string } }>}
 */
const login = async ({ email, password }) => {
  // Explicitly select password hash for credential verification
  const astrologer = await Astrologer.findOne({ email }).select('+password');

  if (!astrologer) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!astrologer.isActive) {
    throw ApiError.forbidden('Your account has been deactivated', 'ACCOUNT_INACTIVE');
  }

  const isPasswordValid = await astrologer.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  astrologer.lastLoginAt = new Date();
  await astrologer.save({ validateBeforeSave: false });

  const tokens = await generateAuthTokens(astrologer);

  // Re-fetch without password for the response
  const safeAstrologer = await Astrologer.findById(astrologer._id);

  return {
    astrologer: safeAstrologer.toJSON(),
    tokens,
  };
};

/**
 * Fetch the currently authenticated astrologer by ID.
 * @param {string} astrologerId
 * @returns {Promise<object>}
 */
const getCurrentUser = async (astrologerId) => {
  const astrologer = await Astrologer.findById(astrologerId);

  if (!astrologer) {
    throw ApiError.notFound('Astrologer not found', 'ASTROLOGER_NOT_FOUND');
  }

  if (!astrologer.isActive) {
    throw ApiError.forbidden('Your account has been deactivated', 'ACCOUNT_INACTIVE');
  }

  return astrologer.toJSON();
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
