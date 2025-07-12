/**
 * Pagination utility for Sequelize queries
 * @param {Object} Model - Sequelize model
 * @param {Object} options - Query options
 * @returns {Object} Paginated result with data and pagination info
 */
const paginate = async (Model, options = {}) => {
  const {
    page = 1,
    limit = 10,
    where = {},
    include = [],
    order = [['createdAt', 'DESC']],
    attributes = null,
    group = null,
    having = null,
    distinct = false
  } = options;

  const offset = (page - 1) * limit;
  const actualLimit = parseInt(limit);
  const actualPage = parseInt(page);

  // Build query options
  const queryOptions = {
    where,
    include,
    order,
    limit: actualLimit,
    offset,
    distinct
  };

  if (attributes) queryOptions.attributes = attributes;
  if (group) queryOptions.group = group;
  if (having) queryOptions.having = having;

  // Execute query
  const { count, rows } = await Model.findAndCountAll(queryOptions);

  // Calculate pagination info
  const totalPages = Math.ceil(count / actualLimit);
  const hasNextPage = actualPage < totalPages;
  const hasPrevPage = actualPage > 1;

  return {
    data: rows,
    pagination: {
      currentPage: actualPage,
      totalPages,
      totalItems: count,
      itemsPerPage: actualLimit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? actualPage + 1 : null,
      prevPage: hasPrevPage ? actualPage - 1 : null
    }
  };
};

/**
 * Simple pagination for arrays
 * @param {Array} array - Array to paginate
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
const paginateArray = (array, page = 1, limit = 10) => {
  const actualPage = parseInt(page);
  const actualLimit = parseInt(limit);
  const startIndex = (actualPage - 1) * actualLimit;
  const endIndex = startIndex + actualLimit;

  const paginatedData = array.slice(startIndex, endIndex);
  const totalPages = Math.ceil(array.length / actualLimit);
  const hasNextPage = actualPage < totalPages;
  const hasPrevPage = actualPage > 1;

  return {
    data: paginatedData,
    pagination: {
      currentPage: actualPage,
      totalPages,
      totalItems: array.length,
      itemsPerPage: actualLimit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? actualPage + 1 : null,
      prevPage: hasPrevPage ? actualPage - 1 : null
    }
  };
};

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Validated parameters
 */
const validatePaginationParams = (params) => {
  const { page = 1, limit = 10 } = params;
  
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

  return {
    page: validatedPage,
    limit: validatedLimit
  };
};

/**
 * Create pagination links for API responses
 * @param {string} baseUrl - Base URL for the API
 * @param {Object} pagination - Pagination info
 * @param {Object} queryParams - Additional query parameters
 * @returns {Object} Pagination links
 */
const createPaginationLinks = (baseUrl, pagination, queryParams = {}) => {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
  
  // Build query string
  const buildQueryString = (page) => {
    const params = new URLSearchParams({
      ...queryParams,
      page: page.toString()
    });
    return params.toString();
  };

  const links = {
    first: `${baseUrl}?${buildQueryString(1)}`,
    last: `${baseUrl}?${buildQueryString(totalPages)}`,
    self: `${baseUrl}?${buildQueryString(currentPage)}`
  };

  if (hasPrevPage) {
    links.prev = `${baseUrl}?${buildQueryString(currentPage - 1)}`;
  }

  if (hasNextPage) {
    links.next = `${baseUrl}?${buildQueryString(currentPage + 1)}`;
  }

  return links;
};

module.exports = {
  paginate,
  paginateArray,
  validatePaginationParams,
  createPaginationLinks
}; 