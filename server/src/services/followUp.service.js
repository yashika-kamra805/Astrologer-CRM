/**
 * Follow-up business logic.
 * All operations are scoped to the authenticated astrologer.
 */

const FollowUp = require('../models/FollowUp');
const Consultation = require('../models/Consultation');
const ApiError = require('../utils/ApiError');
const { findOwnedClient } = require('./client.service');
const {
  parsePaginationQuery,
  buildSortObject,
  formatPaginatedResponse,
} = require('../utils/pagination');
const { FOLLOW_UP_SORT_FIELDS } = require('../validators/followUp.validator');

const ALLOWED_FOLLOW_UP_FIELDS = [
  'title',
  'description',
  'dueDate',
  'priority',
  'status',
  'consultationId',
];

const PAGINATION_OPTIONS = {
  allowedSortFields: FOLLOW_UP_SORT_FIELDS,
  defaultSortBy: 'dueDate',
};

/**
 * Start of the current day (local server time) for date comparisons.
 * @returns {Date}
 */
const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Pick only allowed follow-up fields from the request body.
 * @param {object} body
 * @returns {object}
 */
const pickFollowUpFields = (body) => {
  const data = {};

  ALLOWED_FOLLOW_UP_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });

  return data;
};

/**
 * Build ownership-scoped filter for a single follow-up lookup.
 * @param {string} astrologerId
 * @param {string} followUpId
 */
const ownershipFilter = (astrologerId, followUpId) => ({
  _id: followUpId,
  astrologerId,
  isDeleted: false,
});

/**
 * Mark pending follow-ups past their due date as overdue for an astrologer.
 * @param {string} astrologerId
 */
const markOverdueFollowUps = async (astrologerId) => {
  const startOfToday = getStartOfToday();

  await FollowUp.updateMany(
    {
      astrologerId,
      isDeleted: false,
      status: 'pending',
      dueDate: { $lt: startOfToday },
    },
    { $set: { status: 'overdue' } }
  );
};

/**
 * Find a follow-up owned by the astrologer or throw 404.
 * @param {string} astrologerId
 * @param {string} followUpId
 */
const findOwnedFollowUp = async (astrologerId, followUpId) => {
  const followUp = await FollowUp.findOne(ownershipFilter(astrologerId, followUpId));

  if (!followUp) {
    throw ApiError.notFound('Follow-up not found', 'FOLLOW_UP_NOT_FOUND');
  }

  return followUp;
};

/**
 * Validate consultation ownership and optional client association.
 * @param {string} astrologerId
 * @param {string} consultationId
 * @param {string} clientId
 */
const validateOwnedConsultation = async (
  astrologerId,
  consultationId,
  clientId
) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    astrologerId,
    isDeleted: false,
  });

  if (!consultation) {
    throw ApiError.notFound('Consultation not found', 'CONSULTATION_NOT_FOUND');
  }

  if (consultation.clientId.toString() !== clientId.toString()) {
    throw ApiError.badRequest(
      'Consultation does not belong to this client',
      'CONSULTATION_CLIENT_MISMATCH'
    );
  }

  return consultation;
};

/**
 * Build a filter object from list query parameters.
 * @param {string} astrologerId
 * @param {import('express').Request['query']} query
 */
const buildFollowUpFilter = (astrologerId, query) => {
  const filter = {
    astrologerId,
    isDeleted: false,
  };

  if (query.clientId) {
    filter.clientId = query.clientId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.fromDate || query.toDate) {
    filter.dueDate = {};

    if (query.fromDate) {
      filter.dueDate.$gte = new Date(query.fromDate);
    }

    if (query.toDate) {
      filter.dueDate.$lte = new Date(query.toDate);
    }
  }

  if (query.search) {
    const searchTerm = query.search.trim();
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    filter.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
    ];
  }

  return filter;
};

/**
 * Populate client and consultation references on list/detail queries.
 * @param {import('mongoose').Query} query
 */
const withRelations = (query) =>
  query
    .populate('clientId', 'name phone email')
    .populate('consultationId', 'consultationDate consultationType status');

/**
 * Create a follow-up for the authenticated astrologer.
 * @param {string} astrologerId
 * @param {object} body
 */
const createFollowUp = async (astrologerId, body) => {
  const { clientId, consultationId, ...rest } = body;
  const followUpData = pickFollowUpFields(rest);

  await findOwnedClient(astrologerId, clientId);

  if (consultationId) {
    await validateOwnedConsultation(astrologerId, consultationId, clientId);
    followUpData.consultationId = consultationId;
  }

  const followUp = await FollowUp.create({
    ...followUpData,
    astrologerId,
    clientId,
  });

  return followUp.toJSON();
};

/**
 * List follow-ups with pagination, search, filters, and sort.
 * @param {string} astrologerId
 * @param {import('express').Request['query']} query
 */
const getFollowUps = async (astrologerId, query) => {
  await markOverdueFollowUps(astrologerId);

  const { page, limit, skip, sortBy, order } = parsePaginationQuery(
    query,
    PAGINATION_OPTIONS
  );

  const filter = buildFollowUpFilter(astrologerId, query);
  const sort = buildSortObject(sortBy, order);

  const [followUps, total] = await Promise.all([
    withRelations(
      FollowUp.find(filter).sort(sort).skip(skip).limit(limit).select('-__v')
    ).lean(),
    FollowUp.countDocuments(filter),
  ]);

  return formatPaginatedResponse(followUps, total, page, limit);
};

/**
 * Get a single follow-up by ID (ownership enforced).
 * @param {string} astrologerId
 * @param {string} followUpId
 */
const getFollowUpById = async (astrologerId, followUpId) => {
  await markOverdueFollowUps(astrologerId);

  const followUp = await withRelations(
    FollowUp.findOne(ownershipFilter(astrologerId, followUpId))
  ).lean();

  if (!followUp) {
    throw ApiError.notFound('Follow-up not found', 'FOLLOW_UP_NOT_FOUND');
  }

  return followUp;
};

/**
 * Update a follow-up (ownership enforced).
 * @param {string} astrologerId
 * @param {string} followUpId
 * @param {object} body
 */
const updateFollowUp = async (astrologerId, followUpId, body) => {
  await markOverdueFollowUps(astrologerId);

  const followUp = await findOwnedFollowUp(astrologerId, followUpId);

  if (followUp.status === 'completed') {
    throw ApiError.badRequest(
      'Completed follow-ups cannot be updated',
      'FOLLOW_UP_COMPLETED'
    );
  }

  const updates = pickFollowUpFields(body);

  if (updates.consultationId) {
    await validateOwnedConsultation(
      astrologerId,
      updates.consultationId,
      followUp.clientId.toString()
    );
  }

  if (updates.consultationId === null) {
    updates.consultationId = null;
  }

  Object.assign(followUp, updates);
  await followUp.save();

  return followUp.toJSON();
};

/**
 * Mark a follow-up as completed.
 * @param {string} astrologerId
 * @param {string} followUpId
 * @param {{ completionNotes?: string }} body
 */
const completeFollowUp = async (astrologerId, followUpId, body) => {
  await markOverdueFollowUps(astrologerId);

  const followUp = await findOwnedFollowUp(astrologerId, followUpId);

  if (followUp.status === 'completed') {
    throw ApiError.badRequest(
      'Follow-up is already completed',
      'FOLLOW_UP_ALREADY_COMPLETED'
    );
  }

  if (followUp.status === 'cancelled') {
    throw ApiError.badRequest(
      'Cancelled follow-ups cannot be completed',
      'FOLLOW_UP_CANCELLED'
    );
  }

  followUp.status = 'completed';
  followUp.completedAt = new Date();

  if (body.completionNotes !== undefined) {
    followUp.completionNotes = body.completionNotes;
  }

  await followUp.save();

  return followUp.toJSON();
};

/**
 * Soft-delete a follow-up (ownership enforced).
 * @param {string} astrologerId
 * @param {string} followUpId
 */
const deleteFollowUp = async (astrologerId, followUpId) => {
  const followUp = await findOwnedFollowUp(astrologerId, followUpId);

  followUp.isDeleted = true;
  await followUp.save({ validateBeforeSave: false });

  return { message: 'Follow-up deleted successfully' };
};

/**
 * Get upcoming pending follow-ups within a date window.
 * @param {string} astrologerId
 * @param {import('express').Request['query']} query
 */
const getUpcomingFollowUps = async (astrologerId, query) => {
  await markOverdueFollowUps(astrologerId);

  const { page, limit, skip } = parsePaginationQuery(query, PAGINATION_OPTIONS);
  const days = parseInt(query.days, 10) || 30;

  const startOfToday = getStartOfToday();
  const endDate = new Date(startOfToday);
  endDate.setDate(endDate.getDate() + days);

  const filter = {
    astrologerId,
    isDeleted: false,
    status: 'pending',
    dueDate: { $gte: startOfToday, $lte: endDate },
  };

  const [followUps, total] = await Promise.all([
    withRelations(
      FollowUp.find(filter)
        .sort({ dueDate: 1, priority: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
    ).lean(),
    FollowUp.countDocuments(filter),
  ]);

  return formatPaginatedResponse(followUps, total, page, limit);
};

/**
 * Get overdue follow-ups for the astrologer.
 * @param {string} astrologerId
 * @param {import('express').Request['query']} query
 */
const getOverdueFollowUps = async (astrologerId, query) => {
  await markOverdueFollowUps(astrologerId);

  const { page, limit, skip } = parsePaginationQuery(query, PAGINATION_OPTIONS);

  const filter = {
    astrologerId,
    isDeleted: false,
    status: 'overdue',
  };

  const [followUps, total] = await Promise.all([
    withRelations(
      FollowUp.find(filter)
        .sort({ dueDate: 1, priority: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
    ).lean(),
    FollowUp.countDocuments(filter),
  ]);

  return formatPaginatedResponse(followUps, total, page, limit);
};

module.exports = {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  completeFollowUp,
  deleteFollowUp,
  getUpcomingFollowUps,
  getOverdueFollowUps,
  markOverdueFollowUps,
};
