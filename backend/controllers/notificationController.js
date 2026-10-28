import Notification from "../models/Notification.js";
import {
  fetchUserNotifications,
  markAsReadById,
  markAllUserNotificationsRead,
} from "../services/notificationService.js";

// @desc    Get current authenticated user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit, page, unreadOnly } = req.query;

    const result = await fetchUserNotifications(userId, {
      limit,
      page,
      unreadOnly: unreadOnly === "true",
    });

    return res.json({
      success: true,
      count: result.notifications.length,
      unreadCount: result.unreadCount,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.notifications,
      notifications: result.notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get count of unread notifications for current user
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark single notification as read (Strict recipient validation)
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await markAsReadById(req.params.id, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied.",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all unread notifications as read for current user
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await markAllUserNotificationsRead(userId);

    return res.json({
      success: true,
      message: `Marked ${count} notifications as read.`,
      unreadCount: 0,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notification (Strict recipient validation)
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied.",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.json({
      success: true,
      message: "Notification deleted successfully.",
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
