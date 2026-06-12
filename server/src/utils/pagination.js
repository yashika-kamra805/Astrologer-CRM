/**
 * Pagination and sorting helpers for list endpoints.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const ALLOWED_SORT_FIELDS = ['createdAt', 'name'];

/**
 * Parse and sanitize pagination query parameters.
 * @param {import('express').Request['query']} query
 * @param {{ allowedSortFields?: string[], defaultSortBy?: string }} [options]
 * @returns {{ page: number, limit: number, skip: number, sortBy: string, order: 'asc' | 'desc' }}
 */
const parsePaginationQuery = (
  query,
  { allowedSortFields = ALLOWED_SORT_FIELDS, defaultSortBy = 'createdAt' } = {}
) => {
  const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : defaultSortBy;

  const order = query.order === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, order };
};

/**
 * Build a Mongoose sort object from parsed pagination options.
 * @param {string} sortBy
 * @param {'asc' | 'desc'} order
 * @returns {Record<string, 1 | -1>}
 */
const buildSortObject = (sortBy, order) => ({
  [sortBy]: order === 'asc' ? 1 : -1,
});

/**
 * Format a paginated response envelope.
 * @param {object[]} data
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 */
const formatPaginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  },
});

module.exports = {
  parsePaginationQuery,
  buildSortObject,
  formatPaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  ALLOWED_SORT_FIELDS,
};
