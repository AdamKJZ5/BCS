import apiClient from '../utils/apiClient';

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
  options?: { limit?: number; skip?: number; unreadOnly?: boolean }
): Promise<NotificationsResponse> {
  try {
    const params: any = {};
    if (options?.limit) params.limit = options.limit;
    if (options?.skip) params.skip = options.skip;
    if (options?.unreadOnly) params.unreadOnly = "true";

    const response = await apiClient.get('/notifications', { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch notifications");
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw new Error(error.response?.data?.message || "Failed to mark notification as read");
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  try {
    await apiClient.patch('/notifications/mark-all-read');
  } catch (error: any) {
    console.error("Error marking all as read:", error);
    throw new Error(error.response?.data?.message || "Failed to mark all as read");
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    throw new Error(error.response?.data?.message || "Failed to delete notification");
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead(): Promise<void> {
  try {
    await apiClient.delete('/notifications/read/all');
  } catch (error: any) {
    console.error("Error deleting read notifications:", error);
    throw new Error(error.response?.data?.message || "Failed to delete read notifications");
  }
}
