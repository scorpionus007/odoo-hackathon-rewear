const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Item = sequelize.define('Item', {
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
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100],
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('Shirt', 'T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sweater', 'Skirt', 'Shorts', 'Other'),
    allowNull: false
  },
  condition: {
    type: DataTypes.ENUM('New', 'Like New', 'Good', 'Fair', 'Worn'),
    allowNull: false
  },
  size: {
    type: DataTypes.ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'Other'),
    allowNull: false
  },
  material: {
    type: DataTypes.ENUM('Cotton', 'Organic Cotton', 'Wool', 'Silk', 'Linen', 'Polyester', 'Nylon', 'Rayon/Viscose', 'Hemp', 'Bamboo', 'Leather', 'Denim', 'Acrylic', 'Other'),
    allowNull: false
  },
  estimatedMrp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('available', 'pending', 'swapped', 'removed'),
    defaultValue: 'available'
  },
  swapPreferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ecoPointsValue: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'items',
  hooks: {
    beforeCreate: async (item) => {
      item.ecoPointsValue = calculateEcoPoints(item.material, item.condition);
    },
    beforeUpdate: async (item) => {
      if (item.changed('material') || item.changed('condition')) {
        item.ecoPointsValue = calculateEcoPoints(item.material, item.condition);
      }
    }
  }
});

// Material weightage table
const MATERIAL_WEIGHTAGE = {
  'Cotton': 1.00,
  'Organic Cotton': 1.10,
  'Wool': 1.20,
  'Silk': 1.25,
  'Linen': 0.90,
  'Polyester': 1.30,
  'Nylon': 1.25,
  'Rayon/Viscose': 1.10,
  'Hemp': 0.80,
  'Bamboo': 0.85,
  'Leather': 1.40,
  'Denim': 1.15,
  'Acrylic': 1.20,
  'Other': 1.00
};

// Condition multipliers
const CONDITION_MULTIPLIERS = {
  'New': 1.0,
  'Like New': 0.9,
  'Good': 0.7,
  'Fair': 0.5,
  'Worn': 0.3
};

// Calculate eco points based on material and condition
function calculateEcoPoints(material, condition) {
  const materialWeightage = MATERIAL_WEIGHTAGE[material] || 1.00;
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition] || 0.5;
  return Math.round(100 * materialWeightage * conditionMultiplier);
}

// Instance methods
Item.prototype.calculateEcoPoints = function() {
  return calculateEcoPoints(this.material, this.condition);
};

// Class methods
Item.findByCategory = function(category) {
  return this.findAll({
    where: { category, status: 'available' }
  });
};

Item.findByUser = function(userId) {
  return this.findAll({
    where: { userId }
  });
};

Item.searchItems = function(searchParams) {
  const { category, size, material, condition, minPrice, maxPrice, search } = searchParams;
  const whereClause = { status: 'available' };

  if (category) whereClause.category = category;
  if (size) whereClause.size = size;
  if (material) whereClause.material = material;
  if (condition) whereClause.condition = condition;
  if (minPrice || maxPrice) {
    whereClause.estimatedMrp = {};
    if (minPrice) whereClause.estimatedMrp.$gte = minPrice;
    if (maxPrice) whereClause.estimatedMrp.$lte = maxPrice;
  }

  return this.findAll({
    where: whereClause,
    include: [
      {
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ]
  });
};

module.exports = Item; 