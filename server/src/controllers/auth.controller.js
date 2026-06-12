/**
 * Authentication HTTP controllers.
 * Thin layer — delegates business logic to auth.service.
 */

const env = require('../config/env');
const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

/**
 * Cookie options for the httpOnly refresh token.
 * refreshToken is stored in a cookie; accessToken is returned in the JSON body.
 */
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

/**
 * POST /api/v1/auth/register
 * Create a new astrologer account and return auth tokens.
 */
const register = catchAsync(async (req, res) => {
  const { astrologer, tokens } = await authService.register(req.body);

  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      astrologer,
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * POST /api/v1/auth/login
 * Authenticate with email/password and return auth tokens.
 */
const login = catchAsync(async (req, res) => {
  const { astrologer, tokens } = await authService.login(req.body);

  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      astrologer,
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * GET /api/v1/auth/me
 * Return the profile of the currently authenticated astrologer.
 */
const getMe = catchAsync(async (req, res) => {
  const astrologer = await authService.getCurrentUser(req.astrologer.id);

  res.status(200).json({
    success: true,
    data: { astrologer },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
