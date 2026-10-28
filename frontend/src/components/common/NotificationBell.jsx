import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Tag,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  Building2,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

// Format relative timestamp
const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "Recently";
  const now = new Date();
  const date = new Date(dateInput);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

// Map notification type to icon and colors
const getTypeConfig = (type) => {
  switch (type) {
    case "offer_accepted":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Offer Accepted",
      };
    case "offer_rejected":
      return {
        icon: XCircle,
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        label: "Offer Declined",
      };
    case "offer_countered":
      return {
        icon: Tag,
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Counteroffer",
      };
    case "offer_submitted":
    case "offer_counter_accepted":
    case "offer_counter_rejected":
    case "offer_withdrawn":
      return {
        icon: Tag,
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        label: "Offer Update",
      };
    case "inquiry_submitted":
    case "inquiry_replied":
    case "inquiry_status_changed":
      return {
        icon: MessageSquare,
        bg: "bg-forest-50",
        text: "text-forest-700",
        border: "border-forest-200",
        label: "Inquiry",
      };
    case "appointment_created":
    case "appointment_confirmed":
    case "appointment_rescheduled":
    case "appointment_cancelled":
      return {
        icon: Calendar,
        bg: "bg-sky-50",
        text: "text-sky-700",
        border: "border-sky-200",
        label: "Site Visit",
      };
    default:
      return {
        icon: Bell,
        bg: "bg-ivory-100",
        text: "text-navy-700",
        border: "border-ivory-300",
        label: "Notification",
      };
  }
};

const NotificationBell = ({ placement = "bottom-right", isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotification();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const resolveTargetRoute = (notification) => {
    if (notification.link && notification.link.trim() !== "") {
      return notification.link;
    }

    const role = (user?.role || "").toLowerCase();
    const type = notification.type || "";

    if (type.startsWith("offer_")) {
      if (role === "admin") return "/admin/offers";
      if (role === "agent") return "/agent/offers";
      if (role === "seller") return "/seller/offers";
      return "/buyer/offers";
    }

    if (type.startsWith("inquiry_")) {
      if (role === "admin") return "/admin/inquiries";
      if (role === "seller") return "/seller/inquiries";
      if (role === "agent") return "/agent/listings";
      return "/buyer/inquiries";
    }

    if (type.startsWith("appointment_")) {
      if (role === "admin") return "/admin/appointments";
      if (role === "agent") return "/agent/appointments";
      return "/buyer/visits";
    }

    if (notification.property) {
      const propId = notification.property._id || notification.property;
      return `/property/${propId}`;
    }

    return "/";
  };

  const handleItemClick = (notification) => {
    const notifId = notification._id || notification.id;
    if (!notification.isRead) {
      markAsRead(notifId);
    }
    setIsOpen(false);
    const destination = resolveTargetRoute(notification);
    navigate(destination);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer ${
          isOpen
            ? "bg-forest-100 text-forest-800"
            : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
        } ${isMobile ? "p-2.5" : ""}`}
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-current" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-card border border-ivory-300 z-50 overflow-hidden animate-fadeIn ${
            placement === "bottom-left"
              ? "left-0"
              : isMobile
              ? "right-0 -mr-12 sm:mr-0 max-w-[calc(100vw-32px)]"
              : "right-0"
          }`}
          role="region"
          aria-label="Notification Center"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-ivory-50/80 border-b border-ivory-200">
            <div className="flex items-center space-x-2">
              <span className="font-heading font-extrabold text-sm text-navy-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest-100 text-forest-800 border border-forest-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center space-x-1 text-[11px] font-bold text-forest-700 hover:text-forest-900 transition-colors"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-ivory-100">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-ivory-100 border border-ivory-300 mx-auto flex items-center justify-center text-navy-400">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-bold text-xs text-navy-900">
                  No notifications yet
                </h4>
                <p className="text-[11px] text-navy-500 max-w-[220px] mx-auto leading-relaxed">
                  You'll be notified here when bids are accepted, inquiries answered, or visits scheduled.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const notifId = notif._id || notif.id;
                const typeConfig = getTypeConfig(notif.type);
                const IconComponent = typeConfig.icon;
                const propTitle = notif.propertyTitle || notif.property?.title;

                return (
                  <div
                    key={notifId}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 hover:bg-ivory-50/80 transition-colors cursor-pointer flex items-start space-x-3 text-left relative ${
                      !notif.isRead ? "bg-forest-50/30" : "bg-white"
                    }`}
                  >
                    {/* Unread status dot */}
                    {!notif.isRead && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-forest-700" />
                    )}

                    {/* Type Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl ${typeConfig.bg} ${typeConfig.text} border ${typeConfig.border} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5
                          className={`text-xs truncate ${
                            !notif.isRead ? "font-bold text-navy-950" : "font-semibold text-navy-800"
                          }`}
                        >
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-navy-400 shrink-0 font-medium">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Property badge if linked */}
                      {propTitle && (
                        <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-ivory-100 text-navy-700 text-[10px] font-medium border border-ivory-200 mt-0.5 max-w-full truncate">
                          <Building2 className="w-3 h-3 text-forest-700 shrink-0" />
                          <span className="truncate">{propTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-ivory-50/60 border-t border-ivory-200 text-center">
              <span className="text-[10px] font-semibold text-navy-500">
                Click any notification to open relevant details
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
