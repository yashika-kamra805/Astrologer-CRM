/**
 * API route aggregator.
 * All versioned routes are mounted under /api/v1.
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const clientRoutes = require('./client.routes');
const consultationRoutes = require('./consultation.routes');
const followUpRoutes = require('./followUp.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/consultations', consultationRoutes);
router.use('/followups', followUpRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check endpoint for load balancers and uptime monitors
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
