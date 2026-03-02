import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
} from "../api/notifications";

interface NotificationBellProps {
  token: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ token }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications({ limit: 20 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      setIsOpen(false);
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return "📅";
      case "invoice":
        return "💰";
      case "payment":
        return "💳";
      case "lead":
        return "📋";
      case "system":
        return "🔔";
      default:
        return "📌";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.bellButton}
        aria-label="Notifications"
      >
        <span style={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <h3 style={styles.dropdownTitle}>Notifications</h3>
            {notifications.length > 0 && unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={styles.markAllButton}>
                Mark all read
              </button>
            )}
          </div>

          <div style={styles.notificationList}>
            {loading ? (
              <div style={styles.loading}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🔔</div>
                <p style={styles.emptyText}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  style={{
                    ...styles.notificationItem,
                    ...(notification.read ? {} : styles.unreadItem),
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div style={styles.notificationIcon}>{getNotificationIcon(notification.type)}</div>
                  <div style={styles.notificationContent}>
                    <div style={styles.notificationTitle}>{notification.title}</div>
                    <div style={styles.notificationMessage}>{notification.message}</div>
                    <div style={styles.notificationTime}>{formatTime(notification.createdAt)}</div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(notification._id, e)}
                    style={styles.deleteButton}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div style={styles.dropdownFooter}>
              <button onClick={() => setIsOpen(false)} style={styles.closeButton}>
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "relative" as const,
  },
  bellButton: {
    position: "relative" as const,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem",
    fontSize: "1.5rem",
  },
  bellIcon: {
    display: "block",
  },
  badge: {
    position: "absolute" as const,
    top: "0",
    right: "0",
    backgroundColor: "#dc3545",
    color: "#fff",
    borderRadius: "10px",
    padding: "0.125rem 0.375rem",
    fontSize: "0.75rem",
    fontWeight: "bold" as const,
    minWidth: "18px",
    textAlign: "center" as const,
  },
  dropdown: {
    position: "absolute" as const,
    top: "100%",
    right: "0",
    marginTop: "0.5rem",
    width: "380px",
    maxHeight: "500px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column" as const,
  },
  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    borderBottom: "1px solid #e0e0e0",
  },
  dropdownTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "bold" as const,
  },
  markAllButton: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold" as const,
  },
  notificationList: {
    flex: 1,
    overflowY: "auto" as const,
    maxHeight: "400px",
  },
  loading: {
    padding: "2rem",
    textAlign: "center" as const,
    color: "#666",
  },
  emptyState: {
    padding: "3rem 2rem",
    textAlign: "center" as const,
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "0.5rem",
    opacity: 0.3,
  },
  emptyText: {
    color: "#666",
    margin: 0,
  },
  notificationItem: {
    display: "flex",
    gap: "0.75rem",
    padding: "1rem",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  unreadItem: {
    backgroundColor: "#e3f2fd",
  },
  notificationIcon: {
    fontSize: "1.5rem",
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    fontWeight: "bold" as const,
    marginBottom: "0.25rem",
    fontSize: "0.95rem",
  },
  notificationMessage: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "0.25rem",
  },
  notificationTime: {
    fontSize: "0.8rem",
    color: "#999",
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "#999",
    cursor: "pointer",
    fontSize: "1.5rem",
    padding: "0",
    width: "24px",
    height: "24px",
    flexShrink: 0,
    lineHeight: "1",
  },
  dropdownFooter: {
    padding: "0.75rem",
    borderTop: "1px solid #e0e0e0",
    textAlign: "center" as const,
  },
  closeButton: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold" as const,
  },
};

export default NotificationBell;
