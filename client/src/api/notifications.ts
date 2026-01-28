import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface Notification {
  _id: string;
  userId: string;
  type: "appointment" | "invoice" | "payment" | "lead" | "system";
  title: string;
  message: string;
  relatedAppointment?: any;
  relatedInvoice?: any;
  relatedLead?: any;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Get user's notifications
 */
export async function getNotifications(
  token: string,
  options?: { limit?: number; skip?: number; unreadOnly?: boolean }
): Promise<NotificationsResponse> {
  try {
    const params: any = {};
    if (options?.limit) params.limit = options.limit;
    if (options?.skip) params.skip = options.skip;
    if (options?.unreadOnly) params.unreadOnly = "true";

    const response = await axios.get(`${API_BASE}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch notifications");
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(token: string): Promise<number> {
  try {
    const response = await axios.get(`${API_BASE}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, token: string): Promise<void> {
  try {
    await axios.patch(
      `${API_BASE}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw new Error(error.response?.data?.message || "Failed to mark notification as read");
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(token: string): Promise<void> {
  try {
    await axios.patch(
      `${API_BASE}/notifications/mark-all-read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error marking all as read:", error);
    throw new Error(error.response?.data?.message || "Failed to mark all as read");
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, token: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE}/notifications/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    throw new Error(error.response?.data?.message || "Failed to delete notification");
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead(token: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE}/notifications/read/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error("Error deleting read notifications:", error);
    throw new Error(error.response?.data?.message || "Failed to delete read notifications");
  }
}
