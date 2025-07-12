const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controller and middleware
const rewardsController = require('../controllers/rewardsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const createRewardValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('brand')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand must be between 2 and 50 characters'),
  body('pointsRequired')
    .isInt({ min: 1 })
    .withMessage('Points required must be a positive integer'),
  body('maxRedemptions')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max redemptions must be a positive integer'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO date')
];

const updateRewardValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid reward ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand must be between 2 and 50 characters'),
  body('pointsRequired')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points required must be a positive integer'),
  body('maxRedemptions')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max redemptions must be a positive integer'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO date'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const rewardIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid reward ID')
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
  query('brand')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Invalid brand filter'),
  query('minPoints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min points must be a non-negative integer'),
  query('maxPoints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max points must be a non-negative integer'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'pointsRequired', 'currentRedemptions'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC')
];

// Routes

/**
 * @swagger
 * /rewards:
 *   get:
 *     summary: Get all rewards with pagination and filters
 *     tags: [Rewards]
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
 *         description: Number of rewards per page
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: minPoints
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum points required
 *       - in: query
 *         name: maxPoints
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum points required
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, pointsRequired, currentRedemptions]
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
 *         description: Rewards retrieved successfully
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
 *                   example: Rewards retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RewardsCatalog'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/',
  queryValidation,
  validateRequest,
  rewardsController.getAllRewards
);

/**
 * @swagger
 * /rewards/{id}:
 *   get:
 *     summary: Get reward by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward retrieved successfully
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
 *                   example: Reward retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/RewardsCatalog'
 *       404:
 *         description: Reward not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  rewardIdValidation,
  validateRequest,
  rewardsController.getRewardById
);

/**
 * @swagger
 * /rewards:
 *   post:
 *     summary: Create new reward (Admin only)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - brand
 *               - pointsRequired
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               brand:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               pointsRequired:
 *                 type: integer
 *                 minimum: 1
 *               maxRedemptions:
 *                 type: integer
 *                 minimum: 1
 *                 description: Maximum number of times this reward can be redeemed
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 description: When the reward expires
 *     responses:
 *       201:
 *         description: Reward created successfully
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
 *                   example: Reward created successfully
 *                 data:
 *                   $ref: '#/components/schemas/RewardsCatalog'
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
 */
router.post('/',
  authenticateToken,
  authorizeRoles(['admin']),
  createRewardValidation,
  validateRequest,
  rewardsController.createReward
);

/**
 * @swagger
 * /rewards/{id}:
 *   put:
 *     summary: Update reward (Admin only)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reward ID
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
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               brand:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               pointsRequired:
 *                 type: integer
 *                 minimum: 1
 *               maxRedemptions:
 *                 type: integer
 *                 minimum: 1
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Reward updated successfully
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
 *                   example: Reward updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/RewardsCatalog'
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
 *         description: Reward not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  updateRewardValidation,
  validateRequest,
  rewardsController.updateReward
);

/**
 * @swagger
 * /rewards/{id}:
 *   delete:
 *     summary: Delete reward (Admin only)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Cannot delete reward with active redemptions
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
 *         description: Reward not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  rewardIdValidation,
  validateRequest,
  rewardsController.deleteReward
);

/**
 * @swagger
 * /rewards/{id}/redeem:
 *   post:
 *     summary: Redeem reward
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reward ID
 *     responses:
 *       201:
 *         description: Reward redeemed successfully
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
 *                   example: Reward redeemed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     redemption:
 *                       $ref: '#/components/schemas/Redemption'
 *                     remainingPoints:
 *                       type: integer
 *       400:
 *         description: Insufficient points or reward not available
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
 *       404:
 *         description: Reward not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/redeem',
  authenticateToken,
  rewardIdValidation,
  validateRequest,
  rewardsController.redeemReward
);

/**
 * @swagger
 * /rewards/user/{userId}/redemptions:
 *   get:
 *     summary: Get user's reward redemptions
 *     tags: [Rewards]
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
 *         description: Number of redemptions per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, used, expired]
 *         description: Filter by redemption status
 *     responses:
 *       200:
 *         description: User redemptions retrieved successfully
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
 *                   example: User redemptions retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Redemption'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to view this user's redemptions
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
router.get('/user/:userId/redemptions',
  authenticateToken,
  userIdValidation,
  validateRequest,
  rewardsController.getUserRedemptions
);

module.exports = router; 