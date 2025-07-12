const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
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
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('swap_offer', 'swap_response', 'swap_completed', 'badge_awarded', 'reward_redeemed', 'item_approved', 'item_rejected', 'general'),
    defaultValue: 'general'
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  indexes: [
    {
      fields: ['user_id', 'is_read']
    },
    {
      fields: ['user_id', 'type']
    },
    {
      fields: ['expires_at']
    }
  ]
});

// Instance methods
Notification.prototype.markAsRead = async function() {
  this.isRead = true;
  await this.save();
  return this;
};

Notification.prototype.markAsUnread = async function() {
  this.isRead = false;
  await this.save();
  return this;
};

Notification.prototype.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Class methods
Notification.getUserNotifications = function(userId, options = {}) {
  const {
    isRead = null,
    type = null,
    limit = 20,
    offset = 0
  } = options;

  const whereClause = { userId };
  
  if (isRead !== null) whereClause.isRead = isRead;
  if (type) whereClause.type = type;
  
  // Exclude expired notifications
  whereClause.$or = [
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } }
  ];

  return this.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

Notification.getUnreadCount = function(userId) {
  return this.count({
    where: {
      userId,
      isRead: false,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }
  });
};

Notification.markAllAsRead = function(userId) {
  return this.update(
    { isRead: true },
    {
      where: {
        userId,
        isRead: false
      }
    }
  );
};

Notification.deleteExpired = function() {
  return this.destroy({
    where: {
      expiresAt: {
        $lt: new Date()
      }
    }
  });
};

Notification.createSwapOfferNotification = function(toUserId, fromUser, itemTitle) {
  return this.create({
    userId: toUserId,
    message: `${fromUser.firstName} ${fromUser.lastName} has made a swap offer for your item "${itemTitle}"`,
    type: 'swap_offer',
    priority: 'high'
  });
};

Notification.createSwapResponseNotification = function(userId, response, itemTitle) {
  const message = response === 'accepted' 
    ? `Your swap offer for "${itemTitle}" has been accepted!`
    : `Your swap offer for "${itemTitle}" has been rejected.`;
    
  return this.create({
    userId,
    message,
    type: 'swap_response',
    priority: response === 'accepted' ? 'high' : 'medium'
  });
};

Notification.createBadgeNotification = function(userId, badgeType) {
  return this.create({
    userId,
    message: `Congratulations! You've earned the "${badgeType}" badge!`,
    type: 'badge_awarded',
    priority: 'high',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
};

Notification.createRewardNotification = function(userId, rewardTitle, pointsSpent) {
  return this.create({
    userId,
    message: `You've successfully redeemed "${rewardTitle}" for ${pointsSpent} points!`,
    type: 'reward_redeemed',
    priority: 'medium'
  });
};

module.exports = Notification; 