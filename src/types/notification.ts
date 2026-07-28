export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  body?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationPreferenceResponse {
  id: number;
  userId: number;
  category: string;
  emailEnabled: boolean;
  updatedAt: string;
}

export interface UpdateNotificationPreferenceRequest {
  category: string;
  emailEnabled: boolean;
}

export interface RegisterDeviceTokenRequest {
  platform: 'android' | 'ios';
  pushToken: string;
  deviceLabel?: string | null;
}

export interface DeviceTokenResponse {
  id: number;
  userId: number;
  platform: string;
  pushToken: string;
  deviceLabel?: string | null;
  isActive: boolean;
  createdAt: string;
}