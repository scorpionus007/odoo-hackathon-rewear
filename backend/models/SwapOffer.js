const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SwapOffer = sequelize.define('SwapOffer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
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
  offeredItemIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  requestedItemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'countered', 'cancelled'),
    defaultValue: 'pending'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'swap_offers',
  hooks: {
    afterCreate: async (offer) => {
      // Create notification for the recipient
      await sequelize.models.Notification.create({
        userId: offer.toUserId,
        message: `You have received a new swap offer for your item`,
        type: 'swap_offer',
        relatedId: offer.id
      });
    },
    afterUpdate: async (offer) => {
      if (offer.changed('status')) {
        let message = '';
        let userId = '';
        
        switch (offer.status) {
          case 'accepted':
            message = 'Your swap offer has been accepted!';
            userId = offer.fromUserId;
            break;
          case 'rejected':
            message = 'Your swap offer has been rejected.';
            userId = offer.fromUserId;
            break;
          case 'countered':
            message = 'You have received a counter offer!';
            userId = offer.fromUserId;
            break;
        }
        
        if (message && userId) {
          await sequelize.models.Notification.create({
            userId,
            message,
            type: 'swap_response',
            relatedId: offer.id
          });
        }
      }
    }
  }
});

// Instance methods
SwapOffer.prototype.accept = async function() {
  this.status = 'accepted';
  await this.save();
  
  // Create swap record
  await sequelize.models.Swap.create({
    offerId: this.id,
    fromUserId: this.fromUserId,
    toUserId: this.toUserId,
    fromItemIds: this.offeredItemIds,
    toItemId: this.requestedItemId,
    status: 'in_progress'
  });
  
  // Update item statuses
  await sequelize.models.Item.update(
    { status: 'swapped' },
    { 
      where: { 
        id: [...this.offeredItemIds, this.requestedItemId] 
      } 
    }
  );
  
  return this;
};

SwapOffer.prototype.reject = async function() {
  this.status = 'rejected';
  await this.save();
  return this;
};

SwapOffer.prototype.counter = async function(newOfferedItems, message) {
  this.status = 'countered';
  this.offeredItemIds = newOfferedItems;
  if (message) this.message = message;
  await this.save();
  return this;
};

// Class methods
SwapOffer.findByUser = function(userId, type = 'all') {
  const whereClause = {};
  
  if (type === 'sent') {
    whereClause.fromUserId = userId;
  } else if (type === 'received') {
    whereClause.toUserId = userId;
  } else {
    whereClause.$or = [
      { fromUserId: userId },
      { toUserId: userId }
    ];
  }
  
  return this.findAll({
    where: whereClause,
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
        model: sequelize.models.Item,
        as: 'requestedItem',
        attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

SwapOffer.findPendingByUser = function(userId) {
  return this.findAll({
    where: {
      toUserId: userId,
      status: 'pending'
    },
    include: [
      {
        model: sequelize.models.User,
        as: 'fromUser',
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: sequelize.models.Item,
        as: 'requestedItem',
        attributes: ['id', 'title', 'category', 'condition', 'size', 'material', 'images']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

module.exports = SwapOffer; 