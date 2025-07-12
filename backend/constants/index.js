// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
};

// Role IDs mapping
const ROLE_IDS = {
  ADMIN: 1,
  MODERATOR: 2,
  USER: 3
};

// Item conditions
const ITEM_CONDITIONS = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
};

// Item categories
const ITEM_CATEGORIES = {
  TOPS: 'tops',
  BOTTOMS: 'bottoms',
  DRESSES: 'dresses',
  OUTERWEAR: 'outerwear',
  SHOES: 'shoes',
  ACCESSORIES: 'accessories',
  BAGS: 'bags',
  JEWELRY: 'jewelry'
};

// Swap status
const SWAP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Points system
const POINTS = {
  ITEM_UPLOAD: 10,
  SUCCESSFUL_SWAP: 25,
  ECO_IMPACT_BONUS: 5,
  REFERRAL_BONUS: 15
};

// Eco impact multipliers
const ECO_IMPACT_MULTIPLIERS = {
  COTTON: 0.8,
  POLYESTER: 0.6,
  WOOL: 0.9,
  SILK: 0.7,
  DENIM: 0.85,
  LEATHER: 0.75
};

// File upload limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGES_PER_ITEM: 5
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50
};

// JWT
const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d'
};

// Validation
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

module.exports = {
  USER_ROLES,
  ROLE_IDS,
  ITEM_CONDITIONS,
  ITEM_CATEGORIES,
  SWAP_STATUS,
  POINTS,
  ECO_IMPACT_MULTIPLIERS,
  UPLOAD_LIMITS,
  PAGINATION,
  JWT,
  VALIDATION
}; 