/**
 * Dashboard business logic.
 * Aggregates cross-collection metrics scoped to the authenticated astrologer.
 */

const mongoose = require('mongoose');
const Client = require('../models/Client');
const Consultation = require('../models/Consultation');
const FollowUp = require('../models/FollowUp');
const { CLIENT_STATUSES } = require('../models/Client');
const { CONSULTATION_TYPES } = require('../models/Consultation');
const { FOLLOW_UP_STATUSES } = require('../models/FollowUp');
const { markOverdueFollowUps } = require('./followUp.service');

const REVENUE_MATCH = {
  paymentStatus: 'paid',
};

/**
 * Convert astrologer ID string to ObjectId for aggregation pipelines.
 * @param {string} astrologerId
 */
const toObjectId = (astrologerId) => new mongoose.Types.ObjectId(astrologerId);

/**
 * Start of the current calendar month.
 * @returns {Date}
 */
const getStartOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Start and end of the previous calendar month.
 * @returns {{ start: Date, end: Date }}
 */
const getLastMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Start of today for follow-up due date comparisons.
 * @returns {Date}
 */
const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Generate the last 12 calendar months as { year, month, label } objects.
 * @returns {Array<{ year: number, month: number, label: string }>}
 */
const getLast12Months = () => {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;

    months.push({
      year: date.getFullYear(),
      month,
      label: `${date.getFullYear()}-${String(month).padStart(2, '0')}`,
    });
  }

  return months;
};

/**
 * Base match stage for astrologer-scoped, non-deleted records.
 * @param {string} astrologerId
 */
const baseMatch = (astrologerId) => ({
  astrologerId: toObjectId(astrologerId),
  isDeleted: false,
});

/**
 * Calculate revenue growth percentage between two periods.
 * @param {number} current
 * @param {number} previous
 */
const calculateGrowthPercentage = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(2));
};

/**
 * Merge monthly aggregation results with a 12-month template (fills gaps with 0).
 * @param {Array<{ year: number, month: number, value: number }>} results
 * @param {Array<{ year: number, month: number, label: string }>} template
 */
const fillMonthlySeries = (results, template) => {
  const lookup = new Map(
    results.map((item) => [`${item.year}-${item.month}`, item.value])
  );

  return template.map(({ year, month, label }) => ({
    label,
    year,
    month,
    value: lookup.get(`${year}-${month}`) || 0,
  }));
};

/**
 * Merge status aggregation with all known statuses (fills gaps with 0).
 * @param {Array<{ status: string, count: number }>} results
 * @param {string[]} allStatuses
 */
const fillStatusSeries = (results, allStatuses) => {
  const lookup = new Map(results.map((item) => [item.status, item.count]));

  return allStatuses.map((status) => ({
    status,
    count: lookup.get(status) || 0,
  }));
};

/**
 * Sum paid consultation revenue with optional date range on consultationDate.
 * @param {string} astrologerId
 * @param {{ start?: Date, end?: Date }} [dateRange]
 */
const aggregateRevenue = async (astrologerId, dateRange = {}) => {
  const match = {
    ...baseMatch(astrologerId),
    ...REVENUE_MATCH,
  };

  if (dateRange.start || dateRange.end) {
    match.consultationDate = {};

    if (dateRange.start) {
      match.consultationDate.$gte = dateRange.start;
    }

    if (dateRange.end) {
      match.consultationDate.$lte = dateRange.end;
    }
  }

  const [result] = await Consultation.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return result?.total || 0;
};

/**
 * GET /dashboard/stats — high-level KPI counts and revenue summary.
 * @param {string} astrologerId
 */
const getStats = async (astrologerId) => {
  await markOverdueFollowUps(astrologerId);

  const astrologerObjectId = toObjectId(astrologerId);
  const monthStart = getStartOfCurrentMonth();

  const [clientStats, consultationStats, followUpStats, totalRevenue, revenueThisMonth] =
    await Promise.all([
      Client.aggregate([
        { $match: baseMatch(astrologerId) },
        {
          $facet: {
            total: [{ $count: 'count' }],
            active: [{ $match: { status: 'active' } }, { $count: 'count' }],
          },
        },
      ]),
      Consultation.aggregate([
        { $match: baseMatch(astrologerId) },
        {
          $facet: {
            total: [{ $count: 'count' }],
            thisMonth: [
              { $match: { consultationDate: { $gte: monthStart } } },
              { $count: 'count' },
            ],
          },
        },
      ]),
      FollowUp.aggregate([
        { $match: { astrologerId: astrologerObjectId, isDeleted: false } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      aggregateRevenue(astrologerId),
      aggregateRevenue(astrologerId, { start: monthStart }),
    ]);

  const followUpCounts = followUpStats.reduce(
    (acc, item) => {
      acc[item._id] = item.count;
      return acc;
    },
    {}
  );

  return {
    totalClients: clientStats[0]?.total[0]?.count || 0,
    activeClients: clientStats[0]?.active[0]?.count || 0,
    totalConsultations: consultationStats[0]?.total[0]?.count || 0,
    consultationsThisMonth: consultationStats[0]?.thisMonth[0]?.count || 0,
    pendingFollowUps: followUpCounts.pending || 0,
    overdueFollowUps: followUpCounts.overdue || 0,
    completedFollowUps: followUpCounts.completed || 0,
    totalRevenue,
    revenueThisMonth,
  };
};

/**
 * GET /dashboard/recent-consultations — latest 10 consultations with client info.
 * @param {string} astrologerId
 */
const getRecentConsultations = async (astrologerId) => {
  const consultations = await Consultation.aggregate([
    { $match: baseMatch(astrologerId) },
    { $sort: { consultationDate: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: '_id',
        as: 'client',
      },
    },
    { $unwind: '$client' },
    { $match: { 'client.isDeleted': false } },
    {
      $project: {
        _id: 1,
        consultationDate: 1,
        consultationType: 1,
        amount: 1,
        status: 1,
        paymentStatus: 1,
        clientId: 1,
        clientName: '$client.name',
      },
    },
  ]);

  return consultations;
};

/**
 * GET /dashboard/upcoming-followups — next 10 pending follow-ups.
 * @param {string} astrologerId
 */
const getUpcomingFollowUps = async (astrologerId) => {
  await markOverdueFollowUps(astrologerId);

  const startOfToday = getStartOfToday();

  const followUps = await FollowUp.aggregate([
    {
      $match: {
        ...baseMatch(astrologerId),
        status: 'pending',
        dueDate: { $gte: startOfToday },
      },
    },
    { $sort: { dueDate: 1, priority: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: '_id',
        as: 'client',
      },
    },
    { $unwind: '$client' },
    { $match: { 'client.isDeleted': false } },
    {
      $project: {
        _id: 1,
        title: 1,
        dueDate: 1,
        priority: 1,
        status: 1,
        clientId: 1,
        clientName: '$client.name',
      },
    },
  ]);

  return followUps;
};

/**
 * GET /dashboard/revenue — revenue summary with month-over-month growth.
 * @param {string} astrologerId
 */
const getRevenue = async (astrologerId) => {
  const monthStart = getStartOfCurrentMonth();
  const { start: lastMonthStart, end: lastMonthEnd } = getLastMonthRange();

  const [totalRevenue, revenueThisMonth, revenueLastMonth] = await Promise.all([
    aggregateRevenue(astrologerId),
    aggregateRevenue(astrologerId, { start: monthStart }),
    aggregateRevenue(astrologerId, {
      start: lastMonthStart,
      end: lastMonthEnd,
    }),
  ]);

  return {
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth,
    revenueGrowthPercentage: calculateGrowthPercentage(
      revenueThisMonth,
      revenueLastMonth
    ),
  };
};

/**
 * GET /dashboard/charts — aggregated chart data for the dashboard UI.
 * @param {string} astrologerId
 */
const getCharts = async (astrologerId) => {
  await markOverdueFollowUps(astrologerId);

  const monthTemplate = getLast12Months();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [
    monthlyConsultations,
    monthlyRevenue,
    followUpsByStatus,
    clientsByStatus,
    consultationTypes,
  ] = await Promise.all([
    Consultation.aggregate([
      {
        $match: {
          ...baseMatch(astrologerId),
          consultationDate: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$consultationDate' },
            month: { $month: '$consultationDate' },
          },
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          value: 1,
        },
      },
    ]),
    Consultation.aggregate([
      {
        $match: {
          ...baseMatch(astrologerId),
          ...REVENUE_MATCH,
          consultationDate: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$consultationDate' },
            month: { $month: '$consultationDate' },
          },
          value: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          value: 1,
        },
      },
    ]),
    FollowUp.aggregate([
      { $match: baseMatch(astrologerId) },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]),
    Client.aggregate([
      { $match: baseMatch(astrologerId) },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]),
    Consultation.aggregate([
      { $match: baseMatch(astrologerId) },
      { $group: { _id: '$consultationType', count: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const consultationTypeSeries = CONSULTATION_TYPES.map((type) => {
    const found = consultationTypes.find((item) => item.type === type);
    return { type, count: found?.count || 0 };
  });

  return {
    monthlyConsultations: fillMonthlySeries(monthlyConsultations, monthTemplate),
    monthlyRevenue: fillMonthlySeries(monthlyRevenue, monthTemplate),
    followUpsByStatus: fillStatusSeries(followUpsByStatus, FOLLOW_UP_STATUSES),
    clientsByStatus: fillStatusSeries(clientsByStatus, CLIENT_STATUSES),
    consultationTypes: consultationTypeSeries,
  };
};

module.exports = {
  getStats,
  getRecentConsultations,
  getUpcomingFollowUps,
  getRevenue,
  getCharts,
};
