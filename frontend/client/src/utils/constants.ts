export const ROUTES = {
  HOME: '/',
  ITEMS: '/items',
  DASHBOARD: '/dashboard',
  EXCHANGES: '/exchanges',
  ADMIN: '/admin',
  LOGIN: '/login',
} as const;

export const COLORS = {
  PRIMARY: '#10B981',
  SECONDARY: '#0D9488',
  ACCENT: '#F59E0B',
  SUCCESS: '#059669',
  WARNING: '#D97706',
  ERROR: '#DC2626',
  GRAY_50: '#F9FAFB',
  GRAY_500: '#6B7280',
  GRAY_900: '#111827',
} as const;

export const ITEM_CONDITIONS = [
  { value: 'like-new', label: 'Like New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
] as const;

export const ITEM_CATEGORIES = [
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
] as const;

export const SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL'
] as const;

export const EXCHANGE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
] as const;
