/**
 * HTTP server entry point.
 * Connects to MongoDB, starts Express, and handles graceful shutdown.
 */

const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(env.port, () => {
    console.log(
      `Server running in ${env.nodeEnv} mode on port ${env.port}`
    );
  });
};

// Graceful shutdown on SIGTERM / SIGINT (Docker, PM2, Ctrl+C)
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  shutdown('uncaughtException');
});

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
