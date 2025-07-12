const { validationResult } = require('express-validator');
const { Item, User, SwapOffer } = require('../models');
const { paginate } = require('../utils/pagination');
const { getFileUrl } = require('../services/uploadService');

// Get all items with pagination, search, and filters
const getAllItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      size,
      material,
      condition,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause = { status: 'available' };
    
    if (category) whereClause.category = category;
    if (size) whereClause.size = size;
    if (material) whereClause.material = material;
    if (condition) whereClause.condition = condition;
    if (minPrice || maxPrice) {
      whereClause.estimatedMrp = {};
      if (minPrice) whereClause.estimatedMrp.$gte = parseFloat(minPrice);
      if (maxPrice) whereClause.estimatedMrp.$lte = parseFloat(maxPrice);
    }

    // Search functionality
    if (search) {
      whereClause.$or = [
        { title: { $iLike: `%${search}%` } },
        { description: { $iLike: `%${search}%` } }
      ];
    }

    // Build include clause
    const include = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact']
      }
    ];

    // Execute query with pagination
    const result = await paginate(Item, {
      where: whereClause,
      include,
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Items retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'points', 'ecoImpact']
        },
        {
          model: SwapOffer,
          as: 'offers',
          include: [
            {
              model: User,
              as: 'fromUser',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item retrieved successfully',
      data: item
    });
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      condition,
      size,
      material,
      estimatedMrp,
      swapPreferences
    } = req.body;

    // Handle image uploads (local)
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => getFileUrl(file.filename));
    }

    const item = await Item.create({
      userId: req.user.id,
      title,
      description,
      category,
      condition,
      size,
      material,
      estimatedMrp: parseFloat(estimatedMrp),
      images,
      swapPreferences: swapPreferences || {}
    });

    // Check for badge awards
    await require('../models/Badge').checkAndAwardBadges(req.user.id);

    const createdItem = await Item.findByPk(item.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: createdItem
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // Handle image uploads (local)
    if (req.files && req.files.length > 0) {
      let images = [...item.images];
      images = images.concat(req.files.map(file => getFileUrl(file.filename)));
      updateData.images = images;
    }

    // Convert estimatedMrp to number if provided
    if (updateData.estimatedMrp) {
      updateData.estimatedMrp = parseFloat(updateData.estimatedMrp);
    }

    await item.update(updateData);

    const updatedItem = await Item.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    // Check if item has pending offers
    const pendingOffers = await SwapOffer.count({
      where: {
        requestedItemId: id,
        status: 'pending'
      }
    });

    if (pendingOffers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete item with pending swap offers'
      });
    }

    await item.update({ status: 'removed' });

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's items
const getUserItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const whereClause = { userId };
    if (status) whereClause.status = status;

    const result = await paginate(Item, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'User items retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting user items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Donate item for eco points
const donateItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check ownership
    if (item.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to donate this item'
      });
    }

    // Check if item is available
    if (item.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for donation'
      });
    }

    // Award eco points to user
    const pointsAwarded = item.ecoPointsValue;
    await User.increment('points', {
      by: pointsAwarded,
      where: { id: req.user.id }
    });

    // Update item status
    await item.update({ status: 'removed' });

    // Create eco impact record
    await require('../models/EcoImpact').create({
      userId: req.user.id,
      itemId: item.id,
      pointsAwarded,
      waterSavedLiters: calculateWaterSaved(item.category),
      co2SavedKg: calculateCO2Saved(item.category)
    });

    // Check for badge awards
    await require('../models/Badge').checkAndAwardBadges(req.user.id);

    res.json({
      success: true,
      message: 'Item donated successfully',
      data: {
        pointsAwarded,
        totalPoints: req.user.points + pointsAwarded
      }
    });
  } catch (error) {
    console.error('Error donating item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper functions for eco impact calculations
function calculateWaterSaved(category) {
  const waterSavings = {
    'Shirt': 2700,
    'T-Shirt': 2500,
    'Jeans': 7000,
    'Dress': 3000,
    'Jacket': 4000,
    'Sweater': 3500,
    'Skirt': 2000,
    'Shorts': 1500,
    'Other': 2500
  };
  return waterSavings[category] || 2500;
}

function calculateCO2Saved(category) {
  const co2Savings = {
    'Shirt': 3.0,
    'T-Shirt': 2.5,
    'Jeans': 8.0,
    'Dress': 3.5,
    'Jacket': 4.5,
    'Sweater': 4.0,
    'Skirt': 2.0,
    'Shorts': 1.5,
    'Other': 2.5
  };
  return co2Savings[category] || 2.5;
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getUserItems,
  donateItem
}; 