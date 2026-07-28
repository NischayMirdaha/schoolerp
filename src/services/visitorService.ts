import { api } from './api';
import { PagedResult } from '../types/common';
import {
  CreateVisitorLogRequest,
  CreateGroupVisitorLogRequest,
  UpdateVisitorLogRequest,
  VisitorLogResponse,
  GroupVisitorLogResponse,
} from '../types/visitor';

export const visitorService = {
  /**
   * Create single visitor log
   */
  async createVisitorLog(request: CreateVisitorLogRequest): Promise<VisitorLogResponse> {
    return api.request<VisitorLogResponse>('/visitor-logs', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Create transactional group visitor log
   */
  async createGroupVisitorLog(request: CreateGroupVisitorLogRequest): Promise<GroupVisitorLogResponse> {
    return api.request<GroupVisitorLogResponse>('/visitor-logs/group', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Search and list visitor logs
   */
  async listVisitorLogs(
    search?: string,
    isOpen?: boolean,
    fromDate?: string,
    toDate?: string,
    page = 1,
    pageSize = 20
  ): Promise<PagedResult<VisitorLogResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    if (isOpen !== undefined) params.set('isOpen', String(isOpen));
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);

    return api.request<PagedResult<VisitorLogResponse>>(`/visitor-logs?${params.toString()}`);
  },

  /**
   * Get visitor log detail
   */
  async getVisitorLogDetail(id: number): Promise<VisitorLogResponse> {
    return api.request<VisitorLogResponse>(`/visitor-logs/${id}`);
  },

  /**
   * Update open visitor log
   */
  async updateVisitorLog(id: number, request: UpdateVisitorLogRequest): Promise<VisitorLogResponse> {
    return api.request<VisitorLogResponse>(`/visitor-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  /**
   * Mark individual visitor departure exit
   */
  async markVisitorExit(id: number, outTime?: string): Promise<VisitorLogResponse> {
    return api.request<VisitorLogResponse>(`/visitor-logs/${id}/exit`, {
      method: 'POST',
      body: JSON.stringify({ outTime }),
    });
  },

  /**
   * Mark entire group departure exit
   */
  async markGroupExit(groupId: string, outTime?: string): Promise<GroupVisitorLogResponse> {
    return api.request<GroupVisitorLogResponse>(`/visitor-logs/group/${groupId}/exit`, {
      method: 'POST',
      body: JSON.stringify({ outTime }),
    });
  },
};