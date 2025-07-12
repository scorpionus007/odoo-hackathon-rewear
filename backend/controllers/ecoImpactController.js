const { EcoImpact, User, Item, Swap } = require('../models');
const { paginate } = require('../utils/pagination');

// Get all eco impact records (Admin only)
const getAllEcoImpact = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = {};

    // Filter by date range
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.$gte = new Date(startDate);
      if (endDate) whereClause.createdAt.$lte = new Date(endDate);
    }

    const result = await paginate(EcoImpact, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'title', 'category', 'condition', 'material']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate summary statistics
    const summary = await EcoImpact.findOne({
      where: whereClause,
      attributes: [
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'totalPoints'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('co2SavedKg')), 'totalCo2Saved']
      ]
    });

    result.summary = {
      totalPoints: parseInt(summary?.dataValues?.totalPoints) || 0,
      totalWaterSaved: parseFloat(summary?.dataValues?.totalWaterSaved) || 0,
      totalCo2Saved: parseFloat(summary?.dataValues?.totalCo2Saved) || 0
    };

    res.json({
      success: true,
      message: 'Eco impact records retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting all eco impact:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's eco impact records (for routes)
const getUserEcoImpact = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Check if user is requesting their own data or is admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s eco impact data'
      });
    }

    let whereClause = { userId };

    // Filter by date range
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.$gte = new Date(startDate);
      if (endDate) whereClause.createdAt.$lte = new Date(endDate);
    }

    const result = await paginate(EcoImpact, {
      where: whereClause,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'title', 'category', 'condition', 'material']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate user summary statistics
    const summary = await EcoImpact.findOne({
      where: { userId },
      attributes: [
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'totalPoints'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('co2SavedKg')), 'totalCo2Saved']
      ]
    });

    result.summary = {
      totalPoints: parseInt(summary?.dataValues?.totalPoints) || 0,
      totalWaterSaved: parseFloat(summary?.dataValues?.totalWaterSaved) || 0,
      totalCo2Saved: parseFloat(summary?.dataValues?.totalCo2Saved) || 0
    };

    res.json({
      success: true,
      message: 'User eco impact records retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting user eco impact:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get eco impact leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;

    let whereClause = {};
    
    if (period === 'month') {
      whereClause.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      };
    } else if (period === 'week') {
      whereClause.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
      };
    } else if (period === 'year') {
      whereClause.createdAt = {
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      };
    }

    // Get top users by eco impact
    const topUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact'],
      order: [['ecoImpact', 'DESC']],
      limit: parseInt(limit)
    });

    // Get detailed stats for each user
    const leaderboardData = await Promise.all(
      topUsers.map(async (user, index) => {
        const userStats = await EcoImpact.findOne({
          where: { userId: user.id, ...whereClause },
          attributes: [
            [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'totalPoints'],
            [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
            [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('co2SavedKg')), 'totalCo2Saved'],
            [EcoImpact.sequelize.fn('COUNT', EcoImpact.sequelize.col('id')), 'itemsSwapped']
          ]
        });

        return {
          rank: index + 1,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            points: user.points,
            ecoImpact: user.ecoImpact
          },
          totalPoints: parseInt(userStats?.dataValues?.totalPoints) || 0,
          totalWaterSaved: parseFloat(userStats?.dataValues?.totalWaterSaved) || 0,
          totalCo2Saved: parseFloat(userStats?.dataValues?.totalCo2Saved) || 0,
          itemsSwapped: parseInt(userStats?.dataValues?.itemsSwapped) || 0
        };
      })
    );

    res.json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: leaderboardData
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

// Get eco impact statistics
const getStats = async (req, res) => {
  try {
    // Get overall statistics
    const overallStats = await EcoImpact.findOne({
      attributes: [
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'totalPoints'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('co2SavedKg')), 'totalCo2Saved'],
        [EcoImpact.sequelize.fn('COUNT', EcoImpact.sequelize.col('id')), 'totalItemsSwapped']
      ]
    });

    // Get user count
    const totalUsers = await User.count();

    // Get total items swapped
    const totalItemsSwapped = await Swap.count({ where: { status: 'completed' } });

    // Get average points per user
    const averagePointsPerUser = totalUsers > 0 ? 
      (parseInt(overallStats?.dataValues?.totalPoints) || 0) / totalUsers : 0;

    // Get top category
    const topCategory = await EcoImpact.findAll({
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['category']
        }
      ],
      attributes: [
        [EcoImpact.sequelize.fn('COUNT', EcoImpact.sequelize.col('id')), 'count']
      ],
      group: ['item.category'],
      order: [[EcoImpact.sequelize.fn('COUNT', EcoImpact.sequelize.col('id')), 'DESC']],
      limit: 1
    });

    // Get monthly trend (last 12 months)
    const monthlyTrend = await EcoImpact.findAll({
      attributes: [
        [EcoImpact.sequelize.fn('DATE_TRUNC', 'month', EcoImpact.sequelize.col('createdAt')), 'month'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'points'],
        [EcoImpact.sequelize.fn('COUNT', EcoImpact.sequelize.col('id')), 'swaps']
      ],
      where: {
        createdAt: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        }
      },
      group: [EcoImpact.sequelize.fn('DATE_TRUNC', 'month', EcoImpact.sequelize.col('createdAt'))],
      order: [[EcoImpact.sequelize.fn('DATE_TRUNC', 'month', EcoImpact.sequelize.col('createdAt')), 'ASC']]
    });

    const stats = {
      totalUsers,
      totalItemsSwapped,
      totalPoints: parseInt(overallStats?.dataValues?.totalPoints) || 0,
      totalWaterSaved: parseFloat(overallStats?.dataValues?.totalWaterSaved) || 0,
      totalCo2Saved: parseFloat(overallStats?.dataValues?.totalCo2Saved) || 0,
      averagePointsPerUser: Math.round(averagePointsPerUser * 100) / 100,
      topCategory: topCategory[0]?.dataValues?.category || 'N/A',
      monthlyTrend: monthlyTrend.map(item => ({
        month: item.dataValues.month,
        points: parseInt(item.dataValues.points) || 0,
        swaps: parseInt(item.dataValues.swaps) || 0
      }))
    };

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's eco impact statistics
const getUserEcoImpactStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own stats or is admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s eco impact'
      });
    }

    const stats = await EcoImpact.getUserStats(userId);
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Eco impact statistics retrieved successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          points: user.points,
          ecoImpact: user.ecoImpact
        },
        stats
      }
    });
  } catch (error) {
    console.error('Error getting user eco impact:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's eco impact history
const getUserEcoImpactHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user is requesting their own history or is admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s eco impact history'
      });
    }

    const offset = (page - 1) * limit;
    const history = await EcoImpact.getUserHistory(userId, parseInt(limit), offset);

    // Get total count for pagination
    const totalCount = await EcoImpact.count({ where: { userId } });

    const result = {
      history,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    };

    res.json({
      success: true,
      message: 'Eco impact history retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting user eco impact history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get global eco impact statistics
const getGlobalEcoImpact = async (req, res) => {
  try {
    const stats = await EcoImpact.getGlobalStats();

    // Get top eco contributors
    const topContributors = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact'],
      order: [['ecoImpact', 'DESC']],
      limit: 10
    });

    // Get recent eco impacts
    const recentImpacts = await EcoImpact.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'title', 'category']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      message: 'Global eco impact statistics retrieved successfully',
      data: {
        stats,
        topContributors,
        recentImpacts
      }
    });
  } catch (error) {
    console.error('Error getting global eco impact:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get eco impact by category
const getEcoImpactByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const impacts = await EcoImpact.findAll({
      include: [
        {
          model: Item,
          as: 'item',
          where: { category },
          attributes: ['id', 'title', 'category', 'condition', 'material']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Get total count for pagination
    const totalCount = await EcoImpact.count({
      include: [
        {
          model: Item,
          as: 'item',
          where: { category },
          attributes: []
        }
      ]
    });

    // Calculate category-specific stats
    const categoryStats = await EcoImpact.findOne({
      include: [
        {
          model: Item,
          as: 'item',
          where: { category },
          attributes: []
        }
      ],
      attributes: [
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'totalPoints'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('co2SavedKg')), 'totalCO2Saved'],
        [EcoImpact.sequelize.fn('COUNT', EcoImpact.sequelize.col('EcoImpact.id')), 'totalItems']
      ]
    });

    const result = {
      impacts,
      categoryStats: {
        totalPoints: parseInt(categoryStats?.dataValues?.totalPoints) || 0,
        totalWaterSaved: parseFloat(categoryStats?.dataValues?.totalWaterSaved) || 0,
        totalCO2Saved: parseFloat(categoryStats?.dataValues?.totalCO2Saved) || 0,
        totalItems: parseInt(categoryStats?.dataValues?.totalItems) || 0
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    };

    res.json({
      success: true,
      message: `Eco impact for ${category} category retrieved successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error getting eco impact by category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get eco impact leaderboard (original method)
const getEcoImpactLeaderboard = async (req, res) => {
  try {
    const { period = 'all' } = req.query; // all, month, week

    let whereClause = {};
    
    if (period === 'month') {
      whereClause.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      };
    } else if (period === 'week') {
      whereClause.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
      };
    }

    // Get top users by eco impact
    const topUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact'],
      order: [['ecoImpact', 'DESC']],
      limit: 20
    });

    // Get top recent contributors
    const recentTopContributors = await EcoImpact.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      attributes: [
        'userId',
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'totalPoints'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('co2SavedKg')), 'totalCO2Saved']
      ],
      group: ['userId', 'user.id', 'user.firstName', 'user.lastName', 'user.email'],
      order: [[EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      message: 'Eco impact leaderboard retrieved successfully',
      data: {
        period,
        topUsers,
        recentTopContributors
      }
    });
  } catch (error) {
    console.error('Error getting eco impact leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get eco impact analytics
const getEcoImpactAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get daily eco impact data
    const dailyData = await EcoImpact.findAll({
      where: {
        createdAt: {
          $gte: startDate
        }
      },
      attributes: [
        [EcoImpact.sequelize.fn('DATE', EcoImpact.sequelize.col('createdAt')), 'date'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'points'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('waterSavedLiters')), 'waterSaved'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('co2SavedKg')), 'co2Saved'],
        [EcoImpact.sequelize.fn('COUNT', EcoImpact.sequelize.col('id')), 'items']
      ],
      group: [EcoImpact.sequelize.fn('DATE', EcoImpact.sequelize.col('createdAt'))],
      order: [[EcoImpact.sequelize.fn('DATE', EcoImpact.sequelize.col('createdAt')), 'ASC']]
    });

    // Get category breakdown
    const categoryBreakdown = await EcoImpact.findAll({
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['category']
        }
      ],
      where: {
        createdAt: {
          $gte: startDate
        }
      },
      attributes: [
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'totalPoints'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
        [EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('co2SavedKg')), 'totalCO2Saved'],
        [EcoImpact.sequelize.fn('COUNT', EcoImpact.sequelize.col('id')), 'totalItems']
      ],
      group: ['item.category'],
      order: [[EcoImpact.sequelize.fn('SUM', EcoImpact.sequelize.col('pointsAwarded')), 'DESC']]
    });

    res.json({
      success: true,
      message: 'Eco impact analytics retrieved successfully',
      data: {
        period: `${days} days`,
        dailyData,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Error getting eco impact analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllEcoImpact,
  getUserEcoImpact,
  getLeaderboard,
  getStats,
  getUserEcoImpactStats,
  getUserEcoImpactHistory,
  getGlobalEcoImpact,
  getEcoImpactByCategory,
  getEcoImpactLeaderboard,
  getEcoImpactAnalytics
}; 