/**
 * Consultation route definitions.
 * All routes require authentication — scoped to req.astrologer.id.
 */

const express = require('express');
const consultationController = require('../controllers/consultation.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createConsultationRules,
  updateConsultationRules,
  listConsultationsRules,
  upcomingFollowUpsRules,
  consultationIdRules,
} = require('../validators/consultation.validator');

const router = express.Router();

router.use(protect);

// Static paths must be registered before /:id
router.get(
  '/followups',
  upcomingFollowUpsRules,
  validate,
  consultationController.getUpcomingFollowUps
);

router.post(
  '/',
  createConsultationRules,
  validate,
  consultationController.createConsultation
);

router.get(
  '/',
  listConsultationsRules,
  validate,
  consultationController.getConsultations
);

router.get(
  '/:id',
  consultationIdRules,
  validate,
  consultationController.getConsultationById
);

router.patch(
  '/:id',
  updateConsultationRules,
  validate,
  consultationController.updateConsultation
);

router.delete(
  '/:id',
  consultationIdRules,
  validate,
  consultationController.deleteConsultation
);

module.exports = router;
