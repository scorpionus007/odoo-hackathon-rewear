const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReWear API',
      version: '1.0.0',
      description: 'Complete API documentation for ReWear - Community Clothing Exchange Platform',
      contact: {
        name: 'Team ReWear',
        email: 'rewear.odoo.hackathon@gmail.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3456/api',
        description: 'Development server',
      },
      {
        url: 'https://api.rewear.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            firstName: { type: 'string', minLength: 2, maxLength: 50 },
            lastName: { type: 'string', minLength: 2, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            bio: { type: 'string', maxLength: 500, nullable: true },
            location: { type: 'string', maxLength: 100, nullable: true },
            role: { type: 'string', enum: ['user', 'admin'] },
            points: { type: 'integer', minimum: 0 },
            ecoImpact: { type: 'number', minimum: 0 },
            isVerified: { type: 'boolean' },
            isActive: { type: 'boolean' },
            preferences: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Item: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'integer' },
            title: { type: 'string', minLength: 3, maxLength: 100 },
            description: { type: 'string', minLength: 10, maxLength: 1000 },
            category: { type: 'string', enum: ['Shirt', 'T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sweater', 'Skirt', 'Shorts', 'Other'] },
            condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] },
            size: { type: 'string', enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
            material: { type: 'string', minLength: 2, maxLength: 50 },
            estimatedMrp: { type: 'number', minimum: 0 },
            images: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['available', 'in_swap', 'removed'] },
            swapPreferences: { type: 'object' },
            ecoPointsValue: { type: 'integer', minimum: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SwapOffer: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fromUserId: { type: 'integer' },
            toUserId: { type: 'integer' },
            offeredItemIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            requestedItemId: { type: 'string', format: 'uuid' },
            message: { type: 'string', maxLength: 500, nullable: true },
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'cancelled', 'countered'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Swap: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fromUserId: { type: 'integer' },
            toUserId: { type: 'integer' },
            fromItemIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            toItemId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['in_progress', 'completed', 'cancelled'] },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        EcoImpact: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'integer' },
            itemId: { type: 'string', format: 'uuid' },
            pointsAwarded: { type: 'integer', minimum: 0 },
            waterSavedLiters: { type: 'number', minimum: 0 },
            co2SavedKg: { type: 'number', minimum: 0 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Badge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'integer' },
            badgeType: { type: 'string' },
            awardedAt: { type: 'string', format: 'date-time' },
          },
        },
        RewardsCatalog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            brand: { type: 'string' },
            pointsRequired: { type: 'integer', minimum: 0 },
            isActive: { type: 'boolean' },
            maxRedemptions: { type: 'integer', minimum: 0, nullable: true },
            currentRedemptions: { type: 'integer', minimum: 0 },
            expiryDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Redemption: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'integer' },
            rewardId: { type: 'string', format: 'uuid' },
            pointsSpent: { type: 'integer', minimum: 0 },
            status: { type: 'string', enum: ['active', 'used', 'expired'] },
            redeemedAt: { type: 'string', format: 'date-time' },
            usedAt: { type: 'string', format: 'date-time', nullable: true },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'integer' },
            type: { type: 'string', enum: ['swap_offer', 'swap_accepted', 'swap_rejected', 'swap_completed', 'badge_awarded', 'reward_redeemed', 'system'] },
            title: { type: 'string' },
            message: { type: 'string' },
            isRead: { type: 'boolean' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' },
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', minimum: 1 },
            totalPages: { type: 'integer', minimum: 0 },
            totalItems: { type: 'integer', minimum: 0 },
            itemsPerPage: { type: 'integer', minimum: 1 },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
            nextPage: { type: 'integer', nullable: true },
            prevPage: { type: 'integer', nullable: true },
          },
        },
      },
    },
  },
  apis: ['./backend/routes/*.js', './backend/controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs; 