import api from '../../../lib/api';

export const getStats = () =>
  api.get('/dashboard/stats').then((r) => r.data);

export const getRecentConsultations = () =>
  api.get('/dashboard/recent-consultations').then((r) => r.data);

export const getUpcomingFollowUps = () =>
  api.get('/dashboard/upcoming-followups').then((r) => r.data);

export const getRevenue = () =>
  api.get('/dashboard/revenue').then((r) => r.data);

export const getCharts = () =>
  api.get('/dashboard/charts').then((r) => r.data);
