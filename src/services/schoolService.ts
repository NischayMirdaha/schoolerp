import { api } from './api';
import { PagedResult } from '../types/common';
import {
  CreateSchoolRequest,
  UpdateSchoolRequest,
  SchoolResponse,
  CrossSchoolDashboardResponse,
  CreatePrincipalRequest,
  UpdatePrincipalRequest,
  PrincipalResponse,
} from '../types/school';

export const SchoolService = {
  async listSchools(searchTerm?: string, page = 1, pageSize = 10): Promise<PagedResult<SchoolResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (searchTerm) params.set('searchTerm', searchTerm);
    return api.request<PagedResult<SchoolResponse>>(`/super-admin/schools?${params.toString()}`);
  },

  async getSchool(id: number): Promise<SchoolResponse> {
    return api.request<SchoolResponse>(`/super-admin/schools/${id}`);
  },

  async createSchool(request: CreateSchoolRequest): Promise<SchoolResponse> {
    return api.request<SchoolResponse>('/super-admin/schools', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateSchool(id: number, request: UpdateSchoolRequest): Promise<SchoolResponse> {
    return api.request<SchoolResponse>(`/super-admin/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async toggleSchoolActive(id: number): Promise<void> {
    return api.request<void>(`/super-admin/schools/${id}/toggle-active`, { method: 'POST' });
  },

  async deleteSchool(id: number): Promise<void> {
    return api.request<void>(`/super-admin/schools/${id}`, { method: 'DELETE' });
  },

  async getCrossSchoolStats(): Promise<CrossSchoolDashboardResponse> {
    return api.request<CrossSchoolDashboardResponse>('/super-admin/dashboard/stats');
  },

  async getPrincipal(schoolId: number): Promise<PrincipalResponse> {
    return api.request<PrincipalResponse>(`/super-admin/schools/${schoolId}/principal`);
  },

  async createPrincipal(schoolId: number, request: CreatePrincipalRequest): Promise<PrincipalResponse> {
    return api.request<PrincipalResponse>(`/super-admin/schools/${schoolId}/principal`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updatePrincipal(schoolId: number, request: UpdatePrincipalRequest): Promise<PrincipalResponse> {
    return api.request<PrincipalResponse>(`/super-admin/schools/${schoolId}/principal`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async deletePrincipal(schoolId: number): Promise<void> {
    return api.request<void>(`/super-admin/schools/${schoolId}/principal`, { method: 'DELETE' });
  },

  async uploadSchoolBranding(schoolId: number, category: 'logo' | 'qr' | 'signature' | 'seal', fileUri: string): Promise<{ path: string }> {
    const formData = new FormData();
    const fileName = fileUri.split('/').pop() || `${category}.jpg`;
    const match = /\.(\w+)$/.exec(fileName);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type,
    } as any);

    return api.request<{ path: string }>(`/schools/${schoolId}/branding/${category}`, {
      method: 'POST',
      body: formData,
    });
  },
};