const { validationResult } = require('express-validator');
const { User, Item, Swap, Badge, SwapOffer, Redemption, Notification } = require('../models');
const { paginate } = require('../utils/pagination');

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password', 'resetPasswordOtp', 'resetPasswordOtpExpiry'] },
      include: [
        {
          model: Badge,
          as: 'badges',
          attributes: ['id', 'badgeType', 'awardedAt'],
          order: [['awardedAt', 'DESC']],
          limit: 5
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const itemCount = await Item.count({ where: { userId: user.id } });
    const swapCount = await Swap.count({
      where: {
        $or: [
          { fromUserId: user.id },
          { toUserId: user.id }
        ]
      }
    });

    const profileData = {
      ...user.toJSON(),
      stats: {
        itemsListed: itemCount,
        swapsCompleted: swapCount
      }
    };

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, bio, location, preferences } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (preferences) updateData.preferences = preferences;

    await user.update(updateData);

    // Remove sensitive fields from response
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      preferences: user.preferences,
      role: user.role,
      points: user.points,
      ecoImpact: user.ecoImpact,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isVerified,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = {};

    if (search) {
      whereClause.$or = [
        { firstName: { $iLike: `%${search}%` } },
        { lastName: { $iLike: `%${search}%` } },
        { email: { $iLike: `%${search}%` } }
      ];
    }

    if (role) whereClause.role = role;
    if (isVerified !== undefined) whereClause.isVerified = isVerified === 'true';
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const result = await paginate(User, {
      where: whereClause,
      attributes: { exclude: ['password', 'resetPasswordOtp', 'resetPasswordOtpExpiry'] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'resetPasswordOtp', 'resetPasswordOtpExpiry'] },
      include: [
        {
          model: Badge,
          as: 'badges',
          attributes: ['id', 'badgeType', 'awardedAt'],
          order: [['awardedAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const itemCount = await Item.count({ where: { userId: user.id } });
    const swapCount = await Swap.count({
      where: {
        $or: [
          { fromUserId: user.id },
          { toUserId: user.id }
        ]
      }
    });

    const userData = {
      ...user.toJSON(),
      stats: {
        itemsListed: itemCount,
        swapsCompleted: swapCount
      }
    };

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: userData
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update user (Admin or self)
const updateUser = async (req, res) => {
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
    const { firstName, lastName, phone, bio, location, preferences } = req.body;

    // Check if user is authorized to update this user
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (preferences) updateData.preferences = preferences;

    await user.update(updateData);

    // Remove sensitive fields from response
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      preferences: user.preferences,
      role: user.role,
      points: user.points,
      ecoImpact: user.ecoImpact,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active items or swaps
    const activeItems = await Item.count({ where: { userId: id, status: 'available' } });
    const activeSwaps = await Swap.count({ 
      where: { 
        $or: [{ fromUserId: id }, { toUserId: id }],
        status: 'in_progress'
      } 
    });

    if (activeItems > 0 || activeSwaps > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active items or swaps'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify user (Admin only)
const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isVerified: true });

    res.json({
      success: true,
      message: 'User verified successfully',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Deactivate user (Admin only)
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isActive: false });

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: false
      }
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Activate user (Admin only)
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isActive: true });

    res.json({
      success: true,
      message: 'User activated successfully',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authorized to view this user's stats
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s statistics'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get comprehensive user statistics
    const [
      totalItems,
      activeItems,
      totalSwaps,
      completedSwaps,
      totalPoints,
      totalEcoImpact,
      totalBadges,
      totalRedemptions,
      activeRedemptions,
      unreadNotifications
    ] = await Promise.all([
      Item.count({ where: { userId: id } }),
      Item.count({ where: { userId: id, status: 'available' } }),
      Swap.count({ 
        where: { 
          $or: [{ fromUserId: id }, { toUserId: id }]
        } 
      }),
      Swap.count({ 
        where: { 
          $or: [{ fromUserId: id }, { toUserId: id }],
          status: 'completed'
        } 
      }),
      user.points,
      user.ecoImpact,
      Badge.count({ where: { userId: id } }),
      Redemption.count({ where: { userId: id } }),
      Redemption.count({ where: { userId: id, status: 'active' } }),
      Notification.count({ where: { userId: id, isRead: false } })
    ]);

    const stats = {
      totalItems,
      activeItems,
      totalSwaps,
      completedSwaps,
      totalPoints,
      totalEcoImpact,
      totalBadges,
      totalRedemptions,
      activeRedemptions,
      unreadNotifications
    };

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 20,
      sortBy = 'firstName',
      sortOrder = 'ASC'
    } = req.query;

    let whereClause = {};

    if (search) {
      whereClause.$or = [
        { firstName: { $iLike: `%${search}%` } },
        { lastName: { $iLike: `%${search}%` } },
        { email: { $iLike: `%${search}%` } }
      ];
    }

    const result = await paginate(User, {
      where: whereClause,
      attributes: { exclude: ['password', 'resetPasswordOtp', 'resetPasswordOtpExpiry'] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'points',
      sortOrder = 'DESC'
    } = req.query;

    const result = await paginate(User, {
      attributes: { exclude: ['password', 'resetPasswordOtp', 'resetPasswordOtpExpiry'] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyUser,
  deactivateUser,
  activateUser,
  getUserStats,
  searchUsers,
  getLeaderboard
}; 