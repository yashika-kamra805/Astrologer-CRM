/**
 * MongoDB connection via Mongoose.
 * Handles connection lifecycle events and graceful shutdown.
 */

const mongoose = require('mongoose');
const env = require('./env');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * Connect to MongoDB with recommended production settings.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(env.mongodbUri, {
    // Use new URL parser and unified topology by default in Mongoose 6+
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  console.log(`MongoDB connected: ${conn.connection.host}`);

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  return conn;
};

/**
 * Close the database connection (used during graceful shutdown).
 */
const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
};

module.exports = { connectDB, disconnectDB };
