export const CLIENT_STATUSES = ['lead', 'active', 'inactive'];

export const GENDERS = ['male', 'female', 'other'];

export const CONSULTATION_TYPES = [
  'birth_chart',
  'horoscope',
  'matchmaking',
  'remedy',
  'general',
];

export const CONSULTATION_STATUSES = [
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
];

export const PAYMENT_STATUSES = ['pending', 'paid', 'waived'];

export const FOLLOW_UP_PRIORITIES = ['low', 'medium', 'high'];

export const FOLLOW_UP_STATUSES = [
  'pending',
  'completed',
  'overdue',
  'cancelled',
];

export const formatLabel = (value) =>
  value
    ? value
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : '';
