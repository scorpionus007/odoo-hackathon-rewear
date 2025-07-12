const { sequelize } = require('../config/database');
const User = require('./User');
const OTP = require('./OTP');
const Item = require('./Item');
const SwapOffer = require('./SwapOffer');
const Swap = require('./Swap');
const EcoImpact = require('./EcoImpact');
const Badge = require('./Badge');
const RewardsCatalog = require('./RewardsCatalog');
const Redemption = require('./Redemption');
const Notification = require('./Notification');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Item, { foreignKey: 'userId', as: 'items' });
  User.hasMany(SwapOffer, { foreignKey: 'fromUserId', as: 'sentOffers' });
  User.hasMany(SwapOffer, { foreignKey: 'toUserId', as: 'receivedOffers' });
  User.hasMany(Swap, { foreignKey: 'fromUserId', as: 'fromSwaps' });
  User.hasMany(Swap, { foreignKey: 'toUserId', as: 'toSwaps' });
  User.hasMany(EcoImpact, { foreignKey: 'userId', as: 'ecoImpacts' });
  User.hasMany(Badge, { foreignKey: 'userId', as: 'badges' });
  User.hasMany(Redemption, { foreignKey: 'userId', as: 'redemptions' });
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

  // Item associations
  Item.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Item.hasMany(SwapOffer, { foreignKey: 'requestedItemId', as: 'offers' });
  Item.hasMany(Swap, { foreignKey: 'toItemId', as: 'swaps' });
  Item.hasMany(EcoImpact, { foreignKey: 'itemId', as: 'ecoImpacts' });

  // SwapOffer associations
  SwapOffer.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
  SwapOffer.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });
  SwapOffer.belongsTo(Item, { foreignKey: 'requestedItemId', as: 'requestedItem' });
  SwapOffer.hasOne(Swap, { foreignKey: 'offerId', as: 'swap' });

  // Swap associations
  Swap.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
  Swap.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });
  Swap.belongsTo(SwapOffer, { foreignKey: 'offerId', as: 'offer' });
  Swap.belongsTo(Item, { foreignKey: 'toItemId', as: 'toItem' });
  Swap.hasMany(EcoImpact, { foreignKey: 'swapId', as: 'ecoImpacts' });

  // EcoImpact associations
  EcoImpact.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  EcoImpact.belongsTo(Swap, { foreignKey: 'swapId', as: 'swap' });
  EcoImpact.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

  // Badge associations
  Badge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // RewardsCatalog associations
  RewardsCatalog.hasMany(Redemption, { foreignKey: 'rewardId', as: 'redemptions' });

  // Redemption associations
  Redemption.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Redemption.belongsTo(RewardsCatalog, { foreignKey: 'rewardId', as: 'reward' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
};

// Initialize associations
defineAssociations();

// Sync all models
const syncModels = async () => {
  try {
    // Force sync to drop and recreate all tables
    await sequelize.sync({ force: true });
    console.log('✅ All models synced successfully');
    
    // Create default admin user if not exists
    const adminExists = await User.findOne({ where: { email: 'admin@rewear.com' } });
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@rewear.com',
        phone: '1234567890',
        password: 'Password@111',
        role: 'admin',
        roleId: 1,
        isVerified: true
      });
      console.log('✅ Default admin user created');
    }
  } catch (error) {
    console.error('❌ Error syncing models:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  OTP,
  Item,
  SwapOffer,
  Swap,
  EcoImpact,
  Badge,
  RewardsCatalog,
  Redemption,
  Notification,
  syncModels
}; 