const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const itemRoutes = require('./itemRoutes');
const swapOfferRoutes = require('./swapOfferRoutes');
const swapRoutes = require('./swapRoutes');
const ecoImpactRoutes = require('./ecoImpactRoutes');
const badgeRoutes = require('./badgeRoutes');
const rewardsRoutes = require('./rewardsRoutes');
const notificationRoutes = require('./notificationRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ReWear API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'ReWear API Documentation',
    endpoints: {
      auth: {
        base: '/api/auth',
        endpoints: [
          'POST /register - Register new user',
          'POST /login - User login',
          'POST /logout - User logout',
          'POST /refresh - Refresh token',
          'POST /forgot-password - Forgot password',
          'POST /reset-password - Reset password',
          'POST /verify-otp - Verify OTP'
        ]
      },
      users: {
        base: '/api/users',
        endpoints: [
          'GET /profile - Get user profile',
          'PUT /profile - Update user profile',
          'GET /:userId - Get user by ID',
          'GET /search - Search users',
          'GET /leaderboard - Get user leaderboard'
        ]
      },
      items: {
        base: '/api/items',
        endpoints: [
          'GET / - Get all items',
          'POST / - Create new item',
          'GET /:id - Get item by ID',
          'PUT /:id - Update item',
          'DELETE /:id - Delete item',
          'GET /user/:userId - Get user items',
          'POST /:id/donate - Donate item'
        ]
      },
      swapOffers: {
        base: '/api/swap-offers',
        endpoints: [
          'POST / - Create swap offer',
          'GET / - Get user swap offers',
          'GET /pending - Get pending offers',
          'GET /:id - Get offer by ID',
          'PUT /:id/respond - Respond to offer',
          'DELETE /:id - Cancel offer'
        ]
      },
      swaps: {
        base: '/api/swaps',
        endpoints: [
          'GET / - Get user swaps',
          'GET /completed - Get completed swaps',
          'GET /:id - Get swap by ID',
          'PUT /:id/complete - Complete swap',
          'PUT /:id/cancel - Cancel swap',
          'GET /stats - Get swap statistics',
          'GET /recent - Get recent swaps'
        ]
      },
      ecoImpact: {
        base: '/api/eco-impact',
        endpoints: [
          'GET /user/:userId - Get user eco impact',
          'GET /user/:userId/history - Get user eco impact history',
          'GET /global - Get global eco impact',
          'GET /category/:category - Get eco impact by category',
          'GET /leaderboard - Get eco impact leaderboard',
          'GET /analytics - Get eco impact analytics'
        ]
      },
      badges: {
        base: '/api/badges',
        endpoints: [
          'GET /user/:userId - Get user badges',
          'GET /stats - Get badge statistics',
          'GET /types - Get badge types',
          'POST /user/:userId/check - Check user badges',
          'GET /leaderboard - Get badge leaderboard',
          'GET /recent - Get recent badge awards',
          'GET /user/:userId/progress - Get user badge progress'
        ]
      },
      rewards: {
        base: '/api/rewards',
        endpoints: [
          'GET / - Get available rewards',
          'GET /:id - Get reward by ID',
          'POST /:id/redeem - Redeem reward',
          'GET /user/:userId/redemptions - Get user redemptions',
          'GET /user/:userId/active - Get active redemptions',
          'GET /popular - Get popular rewards',
          'GET /by-points - Get rewards by points range',
          'GET /user/:userId/stats - Get redemption statistics',
          'GET /global-stats - Get global redemption statistics',
          'PUT /redemptions/:id/use - Use redemption'
        ]
      },
      notifications: {
        base: '/api/notifications',
        endpoints: [
          'GET / - Get user notifications',
          'GET /unread-count - Get unread count',
          'PUT /:id/read - Mark as read',
          'PUT /:id/unread - Mark as unread',
          'PUT /mark-all-read - Mark all as read',
          'DELETE /:id - Delete notification',
          'GET /:id - Get notification by ID',
          'GET /type/:type - Get notifications by type',
          'GET /recent - Get recent notifications',
          'GET /stats - Get notification statistics',
          'DELETE /expired - Delete expired notifications'
        ]
      }
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/items', itemRoutes);
router.use('/swap-offers', swapOfferRoutes);
router.use('/swaps', swapRoutes);
router.use('/eco-impact', ecoImpactRoutes);
router.use('/badges', badgeRoutes);
router.use('/rewards', rewardsRoutes);
router.use('/notifications', notificationRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = router; 