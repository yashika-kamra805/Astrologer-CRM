/**
 * Consultation HTTP controllers.
 * Thin layer — delegates business logic to consultation.service.
 */

const consultationService = require('../services/consultation.service');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/v1/consultations
 */
const createConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.createConsultation(
    req.astrologer.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Consultation created successfully',
    data: { consultation },
  });
});

/**
 * GET /api/v1/consultations
 */
const getConsultations = catchAsync(async (req, res) => {
  const result = await consultationService.getConsultations(
    req.astrologer.id,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/v1/consultations/followups
 */
const getUpcomingFollowUps = catchAsync(async (req, res) => {
  const result = await consultationService.getUpcomingFollowUps(
    req.astrologer.id,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * GET /api/v1/consultations/:id
 */
const getConsultationById = catchAsync(async (req, res) => {
  const consultation = await consultationService.getConsultationById(
    req.astrologer.id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { consultation },
  });
});

/**
 * PATCH /api/v1/consultations/:id
 */
const updateConsultation = catchAsync(async (req, res) => {
  const consultation = await consultationService.updateConsultation(
    req.astrologer.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Consultation updated successfully',
    data: { consultation },
  });
});

/**
 * DELETE /api/v1/consultations/:id
 */
const deleteConsultation = catchAsync(async (req, res) => {
  const result = await consultationService.deleteConsultation(
    req.astrologer.id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * GET /api/v1/clients/:clientId/consultations
 */
const getClientConsultations = catchAsync(async (req, res) => {
  const result = await consultationService.getClientConsultations(
    req.astrologer.id,
    req.params.clientId,
    req.query
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});

module.exports = {
  createConsultation,
  getConsultations,
  getUpcomingFollowUps,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  getClientConsultations,
};
