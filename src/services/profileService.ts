import { api } from './api';
import {
  UserProfileResponse,
  UpdateUserProfileRequest,
  UploadProfilePicResponse,
} from '../types/profile';

export const profileService = {
  /**
   * Get authenticated user profile
   */
  async getUserProfile(): Promise<UserProfileResponse> {
    return api.request<UserProfileResponse>('/profile');
  },

  /**
   * Update allowed profile fields
   */
  async updateUserProfile(data: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    return api.request<UserProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload user profile photo
   */
  async uploadProfilePic(fileUri: string): Promise<UploadProfilePicResponse> {
    const formData = new FormData();
    const fileName = fileUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(fileName);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type,
    } as any);

    return api.request<UploadProfilePicResponse>('/profile/photo', {
      method: 'POST',
      body: formData,
    });
  },
};