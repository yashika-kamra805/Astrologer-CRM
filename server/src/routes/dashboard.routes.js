/**
 * Dashboard route definitions.
 * All routes require authentication — scoped to req.astrologer.id.
 */

const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', dashboardController.getStats);
router.get('/recent-consultations', dashboardController.getRecentConsultations);
router.get('/upcoming-followups', dashboardController.getUpcomingFollowUps);
router.get('/revenue', dashboardController.getRevenue);
router.get('/charts', dashboardController.getCharts);

module.exports = router;
