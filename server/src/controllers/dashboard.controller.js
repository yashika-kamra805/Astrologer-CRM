/**
 * Dashboard HTTP controllers.
 * Thin layer — delegates business logic to dashboard.service.
 */

const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/dashboard/stats
 */
const getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getStats(req.astrologer.id);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

/**
 * GET /api/v1/dashboard/recent-consultations
 */
const getRecentConsultations = catchAsync(async (req, res) => {
  const consultations = await dashboardService.getRecentConsultations(
    req.astrologer.id
  );

  res.status(200).json({
    success: true,
    data: { consultations },
  });
});

/**
 * GET /api/v1/dashboard/upcoming-followups
 */
const getUpcomingFollowUps = catchAsync(async (req, res) => {
  const followUps = await dashboardService.getUpcomingFollowUps(
    req.astrologer.id
  );

  res.status(200).json({
    success: true,
    data: { followUps },
  });
});

/**
 * GET /api/v1/dashboard/revenue
 */
const getRevenue = catchAsync(async (req, res) => {
  const revenue = await dashboardService.getRevenue(req.astrologer.id);

  res.status(200).json({
    success: true,
    data: { revenue },
  });
});

/**
 * GET /api/v1/dashboard/charts
 */
const getCharts = catchAsync(async (req, res) => {
  const charts = await dashboardService.getCharts(req.astrologer.id);

  res.status(200).json({
    success: true,
    data: { charts },
  });
});

module.exports = {
  getStats,
  getRecentConsultations,
  getUpcomingFollowUps,
  getRevenue,
  getCharts,
};
