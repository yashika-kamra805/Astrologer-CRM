import api from '../../../lib/api';

export const getFollowUps = (params) =>
  api.get('/followups', { params }).then((r) => r.data);

export const getFollowUp = (id) =>
  api.get(`/followups/${id}`).then((r) => r.data);

export const createFollowUp = (data) =>
  api.post('/followups', data).then((r) => r.data);

export const updateFollowUp = (id, data) =>
  api.patch(`/followups/${id}`, data).then((r) => r.data);

export const completeFollowUp = (id, data) =>
  api.patch(`/followups/${id}/complete`, data).then((r) => r.data);

export const deleteFollowUp = (id) =>
  api.delete(`/followups/${id}`).then((r) => r.data);

export const getUpcomingFollowUps = (params) =>
  api.get('/followups/upcoming', { params }).then((r) => r.data);

export const getOverdueFollowUps = (params) =>
  api.get('/followups/overdue', { params }).then((r) => r.data);
