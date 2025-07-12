const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { USER_ROLES, ROLE_IDS } = require('../constants');

class AdminController {
  // Validation rules
  static createUserValidation = [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('phone')
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid phone number'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    
    body('role')
      .isIn(Object.values(USER_ROLES))
      .withMessage('Invalid role')
  ];

  static updateUserValidation = [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('phone')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid phone number'),
    
    body('role')
      .optional()
      .isIn(Object.values(USER_ROLES))
      .withMessage('Invalid role')
  ];

  // Get all users with pagination
  static async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers: count,
            limit
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new user
  static async createUser(req, res, next) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { firstName, lastName, email, phone, password, role = 'user' } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmailOrPhone(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or phone already exists'
        });
      }

      // Map role to roleId
      const roleId = ROLE_IDS[role.toUpperCase()] || ROLE_IDS.USER;

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
        roleId,
        isVerified: true
      });

      // Return user without password
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleId: user.roleId,
        points: user.points,
        ecoImpact: user.ecoImpact,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt
      };

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static async updateUser(req, res, next) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = { ...req.body };

      // Find user
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // If role is being updated, update roleId as well
      if (updateData.role) {
        updateData.roleId = ROLE_IDS[updateData.role.toUpperCase()] || ROLE_IDS.USER;
      }

      // Update user
      await user.update(updateData);

      // Return updated user without password
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleId: user.roleId,
        points: user.points,
        ecoImpact: user.ecoImpact,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json({
        success: true,
        message: 'User updated successfully',
        data: userResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Find user
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent deleting admin users
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete admin users'
        });
      }

      // Delete user
      await user.destroy();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user status (active/inactive)
  static async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      // Find user
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update status
      await user.update({ isActive });

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { isActive }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics
  static async getUserStats(req, res, next) {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const verifiedUsers = await User.count({ where: { isVerified: true } });
      
      const usersByRole = await User.findAll({
        attributes: [
          'role',
          [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
        ],
        group: ['role']
      });

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          usersByRole: usersByRole.map(item => ({
            role: item.role,
            count: parseInt(item.dataValues.count)
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Ensure admin user exists
  static async ensureAdminUser(req, res, next) {
    try {
      const bcrypt = require('bcryptjs');
      const { ROLE_IDS } = require('../constants');
      
      // Check if admin user exists
      let adminUser = await User.findOne({ where: { email: 'admin@rewear.com' } });
      
      if (!adminUser) {
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
          roleId: ROLE_IDS.ADMIN,
          isVerified: true,
          isActive: true
        });
        
        res.json({
          success: true,
          message: 'Admin user created successfully',
          data: {
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            roleId: adminUser.roleId,
            isVerified: adminUser.isVerified,
            isActive: adminUser.isActive,
            createdAt: adminUser.createdAt
          },
          credentials: {
            email: 'admin@rewear.com',
            password: 'Password@111'
          }
        });
      } else {
        // Check if the role is correct
        if (adminUser.role !== 'admin' || adminUser.roleId !== ROLE_IDS.ADMIN) {
          await adminUser.update({
            role: 'admin',
            roleId: ROLE_IDS.ADMIN,
            isVerified: true,
            isActive: true
          });
          
          res.json({
            success: true,
            message: 'Admin user role updated successfully',
            data: {
              id: adminUser.id,
              email: adminUser.email,
              role: adminUser.role,
              roleId: adminUser.roleId,
              isVerified: adminUser.isVerified,
              isActive: adminUser.isActive,
              updatedAt: adminUser.updatedAt
            },
            credentials: {
              email: 'admin@rewear.com',
              password: 'Password@111'
            }
          });
        } else {
          res.json({
            success: true,
            message: 'Admin user already exists with correct role',
            data: {
              id: adminUser.id,
              email: adminUser.email,
              role: adminUser.role,
              roleId: adminUser.roleId,
              isVerified: adminUser.isVerified,
              isActive: adminUser.isActive,
              createdAt: adminUser.createdAt
            },
            credentials: {
              email: 'admin@rewear.com',
              password: 'Password@111'
            }
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController; 