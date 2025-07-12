const axios = require('axios');
const { User } = require('../models');

const BASE_URL = 'http://localhost:3456/api';
let authToken = '';
let adminToken = '';
let testUserId = '';
let testItemId = '';
let testSwapOfferId = '';

// Test helper functions
const logTest = (testName, status, message = '') => {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${testName}: ${message}`);
};

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
};

// Test Authentication Endpoints
const testAuthEndpoints = async () => {
  console.log('\n🔐 Testing Authentication Endpoints...');

  // Test user registration
  const registerData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    phone: '+1234567899',
    password: 'testpassword123'
  };

  let result = await makeRequest('POST', '/auth/register', registerData);
  logTest('User Registration', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'User registered successfully' : result.error?.message);

  // Test user login
  const loginData = {
    email: 'john.doe@example.com',
    password: 'password123'
  };

  result = await makeRequest('POST', '/auth/login', loginData);
  if (result.success) {
    authToken = result.data.data.accessToken;
    logTest('User Login', 'PASS', 'Login successful');
  } else {
    logTest('User Login', 'FAIL', result.error?.message);
  }

  // Test admin login
  const adminLoginData = {
    email: 'admin@rewear.com',
    password: 'admin123'
  };

  result = await makeRequest('POST', '/auth/login', adminLoginData);
  if (result.success) {
    adminToken = result.data.data.accessToken;
    logTest('Admin Login', 'PASS', 'Admin login successful');
  } else {
    logTest('Admin Login', 'FAIL', result.error?.message);
  }

  // Test get profile
  result = await makeRequest('GET', '/auth/profile', null, authToken);
  if (result.success) {
    testUserId = result.data.data.id;
    logTest('Get Profile', 'PASS', 'Profile retrieved successfully');
  } else {
    logTest('Get Profile', 'FAIL', result.error?.message);
  }
};

// Test User Endpoints
const testUserEndpoints = async () => {
  console.log('\n👥 Testing User Endpoints...');

  // Test get all users (admin only)
  let result = await makeRequest('GET', '/users', null, adminToken);
  logTest('Get All Users (Admin)', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.length} users found` : result.error?.message);

  // Test get user by ID
  result = await makeRequest('GET', `/users/${testUserId}`, null, authToken);
  logTest('Get User by ID', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'User details retrieved' : result.error?.message);

  // Test update user profile
  const updateData = {
    firstName: 'Updated',
    lastName: 'Name',
    bio: 'Updated bio'
  };

  result = await makeRequest('PUT', '/users/profile', updateData, authToken);
  logTest('Update Profile', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'Profile updated successfully' : result.error?.message);
};

// Test Item Endpoints
const testItemEndpoints = async () => {
  console.log('\n👕 Testing Item Endpoints...');

  // Test get all items
  let result = await makeRequest('GET', '/items');
  logTest('Get All Items', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.length} items found` : result.error?.message);

  // Test create item
  const itemData = {
    title: 'Test Item',
    description: 'This is a test item',
    category: 'Tops',
    condition: 'Good',
    material: 'Cotton',
    size: 'M',
    brand: 'Test Brand',
    color: 'Blue'
  };

  result = await makeRequest('POST', '/items', itemData, authToken);
  if (result.success) {
    testItemId = result.data.data.id;
    logTest('Create Item', 'PASS', 'Item created successfully');
  } else {
    logTest('Create Item', 'FAIL', result.error?.message);
  }

  // Test get item by ID
  result = await makeRequest('GET', `/items/${testItemId}`);
  logTest('Get Item by ID', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'Item details retrieved' : result.error?.message);

  // Test update item
  const updateData = {
    title: 'Updated Test Item',
    description: 'Updated description'
  };

  result = await makeRequest('PUT', `/items/${testItemId}`, updateData, authToken);
  logTest('Update Item', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'Item updated successfully' : result.error?.message);
};

// Test Swap Offer Endpoints
const testSwapOfferEndpoints = async () => {
  console.log('\n🔄 Testing Swap Offer Endpoints...');

  // Test create swap offer
  const offerData = {
    requestedItemId: testItemId,
    message: 'I would like to swap for this item'
  };

  let result = await makeRequest('POST', '/swap-offers', offerData, authToken);
  if (result.success) {
    testSwapOfferId = result.data.data.id;
    logTest('Create Swap Offer', 'PASS', 'Swap offer created successfully');
  } else {
    logTest('Create Swap Offer', 'FAIL', result.error?.message);
  }

  // Test get swap offers
  result = await makeRequest('GET', '/swap-offers', null, authToken);
  logTest('Get Swap Offers', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.length} offers found` : result.error?.message);

  // Test get swap offer by ID
  result = await makeRequest('GET', `/swap-offers/${testSwapOfferId}`, null, authToken);
  logTest('Get Swap Offer by ID', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'Swap offer details retrieved' : result.error?.message);
};

// Test Swap Endpoints
const testSwapEndpoints = async () => {
  console.log('\n🤝 Testing Swap Endpoints...');

  // Test get swaps
  let result = await makeRequest('GET', '/swaps', null, authToken);
  logTest('Get Swaps', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.length} swaps found` : result.error?.message);

  // Test get completed swaps
  result = await makeRequest('GET', '/swaps/completed', null, authToken);
  logTest('Get Completed Swaps', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.length} completed swaps found` : result.error?.message);
};

// Test Eco Impact Endpoints
const testEcoImpactEndpoints = async () => {
  console.log('\n🌍 Testing Eco Impact Endpoints...');

  // Test get user eco impact
  let result = await makeRequest('GET', `/eco-impact/user/${testUserId}`, null, authToken);
  logTest('Get User Eco Impact', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'Eco impact data retrieved' : result.error?.message);

  // Test get leaderboard
  result = await makeRequest('GET', '/eco-impact/leaderboard');
  logTest('Get Eco Impact Leaderboard', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.length} users in leaderboard` : result.error?.message);

  // Test get stats
  result = await makeRequest('GET', '/eco-impact/stats');
  logTest('Get Eco Impact Stats', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'Stats retrieved successfully' : result.error?.message);
};

// Test Badge Endpoints
const testBadgeEndpoints = async () => {
  console.log('\n🏆 Testing Badge Endpoints...');

  // Test get user badges
  let result = await makeRequest('GET', `/badges/user/${testUserId}`, null, authToken);
  logTest('Get User Badges', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.length} badges found` : result.error?.message);

  // Test get badge types
  result = await makeRequest('GET', '/badges/types');
  logTest('Get Badge Types', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.length} badge types found` : result.error?.message);

  // Test check badge eligibility
  result = await makeRequest('GET', `/badges/check-eligibility/${testUserId}`, null, authToken);
  logTest('Check Badge Eligibility', result.success ? 'PASS' : 'FAIL', 
    result.success ? 'Eligibility checked successfully' : result.error?.message);
};

// Test Rewards Endpoints
const testRewardsEndpoints = async () => {
  console.log('\n🎁 Testing Rewards Endpoints...');

  // Test get available rewards
  let result = await makeRequest('GET', '/rewards');
  logTest('Get Available Rewards', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.rewards.length} rewards found` : result.error?.message);

  // Test get reward by ID
  if (result.success && result.data.data.rewards.length > 0) {
    const rewardId = result.data.data.rewards[0].id;
    result = await makeRequest('GET', `/rewards/${rewardId}`);
    logTest('Get Reward by ID', result.success ? 'PASS' : 'FAIL', 
      result.success ? 'Reward details retrieved' : result.error?.message);
  }

  // Test get user redemptions
  result = await makeRequest('GET', `/rewards/user/${testUserId}/redemptions`, null, authToken);
  logTest('Get User Redemptions', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.redemptions.length} redemptions found` : result.error?.message);
};

// Test Notification Endpoints
const testNotificationEndpoints = async () => {
  console.log('\n🔔 Testing Notification Endpoints...');

  // Test get user notifications
  let result = await makeRequest('GET', '/notifications', null, authToken);
  logTest('Get User Notifications', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.data.length} notifications found` : result.error?.message);

  // Test get unread count
  result = await makeRequest('GET', '/notifications/unread-count', null, authToken);
  logTest('Get Unread Count', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.count} unread notifications` : result.error?.message);
};

// Test Admin Endpoints
const testAdminEndpoints = async () => {
  console.log('\n👨‍💼 Testing Admin Endpoints...');

  // Test get all notifications (admin)
  let result = await makeRequest('GET', '/notifications', null, adminToken);
  logTest('Get All Notifications (Admin)', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.data.length} notifications found` : result.error?.message);

  // Test get all badges (admin)
  result = await makeRequest('GET', '/badges', null, adminToken);
  logTest('Get All Badges (Admin)', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.data.length} badges found` : result.error?.message);

  // Test get all rewards (admin)
  result = await makeRequest('GET', '/rewards', null, adminToken);
  logTest('Get All Rewards (Admin)', result.success ? 'PASS' : 'FAIL', 
    result.success ? `${result.data.data.data.length} rewards found` : result.error?.message);
};

// Main test function
const runAllTests = async () => {
  console.log('🚀 Starting Backend API Tests...\n');
  console.log(`📍 Testing against: ${BASE_URL}`);

  try {
    await testAuthEndpoints();
    await testUserEndpoints();
    await testItemEndpoints();
    await testSwapOfferEndpoints();
    await testSwapEndpoints();
    await testEcoImpactEndpoints();
    await testBadgeEndpoints();
    await testRewardsEndpoints();
    await testNotificationEndpoints();
    await testAdminEndpoints();

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Authentication endpoints tested');
    console.log('   ✅ User management endpoints tested');
    console.log('   ✅ Item management endpoints tested');
    console.log('   ✅ Swap offer endpoints tested');
    console.log('   ✅ Swap management endpoints tested');
    console.log('   ✅ Eco impact endpoints tested');
    console.log('   ✅ Badge system endpoints tested');
    console.log('   ✅ Rewards system endpoints tested');
    console.log('   ✅ Notification endpoints tested');
    console.log('   ✅ Admin endpoints tested');

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  makeRequest,
  logTest
}; 