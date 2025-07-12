const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Redemption = sequelize.define('Redemption', {
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
  rewardId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rewards_catalog',
      key: 'id'
    }
  },
  pointsSpent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  redeemedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'used', 'expired'),
    defaultValue: 'active'
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'redemptions'
});

// Instance methods
Redemption.prototype.use = async function() {
  if (this.status !== 'active') {
    throw new Error('Redemption is not active');
  }
  
  this.status = 'used';
  this.usedAt = new Date();
  await this.save();
  
  return this;
};

Redemption.prototype.expire = async function() {
  this.status = 'expired';
  await this.save();
  return this;
};

// Class methods
Redemption.getUserRedemptions = function(userId, status = null) {
  const whereClause = { userId };
  if (status) whereClause.status = status;
  
  return this.findAll({
    where: whereClause,
    include: [
      {
        model: sequelize.models.RewardsCatalog,
        as: 'reward',
        attributes: ['id', 'title', 'brand', 'description', 'couponCode', 'discountPercentage', 'discountAmount']
      }
    ],
    order: [['redeemedAt', 'DESC']]
  });
};

Redemption.getActiveRedemptions = function(userId) {
  return this.findAll({
    where: {
      userId,
      status: 'active'
    },
    include: [
      {
        model: sequelize.models.RewardsCatalog,
        as: 'reward',
        attributes: ['id', 'title', 'brand', 'description', 'couponCode', 'discountPercentage', 'discountAmount', 'expiryDate']
      }
    ],
    order: [['redeemedAt', 'DESC']]
  });
};

Redemption.getRedemptionStats = async function(userId) {
  const stats = await this.findOne({
    where: { userId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalRedemptions'],
      [sequelize.fn('SUM', sequelize.col('pointsSpent')), 'totalPointsSpent'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'active' THEN 1 END")), 'activeRedemptions'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'used' THEN 1 END")), 'usedRedemptions']
    ]
  });

  return {
    totalRedemptions: parseInt(stats?.dataValues?.totalRedemptions) || 0,
    totalPointsSpent: parseInt(stats?.dataValues?.totalPointsSpent) || 0,
    activeRedemptions: parseInt(stats?.dataValues?.activeRedemptions) || 0,
    usedRedemptions: parseInt(stats?.dataValues?.usedRedemptions) || 0
  };
};

Redemption.getGlobalStats = async function() {
  const stats = await this.findOne({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalRedemptions'],
      [sequelize.fn('SUM', sequelize.col('pointsSpent')), 'totalPointsSpent'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUsers'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('rewardId'))), 'uniqueRewards']
    ]
  });

  return {
    totalRedemptions: parseInt(stats?.dataValues?.totalRedemptions) || 0,
    totalPointsSpent: parseInt(stats?.dataValues?.totalPointsSpent) || 0,
    uniqueUsers: parseInt(stats?.dataValues?.uniqueUsers) || 0,
    uniqueRewards: parseInt(stats?.dataValues?.uniqueRewards) || 0
  };
};

module.exports = Redemption; 