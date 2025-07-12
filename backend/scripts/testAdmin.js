const { User } = require('../models');
const { ROLE_IDS } = require('../constants');

const testAdminUser = async () => {
  try {
    console.log('🔍 Testing admin user...');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ where: { email: 'admin@rewear.com' } });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return false;
    }
    
    console.log('✅ Admin user found');
    console.log('\n📋 Admin User Details:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Role ID: ${adminUser.roleId}`);
    console.log(`   Verified: ${adminUser.isVerified}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Created: ${adminUser.createdAt}`);
    
    // Check if role is correct
    const isAdminRole = adminUser.role === 'admin';
    const isAdminRoleId = adminUser.roleId === ROLE_IDS.ADMIN;
    
    console.log('\n🔍 Role Checks:');
    console.log(`   Role string is 'admin': ${isAdminRole}`);
    console.log(`   Role ID is ${ROLE_IDS.ADMIN}: ${isAdminRoleId}`);
    console.log(`   Both checks pass: ${isAdminRole && isAdminRoleId}`);
    
    if (isAdminRole && isAdminRoleId) {
      console.log('\n✅ Admin user has correct role configuration');
      return true;
    } else {
      console.log('\n❌ Admin user role configuration is incorrect');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing admin user:', error);
    return false;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  const { sequelize } = require('../models');
  
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection established');
      return testAdminUser();
    })
    .then((success) => {
      if (success) {
        console.log('\n🎉 Admin user test passed!');
      } else {
        console.log('\n⚠️  Admin user test failed!');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Admin user test failed:', error);
      process.exit(1);
    });
}

module.exports = testAdminUser; 