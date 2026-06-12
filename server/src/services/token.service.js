/**
 * JWT token generation and verification utilities.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');

/**
 * Build the JWT payload for an astrologer.
 * @param {import('mongoose').Document} astrologer
 */
const buildTokenPayload = (astrologer) => ({
  sub: astrologer._id.toString(),
  email: astrologer.email,
});

/**
 * Sign a short-lived access token.
 * @param {import('mongoose').Document} astrologer
 * @returns {string}
 */
const generateAccessToken = (astrologer) =>
  jwt.sign(buildTokenPayload(astrologer), env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });

/**
 * Sign a long-lived refresh token (JWT wrapper around a stored session).
 * @param {import('mongoose').Document} astrologer
 * @returns {string}
 */
const generateRefreshToken = (astrologer) =>
  jwt.sign(
    { sub: astrologer._id.toString(), type: 'refresh' },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );

/**
 * Hash a refresh token before persisting to the database.
 * @param {string} token
 * @returns {string}
 */
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Persist a refresh token session for an astrologer.
 * @param {import('mongoose').Document} astrologer
 * @returns {Promise<string>} Raw refresh token to send to client
 */
const createRefreshTokenSession = async (astrologer) => {
  const rawToken = generateRefreshToken(astrologer);

  const decoded = jwt.decode(rawToken);
  const expiresAt = new Date(decoded.exp * 1000);

  await RefreshToken.create({
    astrologerId: astrologer._id,
    token: hashToken(rawToken),
    expiresAt,
  });

  return rawToken;
};

/**
 * Issue both access and refresh tokens for a successful auth event.
 * @param {import('mongoose').Document} astrologer
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
const generateAuthTokens = async (astrologer) => {
  const accessToken = generateAccessToken(astrologer);
  const refreshToken = await createRefreshTokenSession(astrologer);

  return { accessToken, refreshToken };
};

/**
 * Verify an access token and return its decoded payload.
 * @param {string} token
 * @returns {object}
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.accessSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token', 'INVALID_TOKEN');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  verifyAccessToken,
  hashToken,
};
