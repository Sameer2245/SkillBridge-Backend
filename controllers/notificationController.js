const Notification = require('../models/Notification');

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user.id;

    const filter = { userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedId', 'title name')
      .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create notification (internal function)
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Helper function to create different types of notifications
const createOrderNotification = async (userId, orderId, type, customMessage = null) => {
  const messages = {
    order_placed: 'You have received a new order',
    order_delivered: 'Your order has been delivered',
    order_completed: 'Your order has been completed',
    order_cancelled: 'Your order has been cancelled'
  };

  const titles = {
    order_placed: 'New Order Received',
    order_delivered: 'Order Delivered',
    order_completed: 'Order Completed',
    order_cancelled: 'Order Cancelled'
  };

  return await createNotification({
    userId,
    title: titles[type],
    message: customMessage || messages[type],
    type,
    relatedId: orderId,
    relatedModel: 'Order',
    actionUrl: `/orders/${orderId}`,
    priority: type === 'order_placed' ? 'high' : 'medium'
  });
};

const createMessageNotification = async (userId, messageId, senderName) => {
  return await createNotification({
    userId,
    title: 'New Message',
    message: `You have received a new message from ${senderName}`,
    type: 'message_received',
    relatedId: messageId,
    relatedModel: 'Message',
    actionUrl: '/messages',
    priority: 'medium'
  });
};

const createReviewNotification = async (userId, reviewId, rating) => {
  return await createNotification({
    userId,
    title: 'New Review',
    message: `You have received a new ${rating}-star review`,
    type: 'review_received',
    relatedId: reviewId,
    relatedModel: 'Review',
    actionUrl: '/reviews',
    priority: 'medium'
  });
};

const createGigNotification = async (userId, gigId, type, customMessage = null) => {
  const messages = {
    gig_approved: 'Your gig has been approved and is now live',
    gig_rejected: 'Your gig has been rejected. Please review and resubmit'
  };

  const titles = {
    gig_approved: 'Gig Approved',
    gig_rejected: 'Gig Rejected'
  };

  return await createNotification({
    userId,
    title: titles[type],
    message: customMessage || messages[type],
    type,
    relatedId: gigId,
    relatedModel: 'Gig',
    actionUrl: `/gigs/${gigId}`,
    priority: 'high'
  });
};

const createSystemNotification = async (userId, title, message, priority = 'medium') => {
  return await createNotification({
    userId,
    title,
    message,
    type: 'system_update',
    priority,
    actionUrl: '/dashboard'
  });
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ userId, isRead: false });
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  // Helper functions for creating notifications
  createNotification,
  createOrderNotification,
  createMessageNotification,
  createReviewNotification,
  createGigNotification,
  createSystemNotification
};