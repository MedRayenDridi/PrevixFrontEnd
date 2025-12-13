import { api } from './api';

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(skip = 0, limit = 50, unreadOnly = false) {
    const response = await api.get('/notifications/', {
      params: { skip, limit, unread_only: unreadOnly }
    });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.unread_count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    const response = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Delete all notifications
   */
  async deleteAllNotifications() {
    const response = await api.delete('/notifications/');
    return response.data;
  }
};



