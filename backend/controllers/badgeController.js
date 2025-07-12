const { Badge, User } = require('../models');
const { paginate } = require('../utils/pagination');

// Get all badges (Admin only)
const getAllBadges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      badgeType,
      sortBy = 'awardedAt',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = {};

    // Filter by badge type
    if (badgeType) {
      whereClause.badgeType = badgeType;
    }

    const result = await paginate(Badge, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate summary statistics
    const summary = await Badge.findOne({
      where: whereClause,
      attributes: [
        [Badge.sequelize.fn('COUNT', Badge.sequelize.col('id')), 'totalBadges'],
        [Badge.sequelize.fn('COUNT', Badge.sequelize.fn('DISTINCT', Badge.sequelize.col('badgeType'))), 'uniqueBadgeTypes']
      ]
    });

    result.summary = {
      totalBadges: parseInt(summary?.dataValues?.totalBadges) || 0,
      uniqueBadgeTypes: parseInt(summary?.dataValues?.uniqueBadgeTypes) || 0
    };

    res.json({
      success: true,
      message: 'Badges retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting all badges:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's badges
const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      badgeType,
      sortBy = 'awardedAt',
      sortOrder = 'DESC'
    } = req.query;

    // Check if user is requesting their own badges or is admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s badges'
      });
    }

    let whereClause = { userId };

    // Filter by badge type
    if (badgeType) {
      whereClause.badgeType = badgeType;
    }

    const result = await paginate(Badge, {
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate user summary statistics
    const summary = await Badge.findOne({
      where: { userId },
      attributes: [
        [Badge.sequelize.fn('COUNT', Badge.sequelize.col('id')), 'totalBadges'],
        [Badge.sequelize.fn('COUNT', Badge.sequelize.fn('DISTINCT', Badge.sequelize.col('badgeType'))), 'uniqueBadgeTypes']
      ]
    });

    result.summary = {
      totalBadges: parseInt(summary?.dataValues?.totalBadges) || 0,
      uniqueBadgeTypes: parseInt(summary?.dataValues?.uniqueBadgeTypes) || 0
    };

    res.json({
      success: true,
      message: 'User badges retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get badge statistics
const getBadgeStats = async (req, res) => {
  try {
    const stats = await Badge.getBadgeStats();

    // Get most awarded badges
    const mostAwardedBadges = await Badge.findAll({
      attributes: [
        'badgeType',
        [Badge.sequelize.fn('COUNT', Badge.sequelize.col('id')), 'count']
      ],
      group: ['badgeType'],
      order: [[Badge.sequelize.fn('COUNT', Badge.sequelize.col('id')), 'DESC']],
      limit: 10
    });

    // Get recent badge awards
    const recentBadges = await Badge.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['awardedAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      message: 'Badge statistics retrieved successfully',
      data: {
        stats,
        mostAwardedBadges,
        recentBadges
      }
    });
  } catch (error) {
    console.error('Error getting badge stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all available badge types
const getBadgeTypes = async (req, res) => {
  try {
    const badgeTypes = [
      {
        type: 'Eco Hero',
        description: 'Complete your first swap',
        icon: '🌱',
        requirement: '1 swap completed'
      },
      {
        type: 'Super Swapper',
        description: 'Complete 10 swaps',
        icon: '🔄',
        requirement: '10 swaps completed'
      },
      {
        type: 'Eco Champion',
        description: 'Complete 50 swaps',
        icon: '🏆',
        requirement: '50 swaps completed'
      },
      {
        type: 'Water Saver',
        description: 'Save 10,000 liters of water',
        icon: '💧',
        requirement: '10,000L water saved'
      },
      {
        type: 'Carbon Crusher',
        description: 'Save 100kg of CO2',
        icon: '🌍',
        requirement: '100kg CO2 saved'
      },
      {
        type: 'Point Collector',
        description: 'Earn 1,000 eco points',
        icon: '⭐',
        requirement: '1,000 points earned'
      },
      {
        type: 'Point Master',
        description: 'Earn 10,000 eco points',
        icon: '👑',
        requirement: '10,000 points earned'
      },
      {
        type: 'Community Builder',
        description: 'Help 25 other users',
        icon: '🤝',
        requirement: '25 helpful swaps'
      },
      {
        type: 'First Timer',
        description: 'List your first item',
        icon: '🎯',
        requirement: '1 item listed'
      },
      {
        type: 'Active Lister',
        description: 'List 20 items',
        icon: '📦',
        requirement: '20 items listed'
      }
    ];

    res.json({
      success: true,
      message: 'Badge types retrieved successfully',
      data: badgeTypes
    });
  } catch (error) {
    console.error('Error getting badge types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Check and award badges for user
const checkUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own badges or is admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check badges for this user'
      });
    }

    // Check and award badges
    await Badge.checkAndAwardBadges(userId);

    // Get updated badges
    const badges = await Badge.getUserBadges(userId);

    res.json({
      success: true,
      message: 'Badge check completed successfully',
      data: badges
    });
  } catch (error) {
    console.error('Error checking user badges:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get badge leaderboard
const getBadgeLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get users with most badges
    const topUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact'],
      include: [
        {
          model: Badge,
          as: 'badges',
          attributes: []
        }
      ],
      group: ['User.id'],
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact',
        [User.sequelize.fn('COUNT', User.sequelize.col('badges.id')), 'badgeCount']
      ],
      order: [[User.sequelize.fn('COUNT', User.sequelize.col('badges.id')), 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Badge leaderboard retrieved successfully',
      data: topUsers
    });
  } catch (error) {
    console.error('Error getting badge leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get recent badge awards
const getRecentBadgeAwards = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentBadges = await Badge.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['awardedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Recent badge awards retrieved successfully',
      data: recentBadges
    });
  } catch (error) {
    console.error('Error getting recent badge awards:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's progress towards badges
const getUserBadgeProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own progress or is admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s badge progress'
      });
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Badge,
          as: 'badges',
          attributes: ['badgeType', 'awardedAt']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's current stats
    const userStats = {
      totalSwaps: 0, // This would need to be calculated from Swap model
      totalItems: 0, // This would need to be calculated from Item model
      totalWaterSaved: 0, // This would need to be calculated from EcoImpact model
      totalCO2Saved: 0, // This would need to be calculated from EcoImpact model
      points: user.points,
      helpfulSwaps: 0 // This would need to be calculated
    };

    // Define badge requirements and check progress
    const badgeProgress = [
      {
        type: 'Eco Hero',
        description: 'Complete your first swap',
        icon: '🌱',
        requirement: 1,
        current: userStats.totalSwaps,
        achieved: user.badges.some(badge => badge.badgeType === 'Eco Hero'),
        progress: Math.min((userStats.totalSwaps / 1) * 100, 100)
      },
      {
        type: 'Super Swapper',
        description: 'Complete 10 swaps',
        icon: '🔄',
        requirement: 10,
        current: userStats.totalSwaps,
        achieved: user.badges.some(badge => badge.badgeType === 'Super Swapper'),
        progress: Math.min((userStats.totalSwaps / 10) * 100, 100)
      },
      {
        type: 'Eco Champion',
        description: 'Complete 50 swaps',
        icon: '🏆',
        requirement: 50,
        current: userStats.totalSwaps,
        achieved: user.badges.some(badge => badge.badgeType === 'Eco Champion'),
        progress: Math.min((userStats.totalSwaps / 50) * 100, 100)
      },
      {
        type: 'Water Saver',
        description: 'Save 10,000 liters of water',
        icon: '💧',
        requirement: 10000,
        current: userStats.totalWaterSaved,
        achieved: user.badges.some(badge => badge.badgeType === 'Water Saver'),
        progress: Math.min((userStats.totalWaterSaved / 10000) * 100, 100)
      },
      {
        type: 'Carbon Crusher',
        description: 'Save 100kg of CO2',
        icon: '🌍',
        requirement: 100,
        current: userStats.totalCO2Saved,
        achieved: user.badges.some(badge => badge.badgeType === 'Carbon Crusher'),
        progress: Math.min((userStats.totalCO2Saved / 100) * 100, 100)
      },
      {
        type: 'Point Collector',
        description: 'Earn 1,000 eco points',
        icon: '⭐',
        requirement: 1000,
        current: userStats.points,
        achieved: user.badges.some(badge => badge.badgeType === 'Point Collector'),
        progress: Math.min((userStats.points / 1000) * 100, 100)
      },
      {
        type: 'Point Master',
        description: 'Earn 10,000 eco points',
        icon: '👑',
        requirement: 10000,
        current: userStats.points,
        achieved: user.badges.some(badge => badge.badgeType === 'Point Master'),
        progress: Math.min((userStats.points / 10000) * 100, 100)
      },
      {
        type: 'Community Builder',
        description: 'Help 25 other users',
        icon: '🤝',
        requirement: 25,
        current: userStats.helpfulSwaps,
        achieved: user.badges.some(badge => badge.badgeType === 'Community Builder'),
        progress: Math.min((userStats.helpfulSwaps / 25) * 100, 100)
      },
      {
        type: 'First Timer',
        description: 'List your first item',
        icon: '🎯',
        requirement: 1,
        current: userStats.totalItems,
        achieved: user.badges.some(badge => badge.badgeType === 'First Timer'),
        progress: Math.min((userStats.totalItems / 1) * 100, 100)
      },
      {
        type: 'Active Lister',
        description: 'List 20 items',
        icon: '📦',
        requirement: 20,
        current: userStats.totalItems,
        achieved: user.badges.some(badge => badge.badgeType === 'Active Lister'),
        progress: Math.min((userStats.totalItems / 20) * 100, 100)
      }
    ];

    res.json({
      success: true,
      message: 'Badge progress retrieved successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          points: user.points,
          ecoImpact: user.ecoImpact
        },
        stats: userStats,
        badgeProgress
      }
    });
  } catch (error) {
    console.error('Error getting user badge progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Award badge to user (Admin only)
const awardBadge = async (req, res) => {
  try {
    const { userId, badgeType, reason } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has this badge
    const existingBadge = await Badge.findOne({
      where: { userId, badgeType }
    });

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    // Create the badge
    const badge = await Badge.create({
      userId,
      badgeType,
      reason,
      awardedAt: new Date(),
      awardedBy: req.user.userId
    });

    // Update user's badge count
    await user.update({
      badgeCount: user.badgeCount + 1
    });

    res.status(201).json({
      success: true,
      message: 'Badge awarded successfully',
      data: badge
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Check user's badge eligibility
const checkBadgeEligibility = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own eligibility or is admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check this user\'s badge eligibility'
      });
    }

    // Get user's current stats
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's existing badges
    const existingBadges = await Badge.findAll({
      where: { userId },
      attributes: ['badgeType']
    });

    const existingBadgeTypes = existingBadges.map(badge => badge.badgeType);

    // Define badge criteria and check eligibility
    const badgeCriteria = [
      {
        type: 'Eco Hero',
        criteria: { swaps: 1 },
        description: 'Complete your first swap'
      },
      {
        type: 'Super Swapper',
        criteria: { swaps: 10 },
        description: 'Complete 10 swaps'
      },
      {
        type: 'Eco Champion',
        criteria: { swaps: 50 },
        description: 'Complete 50 swaps'
      },
      {
        type: 'Water Saver',
        criteria: { waterSaved: 10000 },
        description: 'Save 10,000 liters of water'
      },
      {
        type: 'Carbon Crusher',
        criteria: { co2Saved: 100 },
        description: 'Save 100kg of CO2'
      },
      {
        type: 'Point Collector',
        criteria: { points: 1000 },
        description: 'Earn 1,000 eco points'
      },
      {
        type: 'Point Master',
        criteria: { points: 10000 },
        description: 'Earn 10,000 eco points'
      },
      {
        type: 'Community Builder',
        criteria: { helpfulSwaps: 25 },
        description: 'Help 25 other users'
      },
      {
        type: 'First Timer',
        criteria: { items: 1 },
        description: 'List your first item'
      },
      {
        type: 'Active Lister',
        criteria: { items: 20 },
        description: 'List 20 items'
      }
    ];

    // Mock user stats (in real implementation, these would be calculated from actual data)
    const userStats = {
      swaps: 0, // Would be calculated from Swap model
      waterSaved: 0, // Would be calculated from EcoImpact model
      co2Saved: 0, // Would be calculated from EcoImpact model
      points: user.points,
      helpfulSwaps: 0, // Would be calculated
      items: 0 // Would be calculated from Item model
    };

    const eligibleBadges = badgeCriteria
      .filter(badge => !existingBadgeTypes.includes(badge.type))
      .map(badge => {
        const criteria = badge.criteria;
        const progress = {};

        Object.keys(criteria).forEach(key => {
          const current = userStats[key] || 0;
          const required = criteria[key];
          progress[key] = {
            current,
            required,
            percentage: Math.min((current / required) * 100, 100)
          };
        });

        const isEligible = Object.keys(criteria).every(key => 
          (userStats[key] || 0) >= criteria[key]
        );

        return {
          badgeType: badge.type,
          description: badge.description,
          criteria,
          progress,
          isEligible
        };
      });

    res.json({
      success: true,
      message: 'Badge eligibility checked successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          points: user.points,
          ecoImpact: user.ecoImpact
        },
        stats: userStats,
        eligibleBadges
      }
    });
  } catch (error) {
    console.error('Error checking badge eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllBadges,
  getUserBadges,
  getBadgeStats,
  getBadgeTypes,
  checkUserBadges,
  getBadgeLeaderboard,
  getRecentBadgeAwards,
  getUserBadgeProgress,
  awardBadge,
  checkBadgeEligibility
}; 