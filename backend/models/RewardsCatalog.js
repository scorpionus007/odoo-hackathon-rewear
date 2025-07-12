const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RewardsCatalog = sequelize.define('RewardsCatalog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  couponCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  discountPercentage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  pointsRequired: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  maxRedemptions: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  currentRedemptions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'rewards_catalog',
  hooks: {
    beforeCreate: async (reward) => {
      // Generate unique coupon code if not provided
      if (!reward.couponCode) {
        reward.couponCode = generateCouponCode();
      }
    }
  }
});

// Generate unique coupon code
function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Instance methods
RewardsCatalog.prototype.isAvailable = function() {
  if (!this.isActive) return false;
  if (this.expiryDate && new Date() > this.expiryDate) return false;
  if (this.maxRedemptions && this.currentRedemptions >= this.maxRedemptions) return false;
  return true;
};

RewardsCatalog.prototype.canRedeem = function(userPoints) {
  return this.isAvailable() && userPoints >= this.pointsRequired;
};

RewardsCatalog.prototype.redeem = async function(userId) {
  if (!this.isAvailable()) {
    throw new Error('Reward is not available for redemption');
  }

  // Increment redemption count
  this.currentRedemptions += 1;
  await this.save();

  // Create redemption record
  const redemption = await sequelize.models.Redemption.create({
    userId,
    rewardId: this.id,
    pointsSpent: this.pointsRequired
  });

  // Deduct points from user
  await sequelize.models.User.decrement('points', {
    by: this.pointsRequired,
    where: { id: userId }
  });

  // Create notification
  await sequelize.models.Notification.create({
    userId,
    message: `You've successfully redeemed "${this.title}" for ${this.pointsRequired} points!`,
    type: 'reward_redeemed',
    relatedId: redemption.id
  });

  return redemption;
};

// Class methods
RewardsCatalog.getAvailableRewards = function(userPoints = 0) {
  return this.findAll({
    where: {
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ],
      $or: [
        { maxRedemptions: null },
        sequelize.literal('current_redemptions < max_redemptions')
      ]
    },
    order: [['pointsRequired', 'ASC']]
  });
};

RewardsCatalog.getRewardsByPoints = function(minPoints, maxPoints) {
  return this.findAll({
    where: {
      isActive: true,
      pointsRequired: {
        $between: [minPoints, maxPoints]
      }
    },
    order: [['pointsRequired', 'ASC']]
  });
};

RewardsCatalog.getPopularRewards = function(limit = 10) {
  return this.findAll({
    where: { isActive: true },
    order: [['currentRedemptions', 'DESC']],
    limit
  });
};

module.exports = RewardsCatalog; 