/**
 * Consultation business logic.
 * All operations are scoped to the authenticated astrologer.
 * Client statistics are kept in sync via MongoDB transactions.
 */

const Consultation = require('../models/Consultation');
const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const { runInTransaction } = require('../utils/transaction');
const { findOwnedClient } = require('./client.service');
const {
  parsePaginationQuery,
  buildSortObject,
  formatPaginatedResponse,
} = require('../utils/pagination');
const { CONSULTATION_SORT_FIELDS } = require('../validators/consultation.validator');

const ALLOWED_CONSULTATION_FIELDS = [
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

const PAGINATION_OPTIONS = {
  allowedSortFields: CONSULTATION_SORT_FIELDS,
  defaultSortBy: 'consultationDate',
};

/**
 * Pick only allowed consultation fields from the request body.
 * @param {object} body
 * @returns {object}
 */
const pickConsultationFields = (body) => {
  const data = {};

  ALLOWED_CONSULTATION_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });

  return data;
};

/**
 * Build ownership-scoped filter for a single consultation lookup.
 * @param {string} astrologerId
 * @param {string} consultationId
 */
const ownershipFilter = (astrologerId, consultationId) => ({
  _id: consultationId,
  astrologerId,
  isDeleted: false,
});

/**
 * Find a consultation owned by the astrologer or throw 404.
 * @param {string} astrologerId
 * @param {string} consultationId
 * @param {import('mongoose').ClientSession} [session]
 */
const findOwnedConsultation = async (
  astrologerId,
  consultationId,
  session = null
) => {
  const query = Consultation.findOne(ownershipFilter(astrologerId, consultationId));

  if (session) {
    query.session(session);
  }

  const consultation = await query;

  if (!consultation) {
    throw ApiError.notFound('Consultation not found', 'CONSULTATION_NOT_FOUND');
  }

  return consultation;
};

/**
 * Validate that a client exists, belongs to the astrologer, and is not deleted.
 * @param {string} astrologerId
 * @param {string} clientId
 * @param {import('mongoose').ClientSession} [session]
 */
const validateOwnedClient = async (astrologerId, clientId, session = null) => {
  const query = Client.findOne({
    _id: clientId,
    astrologerId,
    isDeleted: false,
  });

  if (session) {
    query.session(session);
  }

  const client = await query;

  if (!client) {
    throw ApiError.notFound('Client not found', 'CLIENT_NOT_FOUND');
  }

  return client;
};

/**
 * Recalculate and persist client consultation statistics from source data.
 * @param {string} astrologerId
 * @param {string} clientId
 * @param {import('mongoose').ClientSession} session
 */
const syncClientConsultationStats = async (
  astrologerId,
  clientId,
  session = null
) => {
  const baseFilter = { astrologerId, clientId, isDeleted: false };

  const latestQuery = Consultation.findOne(baseFilter)
    .sort({ consultationDate: -1 })
    .select('consultationDate')
    .lean();

  const countQuery = Consultation.countDocuments(baseFilter);

  if (session) {
    latestQuery.session(session);
    countQuery.session(session);
  }

  const [latestConsultation, totalConsultations] = await Promise.all([
    latestQuery,
    countQuery,
  ]);

  const updateOptions = session ? { session } : {};
  await Client.updateOne(
    { _id: clientId, astrologerId },
    {
      totalConsultations,
      lastConsultationAt: latestConsultation
        ? latestConsultation.consultationDate
        : null,
    },
    updateOptions
  );
};

/**
 * Build a filter object from list query parameters.
 * @param {string} astrologerId
 * @param {import('express').Request['query']} query
 * @param {{ clientId?: string }} [overrides]
 */
const buildConsultationFilter = (astrologerId, query, overrides = {}) => {
  const filter = {
    astrologerId,
    isDeleted: false,
  };

  const clientId = overrides.clientId || query.clientId;
  if (clientId) {
    filter.clientId = clientId;
  }

  if (query.consultationType) {
    filter.consultationType = query.consultationType;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  if (query.fromDate || query.toDate) {
    filter.consultationDate = {};

    if (query.fromDate) {
      filter.consultationDate.$gte = new Date(query.fromDate);
    }

    if (query.toDate) {
      filter.consultationDate.$lte = new Date(query.toDate);
    }
  }

  return filter;
};

/**
 * Create a consultation and update client statistics atomically.
 * @param {string} astrologerId
 * @param {object} body
 */
const createConsultation = async (astrologerId, body) => {
  const { clientId, ...rest } = body;
  const consultationData = pickConsultationFields(rest);

  const consultation = await runInTransaction(async (session) => {
    await validateOwnedClient(astrologerId, clientId, session);

    const createOptions = session ? { session } : {};
    const [created] = await Consultation.create(
      [
        {
          ...consultationData,
          astrologerId,
          clientId,
        },
      ],
      createOptions
    );

    await syncClientConsultationStats(astrologerId, clientId, session);
    return created;
  });

  return consultation.toJSON();
};

/**
 * List consultations with pagination, filters, and sort.
 * @param {string} astrologerId
 * @param {import('express').Request['query']} query
 * @param {{ clientId?: string }} [overrides]
 */
const getConsultations = async (astrologerId, query, overrides = {}) => {
  const { page, limit, skip, sortBy, order } = parsePaginationQuery(
    query,
    PAGINATION_OPTIONS
  );

  const filter = buildConsultationFilter(astrologerId, query, overrides);
  const sort = buildSortObject(sortBy, order);

  const [consultations, total] = await Promise.all([
    Consultation.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .populate('clientId', 'name phone email')
      .lean(),
    Consultation.countDocuments(filter),
  ]);

  return formatPaginatedResponse(consultations, total, page, limit);
};

/**
 * Get a single consultation by ID (ownership enforced).
 * @param {string} astrologerId
 * @param {string} consultationId
 */
const getConsultationById = async (astrologerId, consultationId) => {
  const consultation = await Consultation.findOne(
    ownershipFilter(astrologerId, consultationId)
  )
    .populate('clientId', 'name phone email')
    .lean();

  if (!consultation) {
    throw ApiError.notFound('Consultation not found', 'CONSULTATION_NOT_FOUND');
  }

  return consultation;
};

/**
 * Update a consultation; recalculate client stats when consultationDate changes.
 * @param {string} astrologerId
 * @param {string} consultationId
 * @param {object} body
 */
const updateConsultation = async (astrologerId, consultationId, body) => {
  const updates = pickConsultationFields(body);

  const updatedConsultation = await runInTransaction(async (session) => {
    const consultation = await findOwnedConsultation(
      astrologerId,
      consultationId,
      session
    );

    const previousDate = consultation.consultationDate.getTime();
    const clientId = consultation.clientId.toString();

    Object.assign(consultation, updates);
    await consultation.save(session ? { session } : undefined);

    if (
      updates.consultationDate &&
      updates.consultationDate.getTime() !== previousDate
    ) {
      await syncClientConsultationStats(astrologerId, clientId, session);
    }

    return consultation.toJSON();
  });

  return updatedConsultation;
};

/**
 * Soft-delete a consultation and recalculate client statistics.
 * @param {string} astrologerId
 * @param {string} consultationId
 */
const deleteConsultation = async (astrologerId, consultationId) => {
  await runInTransaction(async (session) => {
    const consultation = await findOwnedConsultation(
      astrologerId,
      consultationId,
      session
    );

    const clientId = consultation.clientId.toString();

    consultation.isDeleted = true;
    await consultation.save(
      session
        ? { session, validateBeforeSave: false }
        : { validateBeforeSave: false }
    );

    await syncClientConsultationStats(astrologerId, clientId, session);
  });

  return { message: 'Consultation deleted successfully' };
};

/**
 * Get consultation history for a specific client.
 * @param {string} astrologerId
 * @param {string} clientId
 * @param {import('express').Request['query']} query
 */
const getClientConsultations = async (astrologerId, clientId, query) => {
  await findOwnedClient(astrologerId, clientId);
  return getConsultations(astrologerId, query, { clientId });
};

/**
 * Get upcoming follow-ups based on nextFollowUpDate.
 * @param {string} astrologerId
 * @param {import('express').Request['query']} query
 */
const getUpcomingFollowUps = async (astrologerId, query) => {
  const { page, limit, skip } = parsePaginationQuery(query, {
    allowedSortFields: ['consultationDate', 'createdAt'],
    defaultSortBy: 'consultationDate',
  });

  const days = parseInt(query.days, 10) || 30;
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  const filter = {
    astrologerId,
    isDeleted: false,
    nextFollowUpDate: { $ne: null, $gte: now, $lte: endDate },
  };

  const [consultations, total] = await Promise.all([
    Consultation.find(filter)
      .sort({ nextFollowUpDate: 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .populate('clientId', 'name phone email')
      .lean(),
    Consultation.countDocuments(filter),
  ]);

  return formatPaginatedResponse(consultations, total, page, limit);
};

module.exports = {
  createConsultation,
  getConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  getClientConsultations,
  getUpcomingFollowUps,
};
