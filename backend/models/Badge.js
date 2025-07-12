const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  badgeType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  awardedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'badges',
  hooks: {
    afterCreate: async (badge) => {
      // Create notification for badge award
      await sequelize.models.Notification.create({
        userId: badge.userId,
        message: `Congratulations! You've earned the "${badge.badgeType}" badge!`,
        type: 'badge_awarded',
        relatedId: badge.id
      });
    }
  }
});

// Badge types and their criteria
const BADGE_CRITERIA = {
  'Eco Hero': {
    description: 'Complete your first swap',
    icon: '🌱',
    condition: (user) => user.totalSwaps >= 1
  },
  'Super Swapper': {
    description: 'Complete 10 swaps',
    icon: '🔄',
    condition: (user) => user.totalSwaps >= 10
  },
  'Eco Champion': {
    description: 'Complete 50 swaps',
    icon: '🏆',
    condition: (user) => user.totalSwaps >= 50
  },
  'Water Saver': {
    description: 'Save 10,000 liters of water',
    icon: '💧',
    condition: (user) => user.totalWaterSaved >= 10000
  },
  'Carbon Crusher': {
    description: 'Save 100kg of CO2',
    icon: '🌍',
    condition: (user) => user.totalCO2Saved >= 100
  },
  'Point Collector': {
    description: 'Earn 1,000 eco points',
    icon: '⭐',
    condition: (user) => user.points >= 1000
  },
  'Point Master': {
    description: 'Earn 10,000 eco points',
    icon: '👑',
    condition: (user) => user.points >= 10000
  },
  'Community Builder': {
    description: 'Help 25 other users',
    icon: '🤝',
    condition: (user) => user.helpfulSwaps >= 25
  },
  'First Timer': {
    description: 'List your first item',
    icon: '🎯',
    condition: (user) => user.totalItems >= 1
  },
  'Active Lister': {
    description: 'List 20 items',
    icon: '📦',
    condition: (user) => user.totalItems >= 20
  }
};

// Class methods
Badge.checkAndAwardBadges = async function(userId) {
  try {
    const user = await sequelize.models.User.findByPk(userId, {
      include: [
        {
          model: sequelize.models.Swap,
          as: 'swaps',
          where: { status: 'completed' },
          required: false
        },
        {
          model: sequelize.models.Item,
          as: 'items',
          required: false
        },
        {
          model: sequelize.models.EcoImpact,
          as: 'ecoImpacts',
          required: false
        }
      ]
    });

    if (!user) return;

    // Calculate user stats
    const totalSwaps = user.swaps?.length || 0;
    const totalItems = user.items?.length || 0;
    const totalWaterSaved = user.ecoImpacts?.reduce((sum, impact) => sum + parseFloat(impact.waterSavedLiters), 0) || 0;
    const totalCO2Saved = user.ecoImpacts?.reduce((sum, impact) => sum + parseFloat(impact.co2SavedKg), 0) || 0;
    const helpfulSwaps = totalSwaps; // Simplified for now

    const userStats = {
      totalSwaps,
      totalItems,
      totalWaterSaved,
      totalCO2Saved,
      points: user.points,
      helpfulSwaps
    };

    // Get existing badges
    const existingBadges = await this.findAll({
      where: { userId },
      attributes: ['badgeType']
    });

    const existingBadgeTypes = existingBadges.map(badge => badge.badgeType);

    // Check for new badges
    for (const [badgeType, criteria] of Object.entries(BADGE_CRITERIA)) {
      if (!existingBadgeTypes.includes(badgeType) && criteria.condition(userStats)) {
        await this.create({
          userId,
          badgeType,
          description: criteria.description,
          icon: criteria.icon
        });
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
};

Badge.getUserBadges = function(userId) {
  return this.findAll({
    where: { userId },
    order: [['awardedAt', 'DESC']]
  });
};

Badge.getBadgeStats = async function() {
  const stats = await this.findOne({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalBadges'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'usersWithBadges']
    ]
  });

  return {
    totalBadges: parseInt(stats?.dataValues?.totalBadges) || 0,
    usersWithBadges: parseInt(stats?.dataValues?.usersWithBadges) || 0
  };
};

module.exports = Badge; 