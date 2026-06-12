/**
 * Express application setup.
 * Configures middleware, routes, and error handling.
 * Does NOT start the HTTP server — see server.js.
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const corsMiddleware = require('./config/cors');
const env = require('./config/env');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS — must be before routes
app.use(corsMiddleware);

// Request logging (skip in test environment)
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser — needed for httpOnly refresh token
app.use(cookieParser());

// API routes
app.use('/api/v1', apiRoutes);

// Root redirect for convenience
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Astrologer CRM API',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

// 404 + global error handler (order matters)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
