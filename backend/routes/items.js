const express = require('express');
const ItemController = require('../controllers/itemController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', ItemController.getAllItems);
router.get('/search', ItemController.searchItems);
router.get('/categories', ItemController.getCategories);
router.get('/:id', ItemController.getItemById);

// Protected routes
router.post('/', authMiddleware, ItemController.createItem);
router.put('/:id', authMiddleware, ItemController.updateItem);
router.delete('/:id', authMiddleware, ItemController.deleteItem);
router.post('/:id/images', authMiddleware, ItemController.uploadImages);
router.delete('/:id/images/:imageId', authMiddleware, ItemController.deleteImage);

// User's items
router.get('/user/my-items', authMiddleware, ItemController.getMyItems);
router.get('/user/favorites', authMiddleware, ItemController.getFavorites);
router.post('/:id/favorite', authMiddleware, ItemController.toggleFavorite);

module.exports = router; 