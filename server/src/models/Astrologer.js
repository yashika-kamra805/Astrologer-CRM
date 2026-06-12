/**
 * Astrologer model — primary CRM user account.
 * Each astrologer owns an isolated set of clients, consultations, and follow-ups.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const astrologerSettingsSchema = new mongoose.Schema(
  {
    timezone: { type: String, default: 'Asia/Kolkata' },
    defaultConsultationDuration: { type: Number, default: 60 },
    currency: { type: String, default: 'INR' },
  },
  { _id: false }
);

const astrologerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password hash in query results by default
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    specializations: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    settings: {
      type: astrologerSettingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Hash password before saving when the password field is modified.
 */
astrologerSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

/**
 * Compare a plain-text password against the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
astrologerSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Astrologer = mongoose.model('Astrologer', astrologerSchema);

module.exports = Astrologer;
