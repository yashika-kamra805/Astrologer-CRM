/**
 * Refresh token store for JWT rotation.
 * Tokens are stored hashed; raw tokens are only sent to the client once.
 */

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Astrologer',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// MongoDB TTL index — automatically delete expired documents
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
