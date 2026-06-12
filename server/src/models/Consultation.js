/**
 * Consultation model — sessions between an astrologer and a client.
 * Scoped to astrologerId; linked to clientId for history and stats.
 */

const mongoose = require('mongoose');

const CONSULTATION_TYPES = [
  'birth_chart',
  'horoscope',
  'matchmaking',
  'remedy',
  'general',
];

const CONSULTATION_STATUSES = [
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
];

const PAYMENT_STATUSES = ['pending', 'paid', 'waived'];

const consultationSchema = new mongoose.Schema(
  {
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Astrologer',
      required: [true, 'Astrologer ID is required'],
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
      index: true,
    },
    consultationDate: {
      type: Date,
      required: [true, 'Consultation date is required'],
    },
    consultationType: {
      type: String,
      required: [true, 'Consultation type is required'],
      enum: {
        values: CONSULTATION_TYPES,
        message: `Consultation type must be one of: ${CONSULTATION_TYPES.join(', ')}`,
      },
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [480, 'Duration cannot exceed 480 minutes'],
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: `Payment status must be one of: ${PAYMENT_STATUSES.join(', ')}`,
      },
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: null,
    },
    recommendations: {
      type: String,
      trim: true,
      maxlength: [5000, 'Recommendations cannot exceed 5000 characters'],
      default: null,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: CONSULTATION_STATUSES,
        message: `Status must be one of: ${CONSULTATION_STATUSES.join(', ')}`,
      },
      default: 'scheduled',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

consultationSchema.index({ astrologerId: 1, clientId: 1 });
consultationSchema.index({ astrologerId: 1, consultationDate: -1 });
consultationSchema.index({ astrologerId: 1, paymentStatus: 1 });
consultationSchema.index({ astrologerId: 1, createdAt: -1 });
consultationSchema.index({ astrologerId: 1, nextFollowUpDate: 1 });

/**
 * Exclude soft-deleted consultations from find queries by default.
 */
consultationSchema.pre(/^find/, function excludeDeleted(next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }

  this.where({ isDeleted: false });
  next();
});

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
module.exports.CONSULTATION_TYPES = CONSULTATION_TYPES;
module.exports.CONSULTATION_STATUSES = CONSULTATION_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
