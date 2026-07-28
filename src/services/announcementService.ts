import { api } from './api';
import { PagedResult } from '../types/common';
import {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementResponse,
} from '../types/announcement';

export const announcementService = {
  /**
   * List announcements for authenticated user role
   */
  async listAnnouncements(includeHistorical = false, page = 1, pageSize = 20): Promise<PagedResult<AnnouncementResponse>> {
    return api.request<PagedResult<AnnouncementResponse>>(
      `/announcements?includeHistorical=${includeHistorical}&page=${page}&pageSize=${pageSize}`
    );
  },

  /**
   * Get single announcement details
   */
  async getAnnouncementDetail(id: number): Promise<AnnouncementResponse> {
    return api.request<AnnouncementResponse>(`/announcements/${id}`);
  },

  /**
   * Create targeted announcement (Principal / Teacher)
   */
  async createAnnouncement(request: CreateAnnouncementRequest): Promise<AnnouncementResponse> {
    return api.request<AnnouncementResponse>('/announcements', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Update announcement
   */
  async updateAnnouncement(id: number, request: UpdateAnnouncementRequest): Promise<AnnouncementResponse> {
    return api.request<AnnouncementResponse>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: number): Promise<void> {
    return api.request<void>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};