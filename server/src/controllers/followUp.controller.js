/**
 * Follow-up HTTP controllers.
 * Thin layer — delegates business logic to followUp.service.
 */

const followUpService = require('../services/followUp.service');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/v1/followups
 */
const createFollowUp = catchAsync(async (req, res) => {
  const followUp = await followUpService.createFollowUp(
    req.astrologer.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Follow-up created successfully',
    data: { followUp },
  });
});

/**
 * GET /api/v1/followups
 */
const getFollowUps = catchAsync(async (req, res) => {
  const result = await followUpService.getFollowUps(
    req.astrologer.id,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/v1/followups/upcoming
 */
const getUpcomingFollowUps = catchAsync(async (req, res) => {
  const result = await followUpService.getUpcomingFollowUps(
    req.astrologer.id,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/v1/followups/overdue
 */
const getOverdueFollowUps = catchAsync(async (req, res) => {
  const result = await followUpService.getOverdueFollowUps(
    req.astrologer.id,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/v1/followups/:id
 */
const getFollowUpById = catchAsync(async (req, res) => {
  const followUp = await followUpService.getFollowUpById(
    req.astrologer.id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { followUp },
  });
});

/**
 * PATCH /api/v1/followups/:id
 */
const updateFollowUp = catchAsync(async (req, res) => {
  const followUp = await followUpService.updateFollowUp(
    req.astrologer.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Follow-up updated successfully',
    data: { followUp },
  });
});

/**
 * PATCH /api/v1/followups/:id/complete
 */
const completeFollowUp = catchAsync(async (req, res) => {
  const followUp = await followUpService.completeFollowUp(
    req.astrologer.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Follow-up marked as completed',
    data: { followUp },
  });
});

/**
 * DELETE /api/v1/followups/:id
 */
const deleteFollowUp = catchAsync(async (req, res) => {
  const result = await followUpService.deleteFollowUp(
    req.astrologer.id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  createFollowUp,
  getFollowUps,
  getUpcomingFollowUps,
  getOverdueFollowUps,
  getFollowUpById,
  updateFollowUp,
  completeFollowUp,
  deleteFollowUp,
};
