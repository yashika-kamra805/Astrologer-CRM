import api from '../../../lib/api';

export const getConsultations = (params) =>
  api.get('/consultations', { params }).then((r) => r.data);

export const getConsultation = (id) =>
  api.get(`/consultations/${id}`).then((r) => r.data);

export const createConsultation = (data) =>
  api.post('/consultations', data).then((r) => r.data);

export const updateConsultation = (id, data) =>
  api.patch(`/consultations/${id}`, data).then((r) => r.data);

export const deleteConsultation = (id) =>
  api.delete(`/consultations/${id}`).then((r) => r.data);
