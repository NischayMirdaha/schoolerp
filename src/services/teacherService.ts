import { api } from './api';
import { TeacherResponse, MyTeacherAssignmentsResponse } from '../types/staff';
import { UpdateUserProfileRequest, UserProfileResponse } from '../types/profile';

/** Teacher role self-service ("me") calls. */
export const TeacherService = {
  async getMyProfile(): Promise<TeacherResponse> {
    return api.request<TeacherResponse>('/teachers/me');
  },
  async getMyAssignments(academicYearId?: number): Promise<MyTeacherAssignmentsResponse> {
    const qs = academicYearId ? `?academicYearId=${academicYearId}` : '';
    return api.request<MyTeacherAssignmentsResponse>(`/teachers/me/assignments${qs}`);
  },
  /**
   * Update the logged-in teacher's own profile.
   * FIX (#9): the backend has NO PUT /api/teachers/me — self-service profile
   * updates for ALL roles (teacher included) go through PUT /api/profile,
   * which returns the updated UserProfileResponse.
   */
  async updateMyProfile(data: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    return api.request<UserProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};