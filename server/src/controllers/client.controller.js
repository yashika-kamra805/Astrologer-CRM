/**
 * Client HTTP controllers.
 * Thin layer — delegates business logic to client.service.
 */

const clientService = require('../services/client.service');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/v1/clients
 * Create a new client for the authenticated astrologer.
 */
const createClient = catchAsync(async (req, res) => {
  const client = await clientService.createClient(
    req.astrologer.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Client created successfully',
    data: { client },
  });
});

/**
 * GET /api/v1/clients
 * List clients with pagination, search, filter, and sort.
 */
const getClients = catchAsync(async (req, res) => {
  const result = await clientService.getClients(req.astrologer.id, req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/v1/clients/:id
 * Get a single client by ID (ownership enforced).
 */
const getClientById = catchAsync(async (req, res) => {
  const client = await clientService.getClientById(
    req.astrologer.id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { client },
  });
});

/**
 * PATCH /api/v1/clients/:id
 * Update a client (ownership enforced).
 */
const updateClient = catchAsync(async (req, res) => {
  const client = await clientService.updateClient(
    req.astrologer.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Client updated successfully',
    data: { client },
  });
});

/**
 * DELETE /api/v1/clients/:id
 * Soft-delete a client (ownership enforced).
 */
const deleteClient = catchAsync(async (req, res) => {
  const result = await clientService.deleteClient(
    req.astrologer.id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};
