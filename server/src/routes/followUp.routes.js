/**
 * Follow-up route definitions.
 * All routes require authentication — scoped to req.astrologer.id.
 */

const express = require('express');
const followUpController = require('../controllers/followUp.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createFollowUpRules,
  updateFollowUpRules,
  completeFollowUpRules,
  listFollowUpsRules,
  upcomingFollowUpsRules,
  overdueFollowUpsRules,
  followUpIdRules,
} = require('../validators/followUp.validator');

const router = express.Router();

router.use(protect);

// Static paths must be registered before /:id
router.get(
  '/upcoming',
  upcomingFollowUpsRules,
  validate,
  followUpController.getUpcomingFollowUps
);

router.get(
  '/overdue',
  overdueFollowUpsRules,
  validate,
  followUpController.getOverdueFollowUps
);

router.post('/', createFollowUpRules, validate, followUpController.createFollowUp);

router.get('/', listFollowUpsRules, validate, followUpController.getFollowUps);

router.patch(
  '/:id/complete',
  completeFollowUpRules,
  validate,
  followUpController.completeFollowUp
);

router.get('/:id', followUpIdRules, validate, followUpController.getFollowUpById);

router.patch('/:id', updateFollowUpRules, validate, followUpController.updateFollowUp);

router.delete('/:id', followUpIdRules, validate, followUpController.deleteFollowUp);

module.exports = router;
