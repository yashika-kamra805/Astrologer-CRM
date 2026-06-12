/**
 * Client model — people consulted by an astrologer.
 * All records are scoped to a single astrologer (multi-tenant).
 */

const mongoose = require('mongoose');

const CLIENT_STATUSES = ['lead', 'active', 'inactive'];
const GENDERS = ['male', 'female', 'other'];

const placeOfBirthSchema = new mongoose.Schema(
  {
    city: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { _id: false }
);

const clientSchema = new mongoose.Schema(
  {
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Astrologer',
      required: [true, 'Astrologer ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      validate: {
        validator(value) {
          if (!value) return true;
          return /^\S+@\S+\.\S+$/.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: GENDERS,
        message: `Gender must be one of: ${GENDERS.join(', ')}`,
      },
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    timeOfBirth: {
      type: String,
      trim: true,
      default: null,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time of birth must be in HH:mm format'],
    },
    placeOfBirth: {
      type: placeOfBirthSchema,
      default: () => ({}),
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: CLIENT_STATUSES,
        message: `Status must be one of: ${CLIENT_STATUSES.join(', ')}`,
      },
      default: 'lead',
    },
    source: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: null,
    },
    totalConsultations: {
      type: Number,
      default: 0,
      min: [0, 'Total consultations cannot be negative'],
    },
    lastConsultationAt: {
      type: Date,
      default: null,
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

// Unique phone per astrologer among non-deleted clients
clientSchema.index(
  { astrologerId: 1, phone: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

clientSchema.index({ astrologerId: 1, name: 1 });
clientSchema.index({ astrologerId: 1, status: 1 });
clientSchema.index({ astrologerId: 1, createdAt: -1 });

/**
 * Default query helper — exclude soft-deleted clients unless explicitly included.
 */
clientSchema.pre(/^find/, function excludeDeleted(next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }

  this.where({ isDeleted: false });
  next();
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
module.exports.CLIENT_STATUSES = CLIENT_STATUSES;
module.exports.GENDERS = GENDERS;
