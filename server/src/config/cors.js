/**
 * CORS configuration for the Express app.
 * Restricts cross-origin requests to trusted frontend origins.
 */

const cors = require('cors');
const env = require('./env');

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (env.cors.origin.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
