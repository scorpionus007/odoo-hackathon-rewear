const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { ROLE_IDS } = require('../constants');

const ensureAdminUser = async () => {
  try {
    console.log('🔍 Checking for admin user...');
    
    // Check if admin user exists
    let adminUser = await User.findOne({ where: { email: 'admin@rewear.com' } });
    
    if (!adminUser) {
      console.log('📝 Creating admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('Password@111', 12);
      
      // Create admin user
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@rewear.com',
        phone: '1234567890',
        password: hashedPassword,
        role: 'admin',
        roleId: ROLE_IDS.ADMIN, // This should be 1
        isVerified: true,
        isActive: true
      });
      
      console.log('✅ Admin user created successfully');
    } else {
      console.log('👤 Admin user already exists');
      
      // Check if the role is correct
      if (adminUser.role !== 'admin' || adminUser.roleId !== ROLE_IDS.ADMIN) {
        console.log('⚠️  Admin user role is incorrect, updating...');
        
        await adminUser.update({
          role: 'admin',
          roleId: ROLE_IDS.ADMIN,
          isVerified: true,
          isActive: true
        });
        
        console.log('✅ Admin user role updated successfully');
      } else {
        console.log('✅ Admin user role is correct');
      }
    }
    
    // Display admin user info
    console.log('\n📋 Admin User Details:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Role ID: ${adminUser.roleId}`);
    console.log(`   Verified: ${adminUser.isVerified}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Created: ${adminUser.createdAt}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: admin@rewear.com');
    console.log('   Password: Password@111');
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Error ensuring admin user:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  const { sequelize } = require('../models');
  
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection established');
      return ensureAdminUser();
    })
    .then(() => {
      console.log('\n🎉 Admin user setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin user setup failed:', error);
      process.exit(1);
    });
}

module.exports = ensureAdminUser; 