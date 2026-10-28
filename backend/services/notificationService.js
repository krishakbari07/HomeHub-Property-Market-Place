import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

/**
 * Persistently create an in-app notification in MongoDB Atlas
 * Only creates after the triggering action has successfully persisted in the database.
 * Deduplicates identical actions within a 5-second window.
 */
export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  property = null,
  propertyTitle = "",
  resourceType = "general",
  resourceId = null,
  link = "",
  metadata = {},
}) => {
  try {
    if (!recipient) {
      console.warn("⚠️ Notification skipped: No recipient provided.");
      return null;
    }

    const recipientId = recipient._id ? recipient._id.toString() : recipient.toString();
    const senderId = sender?._id ? sender._id.toString() : sender ? sender.toString() : null;

    // Do not notify a user about their own immediate action
    if (senderId && recipientId === senderId) {
      return null;
    }

    // Verify recipient user exists in database
    const recipientUser = await User.findById(recipientId).select("_id");
    if (!recipientUser) {
      console.warn(`⚠️ Notification skipped: Recipient user ${recipientId} does not exist.`);
      return null;
    }

    // Deduplication window: 5 seconds for same recipient, type, and resourceId
    if (resourceId) {
      const fiveSecondsAgo = new Date(Date.now() - 5000);
      const duplicate = await Notification.findOne({
        recipient: recipientId,
        type,
        resourceId,
        createdAt: { $gte: fiveSecondsAgo },
      });

      if (duplicate) {
        return duplicate;
      }
    }

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId || null,
      type,
      title: title.trim(),
      message: message.trim(),
      property: property || null,
      propertyTitle: propertyTitle || "",
      resourceType,
      resourceId: resourceId || null,
      link: link || "",
      metadata: metadata || {},
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error("❌ Notification creation error:", error.message);
    return null;
  }
};

/**
 * Retrieve notifications for authenticated recipient
 */
export const fetchUserNotifications = async (userId, { limit = 50, page = 1, unreadOnly = false } = {}) => {
  const query = { recipient: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const numericLimit = Math.min(Number(limit) || 50, 100);
  const numericPage = Math.max(Number(page) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate("sender", "name email role avatar profileImage agencyName")
      .populate("property", "title location price image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page: numericPage,
    pages: Math.ceil(total / numericLimit) || 1,
  };
};

/**
 * Mark a single notification as read (with strict recipient verification)
 */
export const markAsReadById = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return null;
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    return null;
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
};

/**
 * Mark all unread notifications for a user as read
 */
export const markAllUserNotificationsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return result.modifiedCount;
};
