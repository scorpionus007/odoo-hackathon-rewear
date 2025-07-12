const { validationResult } = require('express-validator');
const { Swap, SwapOffer, Item, User, EcoImpact, Badge } = require('../models');
const { paginate } = require('../utils/pagination');

// Get all swaps with pagination and filters
const getSwaps = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = {};

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by user involvement
    whereClause.$or = [
      { fromUserId: req.user.userId },
      { toUserId: req.user.userId }
    ];

    const result = await paginate(Swap, {
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
          as: 'toItem',
          attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Get from items details for each swap
    const swapsWithFromItems = await Promise.all(
      result.data.map(async (swap) => {
        const fromItems = await Item.findAll({
          where: { id: swap.fromItemIds },
          attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
        });
        return {
          ...swap.toJSON(),
          fromItems
        };
      })
    );

    result.data = swapsWithFromItems;

    res.json({
      success: true,
      message: 'Swaps retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting swaps:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's swaps
const getUserSwaps = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const swaps = await Swap.findByUser(req.user.userId);
    
    // Filter by status if provided
    let filteredSwaps = swaps;
    if (status) {
      filteredSwaps = swaps.filter(swap => swap.status === status);
    }

    // Manual pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSwaps = filteredSwaps.slice(startIndex, endIndex);

    const result = {
      swaps: paginatedSwaps,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredSwaps.length / limit),
        totalItems: filteredSwaps.length,
        itemsPerPage: parseInt(limit)
      }
    };

    res.json({
      success: true,
      message: 'Swaps retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting swaps:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get completed swaps for user
const getCompletedSwaps = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const swaps = await Swap.findCompletedByUser(req.user.userId);
    
    // Manual pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSwaps = swaps.slice(startIndex, endIndex);

    const result = {
      swaps: paginatedSwaps,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(swaps.length / limit),
        totalItems: swaps.length,
        itemsPerPage: parseInt(limit)
      }
    };

    res.json({
      success: true,
      message: 'Completed swaps retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting completed swaps:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get swap by ID
const getSwapById = async (req, res) => {
  try {
    const { id } = req.params;

    const swap = await Swap.findByPk(id, {
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
          model: SwapOffer,
          as: 'offer',
          attributes: ['id', 'message', 'offeredItemIds']
        },
        {
          model: Item,
          as: 'toItem',
          attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
        }
      ]
    });

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is involved in this swap
    if (swap.fromUserId !== req.user.userId && swap.toUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this swap'
      });
    }

    // Get from items details
    const fromItems = await Item.findAll({
      where: { id: swap.fromItemIds },
      attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
    });

    const swapData = {
      ...swap.toJSON(),
      fromItems
    };

    res.json({
      success: true,
      message: 'Swap retrieved successfully',
      data: swapData
    });
  } catch (error) {
    console.error('Error getting swap:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Complete a swap
const completeSwap = async (req, res) => {
  try {
    const { id } = req.params;

    const swap = await Swap.findByPk(id);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is involved in this swap
    if (swap.fromUserId !== req.user.userId && swap.toUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this swap'
      });
    }

    // Check if swap is in progress
    if (swap.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Swap is not in progress'
      });
    }

    await swap.complete();

    // Check for badge awards for both users
    await Badge.checkAndAwardBadges(swap.fromUserId);
    await Badge.checkAndAwardBadges(swap.toUserId);

    const completedSwap = await Swap.findByPk(id, {
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
        }
      ]
    });

    res.json({
      success: true,
      message: 'Swap completed successfully',
      data: completedSwap
    });
  } catch (error) {
    console.error('Error completing swap:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel a swap
const cancelSwap = async (req, res) => {
  try {
    const { id } = req.params;

    const swap = await Swap.findByPk(id);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is involved in this swap
    if (swap.fromUserId !== req.user.userId && swap.toUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this swap'
      });
    }

    // Check if swap is in progress
    if (swap.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Swap is not in progress'
      });
    }

    await swap.cancel();

    res.json({
      success: true,
      message: 'Swap cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling swap:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get swap statistics for user
const getSwapStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all swaps for user
    const swaps = await Swap.findAll({
      where: {
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      }
    });

    // Calculate statistics
    const totalSwaps = swaps.length;
    const completedSwaps = swaps.filter(swap => swap.status === 'completed').length;
    const inProgressSwaps = swaps.filter(swap => swap.status === 'in_progress').length;
    const cancelledSwaps = swaps.filter(swap => swap.status === 'cancelled').length;

    // Get eco impact stats
    const ecoStats = await EcoImpact.getUserStats(userId);

    const stats = {
      totalSwaps,
      completedSwaps,
      inProgressSwaps,
      cancelledSwaps,
      completionRate: totalSwaps > 0 ? (completedSwaps / totalSwaps) * 100 : 0,
      ecoImpact: ecoStats
    };

    res.json({
      success: true,
      message: 'Swap statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting swap stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get recent swaps for dashboard
const getRecentSwaps = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const swaps = await Swap.findAll({
      where: {
        $or: [
          { fromUserId: req.user.userId },
          { toUserId: req.user.userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Item,
          as: 'toItem',
          attributes: ['id', 'title', 'images']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Recent swaps retrieved successfully',
      data: swaps
    });
  } catch (error) {
    console.error('Error getting recent swaps:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getSwaps,
  getUserSwaps,
  getCompletedSwaps,
  getSwapById,
  completeSwap,
  cancelSwap,
  getSwapStats,
  getRecentSwaps
}; 