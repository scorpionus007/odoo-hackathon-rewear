const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controller and middleware
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const RoleMiddleware = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const createNotificationValidation = [
  body('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('type')
    .isIn(['swap_offer', 'swap_accepted', 'swap_rejected', 'swap_completed', 'badge_awarded', 'reward_redeemed', 'system'])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Message must be between 5 and 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid ISO date')
];

const updateNotificationValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid notification ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Message must be between 5 and 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid ISO date')
];

const notificationIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid notification ID')
];

const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['swap_offer', 'swap_accepted', 'swap_rejected', 'swap_completed', 'badge_awarded', 'reward_redeemed', 'system'])
    .withMessage('Invalid notification type filter'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority filter'),
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'priority', 'isRead'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC')
];

// Routes

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of notifications per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [swap_offer, swap_accepted, swap_rejected, swap_completed, badge_awarded, reward_redeemed, system]
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, priority, isRead]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notifications retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/',
  authenticateToken,
  RoleMiddleware.debugUserRole, // Debug middleware to log role info
  RoleMiddleware.isAdmin,
  queryValidation,
  validateRequest,
  notificationController.getAllNotifications
);

/**
 * @swagger
 * /notifications/user/{userId}:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of notifications per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [swap_offer, swap_accepted, swap_rejected, swap_completed, badge_awarded, reward_redeemed, system]
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, priority, isRead]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User notifications retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalNotifications:
 *                           type: integer
 *                         unreadCount:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to view this user's notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/user/:userId',
  authenticateToken,
  userIdValidation,
  validateRequest,
  notificationController.getUserNotifications
);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to view this notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  authenticateToken,
  notificationIdValidation,
  validateRequest,
  notificationController.getNotificationById
);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create new notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: User ID to send notification to
 *               type:
 *                 type: string
 *                 enum: [swap_offer, swap_accepted, swap_rejected, swap_completed, badge_awarded, reward_redeemed, system]
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               message:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the notification expires
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  authenticateToken,
  RoleMiddleware.debugUserRole, // Debug middleware to log role info
  RoleMiddleware.isAdmin,
  createNotificationValidation,
  validateRequest,
  notificationController.createNotification
);

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Update notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               message:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               isRead:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to update this notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id',
  authenticateToken,
  updateNotificationValidation,
  validateRequest,
  notificationController.updateNotification
);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to delete this notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id',
  authenticateToken,
  notificationIdValidation,
  validateRequest,
  notificationController.deleteNotification
);

/**
 * @swagger
 * /notifications/{id}/mark-read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification marked as read successfully
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to mark this notification as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/mark-read',
  authenticateToken,
  notificationIdValidation,
  validateRequest,
  notificationController.markAsRead
);

/**
 * @swagger
 * /notifications/user/{userId}/mark-all-read:
 *   post:
 *     summary: Mark all user notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to mark this user's notifications as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/user/:userId/mark-all-read',
  authenticateToken,
  userIdValidation,
  validateRequest,
  notificationController.markAllAsRead
);

module.exports = router; 