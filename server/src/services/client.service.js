/**
 * Client business logic.
 * All queries are scoped to the authenticated astrologer for multi-tenant isolation.
 */

const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const {
  parsePaginationQuery,
  buildSortObject,
  formatPaginatedResponse,
} = require('../utils/pagination');

/**
 * Fields that can be set by the client on create/update.
 * astrologerId always comes from JWT — never from the request body.
 */
const ALLOWED_CLIENT_FIELDS = [
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

/**
 * Pick only allowed fields from a request body object.
 * @param {object} body
 * @returns {object}
 */
const pickClientFields = (body) => {
  const data = {};

  ALLOWED_CLIENT_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });

  return data;
};

/**
 * Build ownership-scoped base filter for a single client lookup.
 * @param {string} astrologerId
 * @param {string} clientId
 */
const ownershipFilter = (astrologerId, clientId) => ({
  _id: clientId,
  astrologerId,
  isDeleted: false,
});

/**
 * Find a client owned by the astrologer or throw 404.
 * @param {string} astrologerId
 * @param {string} clientId
 * @returns {Promise<import('mongoose').Document>}
 */
const findOwnedClient = async (astrologerId, clientId) => {
  const client = await Client.findOne(ownershipFilter(astrologerId, clientId));

  if (!client) {
    throw ApiError.notFound('Client not found', 'CLIENT_NOT_FOUND');
  }

  return client;
};

/**
 * Create a new client for the authenticated astrologer.
 * @param {string} astrologerId
 * @param {object} body
 */
const createClient = async (astrologerId, body) => {
  const data = pickClientFields(body);

  const existingPhone = await Client.findOne({
    astrologerId,
    phone: data.phone,
    isDeleted: false,
  });

  if (existingPhone) {
    throw ApiError.conflict(
      'A client with this phone number already exists',
      'PHONE_EXISTS'
    );
  }

  const client = await Client.create({
    ...data,
    astrologerId,
  });

  return client.toJSON();
};

/**
 * List clients with pagination, search, filter, and sort.
 * @param {string} astrologerId
 * @param {import('express').Request['query']} query
 */
const getClients = async (astrologerId, query) => {
  const { page, limit, skip, sortBy, order } = parsePaginationQuery(query);

  const filter = {
    astrologerId,
    isDeleted: false,
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const searchTerm = query.search.trim();
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
      { phone: { $regex: escaped, $options: 'i' } },
    ];
  }

  const sort = buildSortObject(sortBy, order);

  const [clients, total] = await Promise.all([
    Client.find(filter).sort(sort).skip(skip).limit(limit).select('-__v').lean(),
    Client.countDocuments(filter),
  ]);

  return formatPaginatedResponse(clients, total, page, limit);
};

/**
 * Get a single client by ID (ownership enforced).
 * @param {string} astrologerId
 * @param {string} clientId
 */
const getClientById = async (astrologerId, clientId) => {
  const client = await findOwnedClient(astrologerId, clientId);
  return client.toJSON();
};

/**
 * Update a client (ownership enforced).
 * @param {string} astrologerId
 * @param {string} clientId
 * @param {object} body
 */
const updateClient = async (astrologerId, clientId, body) => {
  const client = await findOwnedClient(astrologerId, clientId);
  const updates = pickClientFields(body);

  // Prevent phone collision with another active client of the same astrologer
  if (updates.phone && updates.phone !== client.phone) {
    const phoneTaken = await Client.findOne({
      astrologerId,
      phone: updates.phone,
      isDeleted: false,
      _id: { $ne: clientId },
    });

    if (phoneTaken) {
      throw ApiError.conflict(
        'A client with this phone number already exists',
        'PHONE_EXISTS'
      );
    }
  }

  Object.assign(client, updates);
  await client.save();

  return client.toJSON();
};

/**
 * Soft-delete a client (ownership enforced).
 * @param {string} astrologerId
 * @param {string} clientId
 */
const deleteClient = async (astrologerId, clientId) => {
  const client = await findOwnedClient(astrologerId, clientId);

  client.isDeleted = true;
  await client.save({ validateBeforeSave: false });

  return { message: 'Client deleted successfully' };
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  findOwnedClient,
};
