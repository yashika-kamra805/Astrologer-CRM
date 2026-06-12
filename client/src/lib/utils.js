export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'Something went wrong';
};

export const toInputDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const toInputDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
