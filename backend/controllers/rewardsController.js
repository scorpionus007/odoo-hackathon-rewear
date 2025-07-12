const { validationResult } = require('express-validator');
const { RewardsCatalog, Redemption, User, Notification } = require('../models');
const { paginate } = require('../utils/pagination');

// Get all rewards (Admin only)
const getAllRewards = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      minPoints,
      maxPoints,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = {};
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    
    if (minPoints || maxPoints) {
      whereClause.pointsRequired = {};
      if (minPoints) whereClause.pointsRequired.$gte = parseInt(minPoints);
      if (maxPoints) whereClause.pointsRequired.$lte = parseInt(maxPoints);
    }

    const result = await paginate(RewardsCatalog, {
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate summary statistics
    const summary = await RewardsCatalog.findOne({
      where: whereClause,
      attributes: [
        [RewardsCatalog.sequelize.fn('COUNT', RewardsCatalog.sequelize.col('id')), 'totalRewards'],
        [RewardsCatalog.sequelize.fn('COUNT', RewardsCatalog.sequelize.fn('DISTINCT', RewardsCatalog.sequelize.col('brand'))), 'uniqueBrands']
      ]
    });

    result.summary = {
      totalRewards: parseInt(summary?.dataValues?.totalRewards) || 0,
      uniqueBrands: parseInt(summary?.dataValues?.uniqueBrands) || 0
    };

    res.json({
      success: true,
      message: 'Rewards retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting all rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a new reward (Admin only)
const createReward = async (req, res) => {
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
      title,
      description,
      brand,
      pointsRequired,
      discountPercentage,
      discountAmount,
      maxRedemptions,
      expiryDate,
      terms,
      imageUrl
    } = req.body;

    const reward = await RewardsCatalog.create({
      title,
      description,
      brand,
      pointsRequired,
      discountPercentage,
      discountAmount,
      maxRedemptions,
      expiryDate,
      terms,
      imageUrl,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Reward created successfully',
      data: reward
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a reward (Admin only)
const updateReward = async (req, res) => {
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
    const updateData = req.body;

    const reward = await RewardsCatalog.findByPk(id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    await reward.update(updateData);

    res.json({
      success: true,
      message: 'Reward updated successfully',
      data: reward
    });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a reward (Admin only)
const deleteReward = async (req, res) => {
  try {
    const { id } = req.params;

    const reward = await RewardsCatalog.findByPk(id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if reward has any redemptions
    const redemptionCount = await Redemption.count({ where: { rewardId: id } });
    if (redemptionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete reward with existing redemptions'
      });
    }

    await reward.destroy();

    res.json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all available rewards
const getAvailableRewards = async (req, res) => {
  try {
    const { page = 1, limit = 10, minPoints, maxPoints } = req.query;

    let whereClause = { isActive: true };
    
    if (minPoints || maxPoints) {
      whereClause.pointsRequired = {};
      if (minPoints) whereClause.pointsRequired.$gte = parseInt(minPoints);
      if (maxPoints) whereClause.pointsRequired.$lte = parseInt(maxPoints);
    }

    const rewards = await RewardsCatalog.findAll({
      where: whereClause,
      order: [['pointsRequired', 'ASC']]
    });

    // Manual pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRewards = rewards.slice(startIndex, endIndex);

    const result = {
      rewards: paginatedRewards,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(rewards.length / limit),
        totalItems: rewards.length,
        itemsPerPage: parseInt(limit)
      }
    };

    res.json({
      success: true,
      message: 'Available rewards retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting available rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get reward by ID
const getRewardById = async (req, res) => {
  try {
    const { id } = req.params;

    const reward = await RewardsCatalog.findByPk(id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    if (!reward.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Reward is not available'
      });
    }

    res.json({
      success: true,
      message: 'Reward retrieved successfully',
      data: reward
    });
  } catch (error) {
    console.error('Error getting reward:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Redeem a reward
const redeemReward = async (req, res) => {
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

    const reward = await RewardsCatalog.findByPk(id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if user has enough points
    if (!reward.canRedeem(req.user.points)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points to redeem this reward'
      });
    }

    // Redeem the reward
    const redemption = await reward.redeem(req.user.id);

    // Get updated user info
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact']
    });

    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        redemption,
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's redemptions
const getUserRedemptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check if user is requesting their own redemptions or is admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s redemptions'
      });
    }

    const redemptions = await Redemption.getUserRedemptions(userId, status);
    
    // Manual pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRedemptions = redemptions.slice(startIndex, endIndex);

    const result = {
      redemptions: paginatedRedemptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(redemptions.length / limit),
        totalItems: redemptions.length,
        itemsPerPage: parseInt(limit)
      }
    };

    res.json({
      success: true,
      message: 'User redemptions retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting user redemptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's active redemptions
const getUserActiveRedemptions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own redemptions or is admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s redemptions'
      });
    }

    const redemptions = await Redemption.getActiveRedemptions(userId);

    res.json({
      success: true,
      message: 'Active redemptions retrieved successfully',
      data: redemptions
    });
  } catch (error) {
    console.error('Error getting active redemptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get popular rewards
const getPopularRewards = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const rewards = await RewardsCatalog.getPopularRewards(parseInt(limit));

    res.json({
      success: true,
      message: 'Popular rewards retrieved successfully',
      data: rewards
    });
  } catch (error) {
    console.error('Error getting popular rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get rewards by points range
const getRewardsByPoints = async (req, res) => {
  try {
    const { minPoints, maxPoints } = req.query;

    if (!minPoints || !maxPoints) {
      return res.status(400).json({
        success: false,
        message: 'Both minPoints and maxPoints are required'
      });
    }

    const rewards = await RewardsCatalog.getRewardsByPoints(
      parseInt(minPoints),
      parseInt(maxPoints)
    );

    res.json({
      success: true,
      message: 'Rewards by points range retrieved successfully',
      data: rewards
    });
  } catch (error) {
    console.error('Error getting rewards by points:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get redemption statistics
const getRedemptionStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own stats or is admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s redemption stats'
      });
    }

    const stats = await Redemption.getRedemptionStats(userId);

    res.json({
      success: true,
      message: 'Redemption statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting redemption stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get global redemption statistics (admin only)
const getGlobalRedemptionStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = await Redemption.getGlobalStats();

    // Get most redeemed rewards
    const mostRedeemedRewards = await RewardsCatalog.findAll({
      attributes: [
        'id', 'title', 'brand', 'pointsRequired',
        [RewardsCatalog.sequelize.fn('COUNT', RewardsCatalog.sequelize.col('redemptions.id')), 'redemptionCount']
      ],
      include: [
        {
          model: Redemption,
          as: 'redemptions',
          attributes: []
        }
      ],
      group: ['RewardsCatalog.id'],
      order: [[RewardsCatalog.sequelize.fn('COUNT', RewardsCatalog.sequelize.col('redemptions.id')), 'DESC']],
      limit: 10
    });

    // Get recent redemptions
    const recentRedemptions = await Redemption.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: RewardsCatalog,
          as: 'reward',
          attributes: ['id', 'title', 'brand']
        }
      ],
      order: [['redeemedAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      message: 'Global redemption statistics retrieved successfully',
      data: {
        stats,
        mostRedeemedRewards,
        recentRedemptions
      }
    });
  } catch (error) {
    console.error('Error getting global redemption stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Use a redemption (mark as used)
const useRedemption = async (req, res) => {
  try {
    const { id } = req.params;

    const redemption = await Redemption.findByPk(id, {
      include: [
        {
          model: RewardsCatalog,
          as: 'reward',
          attributes: ['id', 'title', 'brand']
        }
      ]
    });

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption not found'
      });
    }

    // Check if user owns this redemption or is admin
    if (redemption.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to use this redemption'
      });
    }

    await redemption.use();

    res.json({
      success: true,
      message: 'Redemption used successfully',
      data: redemption
    });
  } catch (error) {
    console.error('Error using redemption:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  getAvailableRewards,
  getRewardById,
  redeemReward,
  getUserRedemptions,
  getUserActiveRedemptions,
  getPopularRewards,
  getRewardsByPoints,
  getRedemptionStats,
  getGlobalRedemptionStats,
  useRedemption
}; 