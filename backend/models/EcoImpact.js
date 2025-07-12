const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EcoImpact = sequelize.define('EcoImpact', {
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
  swapId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'swaps',
      key: 'id'
    }
  },
  itemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  pointsAwarded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  waterSavedLiters: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  co2SavedKg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'eco_impact'
});

// Class methods
EcoImpact.getUserStats = async function(userId) {
  const stats = await this.findOne({
    where: { userId },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('pointsAwarded')), 'totalPoints'],
      [sequelize.fn('SUM', sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
      [sequelize.fn('SUM', sequelize.col('co2SavedKg')), 'totalCO2Saved'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalItems']
    ]
  });

  return {
    totalPoints: parseInt(stats?.dataValues?.totalPoints) || 0,
    totalWaterSaved: parseFloat(stats?.dataValues?.totalWaterSaved) || 0,
    totalCO2Saved: parseFloat(stats?.dataValues?.totalCO2Saved) || 0,
    totalItems: parseInt(stats?.dataValues?.totalItems) || 0
  };
};

EcoImpact.getUserHistory = function(userId, limit = 10, offset = 0) {
  return this.findAll({
    where: { userId },
    include: [
      {
        model: sequelize.models.Item,
        as: 'item',
        attributes: ['id', 'title', 'category', 'condition', 'material']
      },
      {
        model: sequelize.models.Swap,
        as: 'swap',
        attributes: ['id', 'status', 'completedAt']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

EcoImpact.getGlobalStats = async function() {
  const stats = await this.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('pointsAwarded')), 'totalPoints'],
      [sequelize.fn('SUM', sequelize.col('waterSavedLiters')), 'totalWaterSaved'],
      [sequelize.fn('SUM', sequelize.col('co2SavedKg')), 'totalCO2Saved'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalItems'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'totalUsers']
    ]
  });

  return {
    totalPoints: parseInt(stats?.dataValues?.totalPoints) || 0,
    totalWaterSaved: parseFloat(stats?.dataValues?.totalWaterSaved) || 0,
    totalCO2Saved: parseFloat(stats?.dataValues?.totalCO2Saved) || 0,
    totalItems: parseInt(stats?.dataValues?.totalItems) || 0,
    totalUsers: parseInt(stats?.dataValues?.totalUsers) || 0
  };
};

module.exports = EcoImpact; 