const { Notification, User } = require('../models');
const { paginate } = require('../utils/pagination');

// Get all notifications (Admin only)
const getAllNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      type,
      isRead,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = {};

    // Filter by user
    if (userId) {
      whereClause.userId = userId;
    }

    // Filter by type
    if (type) {
      whereClause.type = type;
    }

    // Filter by read status
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }

    const result = await paginate(Notification, {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate summary statistics
    const summary = await Notification.findOne({
      where: whereClause,
      attributes: [
        [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'totalNotifications'],
        [Notification.sequelize.fn('COUNT', Notification.sequelize.fn('DISTINCT', Notification.sequelize.col('userId'))), 'uniqueUsers']
      ]
    });

    result.summary = {
      totalNotifications: parseInt(summary?.dataValues?.totalNotifications) || 0,
      uniqueUsers: parseInt(summary?.dataValues?.uniqueUsers) || 0
    };

    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a notification (Admin only)
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      data,
      expiresAt,
      priority
    } = req.body;

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      expiresAt,
      priority: priority || 'normal',
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a notification (Admin only)
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.update(updateData);

    res.json({
      success: true,
      message: 'Notification updated successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's notifications
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, isRead, type } = req.query;

    // Check if user is requesting their own notifications or is admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s notifications'
      });
    }

    let whereClause = { userId };

    // Filter by read status
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }

    // Filter by type
    if (type) {
      whereClause.type = type;
    }

    const result = await paginate(Notification, {
      where: whereClause,
      order: [['createdAt', 'DESC']],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Calculate user summary statistics
    const summary = await Notification.findOne({
      where: { userId },
      attributes: [
        [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'totalNotifications'],
        [Notification.sequelize.fn('COUNT', Notification.sequelize.fn('DISTINCT', Notification.sequelize.col('type'))), 'uniqueTypes']
      ]
    });

    result.summary = {
      totalNotifications: parseInt(summary?.dataValues?.totalNotifications) || 0,
      uniqueTypes: parseInt(summary?.dataValues?.uniqueTypes) || 0
    };

    res.json({
      success: true,
      message: 'User notifications retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this notification'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark notification as unread
const markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this notification'
      });
    }

    await notification.markAsUnread();

    res.json({
      success: true,
      message: 'Notification marked as unread successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read successfully'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification or is admin
    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this notification'
      });
    }

    res.json({
      success: true,
      message: 'Notification retrieved successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error getting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get notifications by type
const getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const options = {
      type,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const notifications = await Notification.getUserNotifications(req.user.id, options);

    // Get total count for pagination
    const totalCount = await Notification.count({
      where: {
        userId: req.user.id,
        type,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      }
    });

    const result = {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    };

    res.json({
      success: true,
      message: `Notifications of type ${type} retrieved successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error getting notifications by type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get recent notifications
const getRecentNotifications = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const notifications = await Notification.findAll({
      where: {
        userId: req.user.id,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Recent notifications retrieved successfully',
      data: notifications
    });
  } catch (error) {
    console.error('Error getting recent notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts by type
    const typeStats = await Notification.findAll({
      where: {
        userId,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      },
      attributes: [
        'type',
        [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'count'],
        [Notification.sequelize.fn('COUNT', Notification.sequelize.literal("CASE WHEN is_read = false THEN 1 END")), 'unreadCount']
      ],
      group: ['type'],
      order: [[Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'DESC']]
    });

    // Get total counts
    const totalCount = await Notification.count({
      where: {
        userId,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      }
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    const stats = {
      total: totalCount,
      unread: unreadCount,
      read: totalCount - unreadCount,
      byType: typeStats
    };

    res.json({
      success: true,
      message: 'Notification statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete expired notifications (admin only)
const deleteExpiredNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const deletedCount = await Notification.deleteExpired();

    res.json({
      success: true,
      message: 'Expired notifications deleted successfully',
      data: { deletedCount }
    });
  } catch (error) {
    console.error('Error deleting expired notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
  updateNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  getNotificationById,
  getNotificationsByType,
  getRecentNotifications,
  getNotificationStats,
  deleteExpiredNotifications
}; 