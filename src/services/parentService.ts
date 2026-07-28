import { api } from './api';
import { LinkedChildSummary, StudentResponse } from '../types/student';
import { MessageResponse } from '../types/common';

export interface UpdateParentProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  relation?: string;
  occupation?: string;
}

export interface ParentProfileResponse {
  id: number;
  userId?: number;
  schoolId: number;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  address?: string;
  relation: string;
  occupation?: string;
}

export const ParentService = {
  /**
   * Get children linked to authenticated parent
   */
  async getLinkedChildren(): Promise<LinkedChildSummary[]> {
    return api.request<LinkedChildSummary[]>('/parents/me/children');
  },

  /**
   * Get detailed profile for a specific linked child
   */
  async getChildDetails(studentId: number): Promise<StudentResponse> {
    return api.request<StudentResponse>(`/parents/me/children/${studentId}`);
  },

  /**
   * Parent self-update profile.
   * FIX (#10): PUT /api/parents/me returns `{ message }` — previously this was
   * mistyped as a full ParentProfileResponse object.
   */
  async updateOwnProfile(data: UpdateParentProfileRequest): Promise<MessageResponse> {
    return api.request<MessageResponse>('/parents/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};