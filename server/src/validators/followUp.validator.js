/**
 * Request validation rules for follow-up endpoints.
 */

const { body, param, query } = require('express-validator');
const {
  FOLLOW_UP_PRIORITIES,
  FOLLOW_UP_STATUSES,
} = require('../models/FollowUp');

const FOLLOW_UP_SORT_FIELDS = ['dueDate', 'createdAt', 'priority'];
const UPDATABLE_STATUSES = ['pending', 'overdue', 'cancelled'];

const followUpIdRule = param('id')
  .isMongoId()
  .withMessage('Invalid follow-up ID');

const sharedFollowUpFieldRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('description')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .toDate(),

  body('priority')
    .optional()
    .isIn(FOLLOW_UP_PRIORITIES)
    .withMessage(`Priority must be one of: ${FOLLOW_UP_PRIORITIES.join(', ')}`),

  body('status')
    .optional()
    .isIn(UPDATABLE_STATUSES)
    .withMessage(
      `Status must be one of: ${UPDATABLE_STATUSES.join(', ')}. Use the complete endpoint to mark as completed.`
    ),

  body('consultationId')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Invalid consultation ID'),
];

const createFollowUpRules = [
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Invalid client ID'),

  body('consultationId')
    .optional({ values: 'null' })
    .isMongoId()
    .withMessage('Invalid consultation ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('description')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),

  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .toDate(),

  body('priority')
    .optional()
    .isIn(FOLLOW_UP_PRIORITIES)
    .withMessage(`Priority must be one of: ${FOLLOW_UP_PRIORITIES.join(', ')}`),

  body('status')
    .optional()
    .isIn(['pending', 'cancelled'])
    .withMessage('Status on create must be pending or cancelled'),
];

const updateFollowUpRules = [
  followUpIdRule,
  ...sharedFollowUpFieldRules,
  body()
    .custom((value, { req }) => {
      const allowedFields = [
        'title',
        'description',
        'dueDate',
        'priority',
        'status',
        'consultationId',
      ];

      const hasUpdate = allowedFields.some(
        (field) => req.body[field] !== undefined
      );

      if (!hasUpdate) {
        throw new Error('At least one field must be provided for update');
      }

      return true;
    }),
];

const completeFollowUpRules = [
  followUpIdRule,
  body('completionNotes')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Completion notes cannot exceed 5000 characters'),
];

const listFollowUpsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),

  query('status')
    .optional()
    .isIn(FOLLOW_UP_STATUSES)
    .withMessage(`Status must be one of: ${FOLLOW_UP_STATUSES.join(', ')}`),

  query('priority')
    .optional()
    .isIn(FOLLOW_UP_PRIORITIES)
    .withMessage(`Priority must be one of: ${FOLLOW_UP_PRIORITIES.join(', ')}`),

  query('clientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid client ID filter'),

  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('fromDate must be a valid ISO 8601 date'),

  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('toDate must be a valid ISO 8601 date'),

  query('sortBy')
    .optional()
    .isIn(FOLLOW_UP_SORT_FIELDS)
    .withMessage(
      `sortBy must be one of: ${FOLLOW_UP_SORT_FIELDS.join(', ')}`
    ),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),
];

const upcomingFollowUpsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('days must be between 1 and 365')
    .toInt(),
];

const overdueFollowUpsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

const followUpIdRules = [followUpIdRule];

module.exports = {
  createFollowUpRules,
  updateFollowUpRules,
  completeFollowUpRules,
  listFollowUpsRules,
  upcomingFollowUpsRules,
  overdueFollowUpsRules,
  followUpIdRules,
  FOLLOW_UP_SORT_FIELDS,
};
