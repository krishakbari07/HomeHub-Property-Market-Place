import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { notificationApi } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef(0);

  // Clear data immediately when unauthenticated or changing accounts
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setLoading(false);
  }, []);

  const fetchNotifications = useCallback(async (force = false) => {
    if (!isAuthenticated || !user) {
      clearNotifications();
      return;
    }

    const now = Date.now();
    if (!force && now - lastFetchRef.current < 2000) {
      return; // Throttle to prevent spam
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      const data = await notificationApi.getMyNotifications({ limit: 40 });
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);

      const unread = list.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, clearNotifications]);

  const markAsRead = async (id) => {
    if (!id) return;
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationApi.markAsRead(id);
    } catch (err) {
      console.warn("Failed to mark notification read on backend:", err.message);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.warn("Failed to mark all notifications read:", err.message);
    }
  };

  // Sync on auth changes, visibility, focus, and events
  useEffect(() => {
    if (!isAuthenticated || !user) {
      clearNotifications();
      return;
    }

    fetchNotifications(true);

    const handleSync = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener("homehub_notification_created", handleSync);
    window.addEventListener("homehub_offer_updated", handleSync);
    window.addEventListener("homehub_inquiry_updated", handleSync);
    window.addEventListener("homehub_appointment_updated", handleSync);

    // Gentle 30-second background polling while tab is active and visible
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 30000);

    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("homehub_notification_created", handleSync);
      window.removeEventListener("homehub_offer_updated", handleSync);
      window.removeEventListener("homehub_inquiry_updated", handleSync);
      window.removeEventListener("homehub_appointment_updated", handleSync);
      clearInterval(timer);
    };
  }, [user, isAuthenticated, fetchNotifications, clearNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchNotifications: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearNotifications: () => {},
    };
  }
  return context;
};
