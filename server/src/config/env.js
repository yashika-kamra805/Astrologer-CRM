/**
 * Centralized environment configuration.
 * Validates required variables at startup so the app fails fast in misconfigured deployments.
 */

require('dotenv').config();

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill in the values.'
  );
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isProduction: process.env.NODE_ENV === 'production',

  mongodbUri: process.env.MONGODB_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    // Support multiple origins in production (e.g. app + admin panel)
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:5173'],
  },
};

module.exports = env;
