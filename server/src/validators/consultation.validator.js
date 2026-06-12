/**
 * Request validation rules for consultation endpoints.
 */

const { body, param, query } = require('express-validator');
const {
  CONSULTATION_TYPES,
  CONSULTATION_STATUSES,
  PAYMENT_STATUSES,
} = require('../models/Consultation');

const CONSULTATION_SORT_FIELDS = ['createdAt', 'consultationDate'];

const consultationIdRule = param('id')
  .isMongoId()
  .withMessage('Invalid consultation ID');

const clientIdParamRule = param('clientId')
  .isMongoId()
  .withMessage('Invalid client ID');

const sharedConsultationFieldRules = [
  body('consultationDate')
    .optional()
    .isISO8601()
    .withMessage('Consultation date must be a valid ISO 8601 date')
    .toDate(),

  body('consultationType')
    .optional()
    .isIn(CONSULTATION_TYPES)
    .withMessage(
      `Consultation type must be one of: ${CONSULTATION_TYPES.join(', ')}`
    ),

  body('duration')
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage('Duration must be between 1 and 480 minutes')
    .toInt(),

  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number')
    .toFloat(),

  body('paymentStatus')
    .optional()
    .isIn(PAYMENT_STATUSES)
    .withMessage(
      `Payment status must be one of: ${PAYMENT_STATUSES.join(', ')}`
    ),

  body('notes')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes cannot exceed 5000 characters'),

  body('recommendations')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Recommendations cannot exceed 5000 characters'),

  body('nextFollowUpDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Next follow-up date must be a valid ISO 8601 date')
    .toDate(),

  body('status')
    .optional()
    .isIn(CONSULTATION_STATUSES)
    .withMessage(`Status must be one of: ${CONSULTATION_STATUSES.join(', ')}`),
];

const createConsultationRules = [
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Invalid client ID'),

  body('consultationDate')
    .notEmpty()
    .withMessage('Consultation date is required')
    .isISO8601()
    .withMessage('Consultation date must be a valid ISO 8601 date')
    .toDate(),

  body('consultationType')
    .notEmpty()
    .withMessage('Consultation type is required')
    .isIn(CONSULTATION_TYPES)
    .withMessage(
      `Consultation type must be one of: ${CONSULTATION_TYPES.join(', ')}`
    ),

  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1, max: 480 })
    .withMessage('Duration must be between 1 and 480 minutes')
    .toInt(),

  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number')
    .toFloat(),

  body('paymentStatus')
    .optional()
    .isIn(PAYMENT_STATUSES)
    .withMessage(
      `Payment status must be one of: ${PAYMENT_STATUSES.join(', ')}`
    ),

  body('notes')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes cannot exceed 5000 characters'),

  body('recommendations')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Recommendations cannot exceed 5000 characters'),

  body('nextFollowUpDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Next follow-up date must be a valid ISO 8601 date')
    .toDate(),

  body('status')
    .optional()
    .isIn(CONSULTATION_STATUSES)
    .withMessage(`Status must be one of: ${CONSULTATION_STATUSES.join(', ')}`),
];

const updateConsultationRules = [
  consultationIdRule,
  ...sharedConsultationFieldRules,
  body()
    .custom((value, { req }) => {
      const allowedFields = [
        'consultationDate',
        'consultationType',
        'duration',
        'amount',
        'paymentStatus',
        'notes',
        'recommendations',
        'nextFollowUpDate',
        'status',
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

const listConsultationsRules = [
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

  query('clientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid client ID filter'),

  query('consultationType')
    .optional()
    .isIn(CONSULTATION_TYPES)
    .withMessage(
      `Consultation type must be one of: ${CONSULTATION_TYPES.join(', ')}`
    ),

  query('status')
    .optional()
    .isIn(CONSULTATION_STATUSES)
    .withMessage(`Status must be one of: ${CONSULTATION_STATUSES.join(', ')}`),

  query('paymentStatus')
    .optional()
    .isIn(PAYMENT_STATUSES)
    .withMessage(
      `Payment status must be one of: ${PAYMENT_STATUSES.join(', ')}`
    ),

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
    .isIn(CONSULTATION_SORT_FIELDS)
    .withMessage(
      `sortBy must be one of: ${CONSULTATION_SORT_FIELDS.join(', ')}`
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

const consultationIdRules = [consultationIdRule];

const clientConsultationHistoryRules = [
  clientIdParamRule,
  ...listConsultationsRules,
];

module.exports = {
  createConsultationRules,
  updateConsultationRules,
  listConsultationsRules,
  upcomingFollowUpsRules,
  consultationIdRules,
  clientConsultationHistoryRules,
  CONSULTATION_SORT_FIELDS,
};
