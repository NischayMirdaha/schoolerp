import { api } from './api';
import { PagedResult } from '../types/common';
import {
  NotificationResponse,
  UnreadCountResponse,
  NotificationPreferenceResponse,
  UpdateNotificationPreferenceRequest,
  RegisterDeviceTokenRequest,
  DeviceTokenResponse,
} from '../types/notification';

export const notificationService = {
  /**
   * List in-app notifications
   */
  async listMyNotifications(unreadOnly?: boolean, page = 1, pageSize = 20): Promise<PagedResult<NotificationResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (unreadOnly !== undefined) params.set('unreadOnly', String(unreadOnly));

    return api.request<PagedResult<NotificationResponse>>(`/notifications?${params.toString()}`);
  },

  /**
   * Get unread notifications badge count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return api.request<UnreadCountResponse>('/notifications/unread-count');
  },

  /**
   * Mark single notification read
   */
  async markRead(id: number): Promise<NotificationResponse> {
    return api.request<NotificationResponse>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Mark all unread notifications read
   */
  async markAllRead(): Promise<void> {
    return api.request<void>('/notifications/read-all', {
      method: 'PUT',
    });
  },

  /**
   * Get email notification preferences
   */
  async getPreferences(): Promise<NotificationPreferenceResponse[]> {
    return api.request<NotificationPreferenceResponse[]>('/notifications/preferences');
  },

  /**
   * Update category email preference
   */
  async updatePreference(request: UpdateNotificationPreferenceRequest): Promise<NotificationPreferenceResponse> {
    return api.request<NotificationPreferenceResponse>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  /**
   * Register push device token
   */
  async registerDeviceToken(request: RegisterDeviceTokenRequest): Promise<DeviceTokenResponse> {
    return api.request<DeviceTokenResponse>('/notifications/device-tokens', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};