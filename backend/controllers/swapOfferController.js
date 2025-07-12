const { validationResult } = require('express-validator');
const { SwapOffer, Item, User, Swap, Notification } = require('../models');
const { paginate } = require('../utils/pagination');

// Get all swap offers with pagination and filters
const getSwapOffers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = {};

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by type (sent or received)
    if (type === 'sent') {
      whereClause.fromUserId = req.user.userId;
    } else if (type === 'received') {
      whereClause.toUserId = req.user.userId;
    } else {
      // Show both sent and received offers
      whereClause.$or = [
        { fromUserId: req.user.userId },
        { toUserId: req.user.userId }
      ];
    }

    const result = await paginate(SwapOffer, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Item,
          as: 'requestedItem',
          attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Swap offers retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting swap offers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a new swap offer
const createSwapOffer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      toUserId,
      offeredItemIds,
      requestedItemId,
      message
    } = req.body;

    // Validate that requested item exists and is available
    const requestedItem = await Item.findByPk(requestedItemId);
    if (!requestedItem) {
      return res.status(404).json({
        success: false,
        message: 'Requested item not found'
      });
    }

    if (requestedItem.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Requested item is not available for swap'
      });
    }

    // Validate that requested item belongs to toUserId
    if (requestedItem.userId !== toUserId) {
      return res.status(400).json({
        success: false,
        message: 'Requested item does not belong to the specified user'
      });
    }

    // Validate offered items
    const offeredItems = await Item.findAll({
      where: {
        id: offeredItemIds,
        userId: req.user.userId,
        status: 'available'
      }
    });

    if (offeredItems.length !== offeredItemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some offered items are not available or do not belong to you'
      });
    }

    // Check if user is trying to swap with themselves
    if (req.user.userId === toUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot make swap offer to yourself'
      });
    }

    // Check if there's already a pending offer for this item
    const existingOffer = await SwapOffer.findOne({
      where: {
        fromUserId: req.user.userId,
        requestedItemId,
        status: 'pending'
      }
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending offer for this item'
      });
    }

    // Create the swap offer
    const swapOffer = await SwapOffer.create({
      fromUserId: req.user.userId,
      toUserId,
      offeredItemIds,
      requestedItemId,
      message
    });

    // Create notification for the recipient
    await Notification.createSwapOfferNotification(
      toUserId,
      req.user,
      requestedItem.title
    );

    const createdOffer = await SwapOffer.findByPk(swapOffer.id, {
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Item,
          as: 'requestedItem',
          attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Swap offer created successfully',
      data: createdOffer
    });
  } catch (error) {
    console.error('Error creating swap offer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update swap offer
const updateSwapOffer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { offeredItemIds, message } = req.body;

    const swapOffer = await SwapOffer.findByPk(id);
    if (!swapOffer) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is the sender of the offer
    if (swapOffer.fromUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this offer'
      });
    }

    // Check if offer is still pending
    if (swapOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Offer is no longer pending and cannot be updated'
      });
    }

    // Validate offered items if provided
    if (offeredItemIds) {
      const offeredItems = await Item.findAll({
        where: {
          id: offeredItemIds,
          userId: req.user.userId,
          status: 'available'
        }
      });

      if (offeredItems.length !== offeredItemIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some offered items are not available or do not belong to you'
        });
      }
    }

    // Update the offer
    const updateData = {};
    if (offeredItemIds) updateData.offeredItemIds = offeredItemIds;
    if (message !== undefined) updateData.message = message;

    await swapOffer.update(updateData);

    const updatedOffer = await SwapOffer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Item,
          as: 'requestedItem',
          attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Swap offer updated successfully',
      data: updatedOffer
    });
  } catch (error) {
    console.error('Error updating swap offer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Accept swap offer
const acceptSwapOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const swapOffer = await SwapOffer.findByPk(id);
    if (!swapOffer) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is the recipient of the offer
    if (swapOffer.toUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this offer'
      });
    }

    // Check if offer is still pending
    if (swapOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Offer is no longer pending'
      });
    }

    // Accept the offer and create a swap
    const result = await swapOffer.accept();

    res.json({
      success: true,
      message: 'Swap offer accepted successfully',
      data: {
        swap: result.swap,
        offer: result.updatedOffer
      }
    });
  } catch (error) {
    console.error('Error accepting swap offer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reject swap offer
const rejectSwapOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const swapOffer = await SwapOffer.findByPk(id);
    if (!swapOffer) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is the recipient of the offer
    if (swapOffer.toUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this offer'
      });
    }

    // Check if offer is still pending
    if (swapOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Offer is no longer pending'
      });
    }

    // Reject the offer
    await swapOffer.reject(reason);

    res.json({
      success: true,
      message: 'Swap offer rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting swap offer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Counter swap offer
const counterSwapOffer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { offeredItemIds, message } = req.body;

    const swapOffer = await SwapOffer.findByPk(id);
    if (!swapOffer) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is the recipient of the offer
    if (swapOffer.toUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to counter this offer'
      });
    }

    // Check if offer is still pending
    if (swapOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Offer is no longer pending'
      });
    }

    // Validate counter offer items
    const counterItems = await Item.findAll({
      where: {
        id: offeredItemIds,
        userId: req.user.userId,
        status: 'available'
      }
    });

    if (counterItems.length !== offeredItemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some counter offer items are not available or do not belong to you'
      });
    }

    // Create counter offer
    const result = await swapOffer.counter(offeredItemIds, message);

    res.status(201).json({
      success: true,
      message: 'Counter offer created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating counter offer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's swap offers (sent and received)
const getUserSwapOffers = async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const offers = await SwapOffer.findByUser(req.user.userId, type);
    
    // Manual pagination since the model method doesn't support it
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedOffers = offers.slice(startIndex, endIndex);

    const result = {
      offers: paginatedOffers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(offers.length / limit),
        totalItems: offers.length,
        itemsPerPage: parseInt(limit)
      }
    };

    res.json({
      success: true,
      message: 'Swap offers retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting swap offers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get pending swap offers for user
const getPendingSwapOffers = async (req, res) => {
  try {
    const offers = await SwapOffer.findPendingByUser(req.user.userId);

    res.json({
      success: true,
      message: 'Pending swap offers retrieved successfully',
      data: offers
    });
  } catch (error) {
    console.error('Error getting pending swap offers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Respond to swap offer (accept/reject/counter)
const respondToSwapOffer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { action, counterOffer } = req.body;

    const swapOffer = await SwapOffer.findByPk(id);
    if (!swapOffer) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is the recipient of the offer
    if (swapOffer.toUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this offer'
      });
    }

    // Check if offer is still pending
    if (swapOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Offer is no longer pending'
      });
    }

    let result;

    switch (action) {
      case 'accept':
        result = await swapOffer.accept();
        break;

      case 'reject':
        result = await swapOffer.reject();
        break;

      case 'counter':
        if (!counterOffer || !counterOffer.offeredItemIds) {
          return res.status(400).json({
            success: false,
            message: 'Counter offer must include offered items'
          });
        }

        // Validate counter offer items
        const counterItems = await Item.findAll({
          where: {
            id: counterOffer.offeredItemIds,
            userId: req.user.userId,
            status: 'available'
          }
        });

        if (counterItems.length !== counterOffer.offeredItemIds.length) {
          return res.status(400).json({
            success: false,
            message: 'Some counter offer items are not available or do not belong to you'
          });
        }

        result = await swapOffer.counter(
          counterOffer.offeredItemIds,
          counterOffer.message
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be accept, reject, or counter'
        });
    }

    const updatedOffer = await SwapOffer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Item,
          as: 'requestedItem',
          attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
        }
      ]
    });

    res.json({
      success: true,
      message: `Swap offer ${action}ed successfully`,
      data: updatedOffer
    });
  } catch (error) {
    console.error('Error responding to swap offer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel swap offer
const cancelSwapOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const swapOffer = await SwapOffer.findByPk(id);
    if (!swapOffer) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is the sender of the offer
    if (swapOffer.fromUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this offer'
      });
    }

    // Check if offer is still pending
    if (swapOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Offer is no longer pending'
      });
    }

    await swapOffer.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Swap offer cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling swap offer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get swap offer by ID
const getSwapOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const swapOffer = await SwapOffer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Item,
          as: 'requestedItem',
          attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
        }
      ]
    });

    if (!swapOffer) {
      return res.status(404).json({
        success: false,
        message: 'Swap offer not found'
      });
    }

    // Check if user is involved in this offer
    if (swapOffer.fromUserId !== req.user.userId && swapOffer.toUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this offer'
      });
    }

    res.json({
      success: true,
      message: 'Swap offer retrieved successfully',
      data: swapOffer
    });
  } catch (error) {
    console.error('Error getting swap offer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getSwapOffers,
  createSwapOffer,
  updateSwapOffer,
  acceptSwapOffer,
  rejectSwapOffer,
  counterSwapOffer,
  getUserSwapOffers,
  getPendingSwapOffers,
  respondToSwapOffer,
  cancelSwapOffer,
  getSwapOfferById
}; 