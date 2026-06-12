/**
 * MongoDB transaction helper.
 * Uses multi-document transactions when the deployment supports them (replica set / Atlas).
 * Falls back to sequential execution on standalone instances for local development.
 */

const mongoose = require('mongoose');

/**
 * Returns true when the error indicates transactions are unsupported.
 * @param {Error} err
 */
const isTransactionNotSupportedError = (err) =>
  err.code === 20 ||
  err.codeName === 'IllegalOperation' ||
  /replica set/i.test(err.message);

/**
 * Run a callback inside a transaction when supported.
 * @param {(session: import('mongoose').ClientSession | null) => Promise<void>} callback
 */
const runInTransaction = async (callback) => {
  const session = await mongoose.startSession();

  try {
    let result;

    try {
      await session.withTransaction(async () => {
        result = await callback(session);
      });
    } catch (err) {
      if (!isTransactionNotSupportedError(err)) {
        throw err;
      }

      // Standalone MongoDB — run without a session (local dev fallback)
      result = await callback(null);
    }

    return result;
  } finally {
    session.endSession();
  }
};

module.exports = { runInTransaction };
