import { api } from './api';
import {
  CreateDefaultClassRequest,
  DefaultClassResponse,
  CreateDefaultGradingScaleRequest,
  DefaultGradingScaleResponse,
} from '../types/school';

export const GlobalSettingsService = {
  async listDefaultClasses(): Promise<DefaultClassResponse[]> {
    return api.request<DefaultClassResponse[]>('/super-admin/global-settings/classes');
  },

  async createDefaultClass(request: CreateDefaultClassRequest): Promise<DefaultClassResponse> {
    return api.request<DefaultClassResponse>('/super-admin/global-settings/classes', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async deleteDefaultClass(id: number): Promise<void> {
    return api.request<void>(`/super-admin/global-settings/classes/${id}`, { method: 'DELETE' });
  },

  async listDefaultGradingScales(): Promise<DefaultGradingScaleResponse[]> {
    return api.request<DefaultGradingScaleResponse[]>('/super-admin/global-settings/grading-scales');
  },

  async createDefaultGradingScale(request: CreateDefaultGradingScaleRequest): Promise<DefaultGradingScaleResponse> {
    return api.request<DefaultGradingScaleResponse>('/super-admin/global-settings/grading-scales', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async deleteDefaultGradingScale(id: number): Promise<void> {
    return api.request<void>(`/super-admin/global-settings/grading-scales/${id}`, { method: 'DELETE' });
  },
};
