const express = require('express');
const router = express.Router();
const { param, query, body } = require('express-validator');

// Import controller and middleware
const badgeController = require('../controllers/badgeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// Validation rules
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
  query('badgeType')
    .optional()
    .isString()
    .withMessage('Badge type must be a string'),
  query('sortBy')
    .optional()
    .isIn(['awardedAt', 'badgeType'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC')
];

// Routes

/**
 * @swagger
 * /badges:
 *   get:
 *     summary: Get all badges (Admin only)
 *     tags: [Badges]
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
 *         description: Number of badges per page
 *       - in: query
 *         name: badgeType
 *         schema:
 *           type: string
 *         description: Filter by badge type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [awardedAt, badgeType]
 *           default: awardedAt
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
 *         description: Badges retrieved successfully
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
 *                   example: Badges retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
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
  authorizeRoles(['admin']),
  queryValidation,
  validateRequest,
  badgeController.getAllBadges
);

/**
 * @swagger
 * /badges/user/{userId}:
 *   get:
 *     summary: Get user's badges
 *     tags: [Badges]
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
 *         description: Number of badges per page
 *       - in: query
 *         name: badgeType
 *         schema:
 *           type: string
 *         description: Filter by badge type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [awardedAt, badgeType]
 *           default: awardedAt
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
 *         description: User badges retrieved successfully
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
 *                   example: User badges retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalBadges:
 *                           type: integer
 *                         uniqueBadgeTypes:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to view this user's badges
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
  badgeController.getUserBadges
);

/**
 * @swagger
 * /badges/award:
 *   post:
 *     summary: Award badge to user (Admin only)
 *     tags: [Badges]
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
 *               - badgeType
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: User ID to award badge to
 *               badgeType:
 *                 type: string
 *                 description: Type of badge to award
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *                 description: Optional reason for awarding the badge
 *     responses:
 *       201:
 *         description: Badge awarded successfully
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
 *                   example: Badge awarded successfully
 *                 data:
 *                   $ref: '#/components/schemas/Badge'
 *       400:
 *         description: Validation error or user already has this badge
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
router.post('/award',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('userId')
      .isUUID()
      .withMessage('Invalid user ID'),
    body('badgeType')
      .notEmpty()
      .withMessage('Badge type is required'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Reason must not exceed 200 characters')
  ],
  validateRequest,
  badgeController.awardBadge
);

/**
 * @swagger
 * /badges/check-eligibility/{userId}:
 *   get:
 *     summary: Check user's badge eligibility
 *     tags: [Badges]
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
 *         description: Badge eligibility checked successfully
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
 *                   example: Badge eligibility checked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     eligibleBadges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           badgeType:
 *                             type: string
 *                           criteria:
 *                             type: object
 *                           progress:
 *                             type: object
 *                             properties:
 *                               current:
 *                                 type: number
 *                               required:
 *                                 type: number
 *                               percentage:
 *                                 type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to check this user's eligibility
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
router.get('/check-eligibility/:userId',
  authenticateToken,
  userIdValidation,
  validateRequest,
  badgeController.checkBadgeEligibility
);

/**
 * @swagger
 * /badges/types:
 *   get:
 *     summary: Get all available badge types
 *     tags: [Badges]
 *     responses:
 *       200:
 *         description: Badge types retrieved successfully
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
 *                   example: Badge types retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       criteria:
 *                         type: object
 *                       icon:
 *                         type: string
 *                       color:
 *                         type: string
 */
router.get('/types',
  badgeController.getBadgeTypes
);

module.exports = router; 