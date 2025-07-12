import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            '/api/auth/refresh-token',
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Update tokens in localStorage
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (resetToken, newPassword) => 
    api.post('/api/auth/reset-password', { resetToken, newPassword }),
  changePassword: (currentPassword, newPassword) => 
    api.post('/api/auth/change-password', { currentPassword, newPassword }),
  getProfile: () => api.get('/api/auth/profile'),
};

export const userAPI = {
  updateProfile: (userData) => api.put('/api/users/profile', userData),
  updateProfileImage: (imageData) => api.put('/api/users/profile/image', imageData),
  deleteProfileImage: () => api.delete('/api/users/profile/image'),
  getUserStats: () => api.get('/api/users/stats'),
  getEcoImpact: () => api.get('/api/users/eco-impact'),
  getPreferences: () => api.get('/api/users/preferences'),
  updatePreferences: (preferences) => api.put('/api/users/preferences', preferences),
};

export const itemsAPI = {
  getAllItems: (params) => api.get('/api/items', { params }),
  getItemById: (id) => api.get(`/api/items/${id}`),
  searchItems: (params) => api.get('/api/items/search', { params }),
  getCategories: () => api.get('/api/items/categories'),
  createItem: (itemData) => api.post('/api/items', itemData),
  updateItem: (id, itemData) => api.put(`/api/items/${id}`, itemData),
  deleteItem: (id) => api.delete(`/api/items/${id}`),
  uploadImages: (id, images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    return api.post(`/api/items/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (itemId, imageId) => api.delete(`/api/items/${itemId}/images/${imageId}`),
  getMyItems: () => api.get('/api/items/user/my-items'),
  getFavorites: () => api.get('/api/items/user/favorites'),
  toggleFavorite: (id) => api.post(`/api/items/${id}/favorite`),
};

export const swapsAPI = {
  createSwap: (swapData) => api.post('/api/swaps', swapData),
  getMySwaps: () => api.get('/api/swaps'),
  getSwapById: (id) => api.get(`/api/swaps/${id}`),
  updateSwapStatus: (id, status) => api.put(`/api/swaps/${id}/status`, { status }),
  cancelSwap: (id) => api.delete(`/api/swaps/${id}`),
  makeOffer: (swapId, offerData) => api.post(`/api/swaps/${swapId}/offer`, offerData),
  updateOffer: (swapId, offerId, offerData) => 
    api.put(`/api/swaps/${swapId}/offer/${offerId}`, offerData),
  cancelOffer: (swapId, offerId) => api.delete(`/api/swaps/${swapId}/offer/${offerId}`),
  acceptOffer: (swapId, offerId) => api.post(`/api/swaps/${swapId}/offer/${offerId}/accept`),
  rejectOffer: (swapId, offerId) => api.post(`/api/swaps/${swapId}/offer/${offerId}/reject`),
  getCompletedSwaps: () => api.get('/api/swaps/history/completed'),
  getPendingSwaps: () => api.get('/api/swaps/history/pending'),
};

export const adminAPI = {
  getAllUsers: (params) => api.get('/api/admin/users', { params }),
  getUserById: (id) => api.get(`/api/admin/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/api/admin/users/${id}/status`, { status }),
  updateUserRole: (id, role) => api.put(`/api/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getPendingItems: () => api.get('/api/admin/items/pending'),
  approveItem: (id) => api.put(`/api/admin/items/${id}/approve`),
  rejectItem: (id) => api.put(`/api/admin/items/${id}/reject`),
  deleteItem: (id) => api.delete(`/api/admin/items/${id}`),
  getAllSwaps: (params) => api.get('/api/admin/swaps', { params }),
  getSwapById: (id) => api.get(`/api/admin/swaps/${id}`),
  updateSwapStatus: (id, status) => api.put(`/api/admin/swaps/${id}/status`, { status }),
  getAnalyticsOverview: () => api.get('/api/admin/analytics/overview'),
  getUserAnalytics: () => api.get('/api/admin/analytics/users'),
  getItemAnalytics: () => api.get('/api/admin/analytics/items'),
  getSwapAnalytics: () => api.get('/api/admin/analytics/swaps'),
  getEcoImpactAnalytics: () => api.get('/api/admin/analytics/eco-impact'),
  getSystemSettings: () => api.get('/api/admin/settings'),
  updateSystemSettings: (settings) => api.put('/api/admin/settings', settings),
};

export default api; 