/**
 * Request validation rules for client endpoints.
 */

const { body, param, query } = require('express-validator');
const { CLIENT_STATUSES, GENDERS } = require('../models/Client');
const { ALLOWED_SORT_FIELDS } = require('../utils/pagination');

const mongoIdRule = param('id')
  .isMongoId()
  .withMessage('Invalid client ID');

const placeOfBirthRules = [
  body('placeOfBirth.city')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  body('placeOfBirth.state')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),

  body('placeOfBirth.country')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),

  body('placeOfBirth.latitude')
    .optional({ values: 'null' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('placeOfBirth.longitude')
    .optional({ values: 'null' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

const sharedClientFieldRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .optional({ values: 'null' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone cannot be empty')
    .isLength({ min: 6, max: 20 })
    .withMessage('Phone must be between 6 and 20 characters'),

  body('gender')
    .optional({ values: 'null' })
    .isIn(GENDERS)
    .withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),

  body('dateOfBirth')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO 8601 date')
    .toDate(),

  body('timeOfBirth')
    .optional({ values: 'null' })
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Time of birth must be in HH:mm format (24-hour)'),

  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array with at most 20 items'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),

  body('status')
    .optional()
    .isIn(CLIENT_STATUSES)
    .withMessage(`Status must be one of: ${CLIENT_STATUSES.join(', ')}`),

  body('source')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Source cannot exceed 100 characters'),

  body('notes')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes cannot exceed 5000 characters'),
];

const createClientRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .isLength({ min: 6, max: 20 })
    .withMessage('Phone must be between 6 and 20 characters'),

  body('email')
    .optional({ values: 'null' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('gender')
    .optional({ values: 'null' })
    .isIn(GENDERS)
    .withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),

  body('dateOfBirth')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO 8601 date')
    .toDate(),

  body('timeOfBirth')
    .optional({ values: 'null' })
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Time of birth must be in HH:mm format (24-hour)'),

  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array with at most 20 items'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),

  body('status')
    .optional()
    .isIn(CLIENT_STATUSES)
    .withMessage(`Status must be one of: ${CLIENT_STATUSES.join(', ')}`),

  body('source')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Source cannot exceed 100 characters'),

  body('notes')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes cannot exceed 5000 characters'),

  ...placeOfBirthRules,
];

const updateClientRules = [
  mongoIdRule,
  ...sharedClientFieldRules,
  ...placeOfBirthRules,
  body()
    .custom((value, { req }) => {
      const allowedFields = [
        'name',
        'email',
        'phone',
        'gender',
        'dateOfBirth',
        'timeOfBirth',
        'placeOfBirth',
        'tags',
        'status',
        'source',
        'notes',
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

const listClientsRules = [
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
    .isIn(CLIENT_STATUSES)
    .withMessage(`Status must be one of: ${CLIENT_STATUSES.join(', ')}`),

  query('sortBy')
    .optional()
    .isIn(ALLOWED_SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(', ')}`),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),
];

const clientIdRules = [mongoIdRule];

module.exports = {
  createClientRules,
  updateClientRules,
  listClientsRules,
  clientIdRules,
};
