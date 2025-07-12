const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Swap = sequelize.define('Swap', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  offerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'swap_offers',
      key: 'id'
    }
  },
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  toUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fromItemIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: false
  },
  toItemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('completed', 'cancelled', 'in_progress'),
    defaultValue: 'in_progress'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'swaps',
  hooks: {
    afterCreate: async (swap) => {
      // Award eco points to both users
      await swap.awardEcoPoints();
    },
    afterUpdate: async (swap) => {
      if (swap.changed('status') && swap.status === 'completed') {
        swap.completedAt = new Date();
        await swap.save();
        
        // Create notifications for both users
        await sequelize.models.Notification.create({
          userId: swap.fromUserId,
          message: 'Your swap has been completed successfully!',
          type: 'swap_completed',
          relatedId: swap.id
        });
        
        await sequelize.models.Notification.create({
          userId: swap.toUserId,
          message: 'Your swap has been completed successfully!',
          type: 'swap_completed',
          relatedId: swap.id
        });
      }
    }
  }
});

// Instance methods
Swap.prototype.awardEcoPoints = async function() {
  try {
    // Get all items involved in the swap
    const fromItems = await sequelize.models.Item.findAll({
      where: { id: this.fromItemIds }
    });
    
    const toItem = await sequelize.models.Item.findByPk(this.toItemId);
    
    // Calculate total eco points for fromUser's items
    const fromUserPoints = fromItems.reduce((total, item) => total + item.ecoPointsValue, 0);
    
    // Calculate eco points for toUser's item
    const toUserPoints = toItem.ecoPointsValue;
    
    // Award points to both users
    await sequelize.models.User.increment('points', {
      by: fromUserPoints,
      where: { id: this.fromUserId }
    });
    
    await sequelize.models.User.increment('points', {
      by: toUserPoints,
      where: { id: this.toUserId }
    });
    
    // Create eco impact records
    for (const item of fromItems) {
      await sequelize.models.EcoImpact.create({
        userId: this.fromUserId,
        swapId: this.id,
        itemId: item.id,
        pointsAwarded: item.ecoPointsValue,
        waterSavedLiters: calculateWaterSaved(item.category),
        co2SavedKg: calculateCO2Saved(item.category)
      });
    }
    
    await sequelize.models.EcoImpact.create({
      userId: this.toUserId,
      swapId: this.id,
      itemId: toItem.id,
      pointsAwarded: toUserPoints,
      waterSavedLiters: calculateWaterSaved(toItem.category),
      co2SavedKg: calculateCO2Saved(toItem.category)
    });
    
    // Update user eco impact totals
    await sequelize.models.User.increment('ecoImpact', {
      by: fromUserPoints,
      where: { id: this.fromUserId }
    });
    
    await sequelize.models.User.increment('ecoImpact', {
      by: toUserPoints,
      where: { id: this.toUserId }
    });
    
  } catch (error) {
    console.error('Error awarding eco points:', error);
  }
};

Swap.prototype.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
  return this;
};

Swap.prototype.cancel = async function() {
  this.status = 'cancelled';
  await this.save();
  
  // Update item statuses back to available
  await sequelize.models.Item.update(
    { status: 'available' },
    { 
      where: { 
        id: [...this.fromItemIds, this.toItemId] 
      } 
    }
  );
  
  return this;
};

// Class methods
Swap.findByUser = function(userId) {
  return this.findAll({
    where: {
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    },
    include: [
      {
        model: sequelize.models.User,
        as: 'fromUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: sequelize.models.User,
        as: 'toUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: sequelize.models.SwapOffer,
        as: 'offer',
        attributes: ['id', 'message']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

Swap.findCompletedByUser = function(userId) {
  return this.findAll({
    where: {
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ],
      status: 'completed'
    },
    include: [
      {
        model: sequelize.models.User,
        as: 'fromUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: sequelize.models.User,
        as: 'toUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    order: [['completedAt', 'DESC']]
  });
};

// Helper functions for eco impact calculations
function calculateWaterSaved(category) {
  const waterSavings = {
    'Shirt': 2700,
    'T-Shirt': 2500,
    'Jeans': 7000,
    'Dress': 3000,
    'Jacket': 4000,
    'Sweater': 3500,
    'Skirt': 2000,
    'Shorts': 1500,
    'Other': 2500
  };
  return waterSavings[category] || 2500;
}

function calculateCO2Saved(category) {
  const co2Savings = {
    'Shirt': 3.0,
    'T-Shirt': 2.5,
    'Jeans': 8.0,
    'Dress': 3.5,
    'Jacket': 4.5,
    'Sweater': 4.0,
    'Skirt': 2.0,
    'Shorts': 1.5,
    'Other': 2.5
  };
  return co2Savings[category] || 2.5;
}

module.exports = Swap; 