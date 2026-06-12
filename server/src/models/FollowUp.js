/**
 * FollowUp model — tasks and reminders tied to clients and consultations.
 * Scoped to astrologerId for multi-tenant isolation.
 */

const mongoose = require('mongoose');

const FOLLOW_UP_PRIORITIES = ['low', 'medium', 'high'];

const FOLLOW_UP_STATUSES = ['pending', 'completed', 'overdue', 'cancelled'];

const followUpSchema = new mongoose.Schema(
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
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: null,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    priority: {
      type: String,
      enum: {
        values: FOLLOW_UP_PRIORITIES,
        message: `Priority must be one of: ${FOLLOW_UP_PRIORITIES.join(', ')}`,
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: FOLLOW_UP_STATUSES,
        message: `Status must be one of: ${FOLLOW_UP_STATUSES.join(', ')}`,
      },
      default: 'pending',
    },
    completionNotes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Completion notes cannot exceed 5000 characters'],
      default: null,
    },
    completedAt: {
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

followUpSchema.index({ astrologerId: 1, dueDate: 1 });
followUpSchema.index({ astrologerId: 1, status: 1 });
followUpSchema.index({ astrologerId: 1, clientId: 1 });
followUpSchema.index({ astrologerId: 1, priority: 1 });

/**
 * Exclude soft-deleted follow-ups from find queries by default.
 */
followUpSchema.pre(/^find/, function excludeDeleted(next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }

  this.where({ isDeleted: false });
  next();
});

const FollowUp = mongoose.model('FollowUp', followUpSchema);

module.exports = FollowUp;
module.exports.FOLLOW_UP_PRIORITIES = FOLLOW_UP_PRIORITIES;
module.exports.FOLLOW_UP_STATUSES = FOLLOW_UP_STATUSES;
