const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

// User profile management
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/profile/image', UserController.updateProfileImage);
router.delete('/profile/image', UserController.deleteProfileImage);

// User statistics
router.get('/stats', UserController.getUserStats);
router.get('/eco-impact', UserController.getEcoImpact);

// User preferences
router.get('/preferences', UserController.getPreferences);
router.put('/preferences', UserController.updatePreferences);

module.exports = router; 