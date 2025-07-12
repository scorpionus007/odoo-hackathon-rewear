const { sequelize } = require('../config/database');
const User = require('./User');
const OTP = require('./OTP');

// Define associations here when we add more models
// For now, just User and OTP models

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
  syncModels
}; 