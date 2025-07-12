const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controller and middleware
const swapOfferController = require('../controllers/swapOfferController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const createOfferValidation = [
  body('toUserId')
    .isUUID()
    .withMessage('Invalid recipient user ID'),
  body('offeredItemIds')
    .isArray({ min: 1 })
    .withMessage('At least one item must be offered'),
  body('offeredItemIds.*')
    .isUUID()
    .withMessage('Invalid offered item ID'),
  body('requestedItemId')
    .isUUID()
    .withMessage('Invalid requested item ID'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters')
];

const updateOfferValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid offer ID'),
  body('offeredItemIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one item must be offered'),
  body('offeredItemIds.*')
    .optional()
    .isUUID()
    .withMessage('Invalid offered item ID'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters')
];

const offerIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid offer ID')
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
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'cancelled', 'countered'])
    .withMessage('Invalid status filter'),
  query('type')
    .optional()
    .isIn(['sent', 'received'])
    .withMessage('Type must be sent or received'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC')
];

// Routes

/**
 * @swagger
 * /swap-offers:
 *   get:
 *     summary: Get swap offers with pagination and filters
 *     tags: [Swap Offers]
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
 *         description: Number of offers per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, countered]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sent, received]
 *         description: Filter by offer type (sent or received)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
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
 *         description: Swap offers retrieved successfully
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
 *                   example: Swap offers retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SwapOffer'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/',
  authenticateToken,
  queryValidation,
  validateRequest,
  swapOfferController.getSwapOffers
);

/**
 * @swagger
 * /swap-offers/{id}:
 *   get:
 *     summary: Get swap offer by ID
 *     tags: [Swap Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Swap offer ID
 *     responses:
 *       200:
 *         description: Swap offer retrieved successfully
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
 *                   example: Swap offer retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/SwapOffer'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to view this offer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Swap offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  authenticateToken,
  offerIdValidation,
  validateRequest,
  swapOfferController.getSwapOfferById
);

/**
 * @swagger
 * /swap-offers:
 *   post:
 *     summary: Create new swap offer
 *     tags: [Swap Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toUserId
 *               - offeredItemIds
 *               - requestedItemId
 *             properties:
 *               toUserId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user receiving the offer
 *               offeredItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 description: Array of item IDs being offered
 *               requestedItemId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the item being requested
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional message with the offer
 *     responses:
 *       201:
 *         description: Swap offer created successfully
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
 *                   example: Swap offer created successfully
 *                 data:
 *                   $ref: '#/components/schemas/SwapOffer'
 *       400:
 *         description: Validation error or items not available
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
 *         description: User or items not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  authenticateToken,
  createOfferValidation,
  validateRequest,
  swapOfferController.createSwapOffer
);

/**
 * @swagger
 * /swap-offers/{id}:
 *   put:
 *     summary: Update swap offer
 *     tags: [Swap Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Swap offer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offeredItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 description: Array of item IDs being offered
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional message with the offer
 *     responses:
 *       200:
 *         description: Swap offer updated successfully
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
 *                   example: Swap offer updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/SwapOffer'
 *       400:
 *         description: Validation error or offer cannot be updated
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
 *         description: Forbidden - Not authorized to update this offer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Swap offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id',
  authenticateToken,
  updateOfferValidation,
  validateRequest,
  swapOfferController.updateSwapOffer
);

/**
 * @swagger
 * /swap-offers/{id}/accept:
 *   post:
 *     summary: Accept swap offer
 *     tags: [Swap Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Swap offer ID
 *     responses:
 *       200:
 *         description: Swap offer accepted successfully
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
 *                   example: Swap offer accepted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     swap:
 *                       $ref: '#/components/schemas/Swap'
 *                     offer:
 *                       $ref: '#/components/schemas/SwapOffer'
 *       400:
 *         description: Offer cannot be accepted
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
 *         description: Forbidden - Not authorized to accept this offer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Swap offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/accept',
  authenticateToken,
  offerIdValidation,
  validateRequest,
  swapOfferController.acceptSwapOffer
);

/**
 * @swagger
 * /swap-offers/{id}/reject:
 *   post:
 *     summary: Reject swap offer
 *     tags: [Swap Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Swap offer ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *                 description: Optional reason for rejection
 *     responses:
 *       200:
 *         description: Swap offer rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Offer cannot be rejected
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
 *         description: Forbidden - Not authorized to reject this offer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Swap offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/reject',
  authenticateToken,
  offerIdValidation,
  validateRequest,
  swapOfferController.rejectSwapOffer
);

/**
 * @swagger
 * /swap-offers/{id}/counter:
 *   post:
 *     summary: Counter swap offer
 *     tags: [Swap Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Swap offer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offeredItemIds
 *             properties:
 *               offeredItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 description: Array of item IDs being offered in counter
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional message with the counter offer
 *     responses:
 *       201:
 *         description: Counter offer created successfully
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
 *                   example: Counter offer created successfully
 *                 data:
 *                   $ref: '#/components/schemas/SwapOffer'
 *       400:
 *         description: Validation error or cannot create counter offer
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
 *         description: Forbidden - Not authorized to counter this offer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Swap offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/counter',
  authenticateToken,
  offerIdValidation,
  createOfferValidation,
  validateRequest,
  swapOfferController.counterSwapOffer
);

/**
 * @swagger
 * /swap-offers/{id}:
 *   delete:
 *     summary: Cancel swap offer
 *     tags: [Swap Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Swap offer ID
 *     responses:
 *       200:
 *         description: Swap offer cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Offer cannot be cancelled
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
 *         description: Forbidden - Not authorized to cancel this offer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Swap offer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id',
  authenticateToken,
  offerIdValidation,
  validateRequest,
  swapOfferController.cancelSwapOffer
);

module.exports = router; 