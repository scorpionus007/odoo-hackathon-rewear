const { User } = require('../models');
const { USER_ROLES, ROLE_IDS } = require('../constants');

/**
 * Enhanced role-based authorization middleware
 */
class RoleMiddleware {
  /**
   * Check if user has admin role
   */
  static isAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check both role string and roleId for admin
    if (req.user.role === 'admin' || req.user.roleId === ROLE_IDS.ADMIN) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  };

  /**
   * Check if user has moderator role or higher
   */
  static isModeratorOrHigher = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoleId = req.user.roleId || ROLE_IDS.USER;
    
    if (userRoleId <= ROLE_IDS.MODERATOR) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Moderator or higher access required'
    });
  };

  /**
   * Check if user has specific role
   */
  static hasRole = (requiredRole) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (req.user.role === requiredRole) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `${requiredRole} access required`
      });
    };
  };

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole = (requiredRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (requiredRoles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    };
  };

  /**
   * Check if user has minimum role level
   */
  static hasMinimumRole = (minimumRole) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRoleId = req.user.roleId || ROLE_IDS.USER;
      const minimumRoleId = ROLE_IDS[minimumRole.toUpperCase()] || ROLE_IDS.USER;

      if (userRoleId <= minimumRoleId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `${minimumRole} or higher access required`
      });
    };
  };

  /**
   * Check if user owns the resource or has admin access
   */
  static ownsResourceOrAdmin = (resourceModel, resourceIdParam = 'id', userIdField = 'userId') => {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        // Admin can access any resource
        if (req.user.role === 'admin' || req.user.roleId === ROLE_IDS.ADMIN) {
          return next();
        }

        const resourceId = req.params[resourceIdParam];
        
        if (!resourceId) {
          return res.status(400).json({
            success: false,
            message: 'Resource ID is required'
          });
        }

        // Find resource and check ownership
        const resource = await resourceModel.findByPk(resourceId);
        
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: 'Resource not found'
          });
        }

        // Check if user owns the resource
        if (resource[userIdField] !== req.user.userId && resource[userIdField] !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to access this resource'
          });
        }

        next();
      } catch (error) {
        console.error('Resource authorization error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    };
  };

  /**
   * Check if user can access user data (self or admin)
   */
  static canAccessUser = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const targetUserId = req.params.id || req.params.userId;
    
    // Admin can access any user
    if (req.user.role === 'admin' || req.user.roleId === ROLE_IDS.ADMIN) {
      return next();
    }

    // User can access their own data
    if (targetUserId == req.user.userId || targetUserId == req.user.id) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this user data'
    });
  };

  /**
   * Debug middleware to log user role information
   */
  static debugUserRole = (req, res, next) => {
    if (req.user) {
      console.log('🔍 User Role Debug:', {
        userId: req.user.userId || req.user.id,
        email: req.user.email,
        role: req.user.role,
        roleId: req.user.roleId,
        isAdmin: req.user.role === 'admin' || req.user.roleId === ROLE_IDS.ADMIN
      });
    }
    next();
  };

  /**
   * Ensure user is active
   */
  static isActive = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    next();
  };

  /**
   * Ensure user is verified
   */
  static isVerified = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account verification required'
      });
    }

    next();
  };

  /**
   * Combined middleware for admin access with additional checks
   */
  static adminAccess = [
    RoleMiddleware.isActive,
    RoleMiddleware.isVerified,
    RoleMiddleware.isAdmin
  ];

  /**
   * Combined middleware for moderator or higher access
   */
  static moderatorOrHigher = [
    RoleMiddleware.isActive,
    RoleMiddleware.isVerified,
    RoleMiddleware.isModeratorOrHigher
  ];
}

module.exports = RoleMiddleware; 