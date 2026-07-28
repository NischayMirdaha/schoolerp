import { api } from './api';
import { PagedResult } from '../types/common';
import {
  CreateHomeworkRequest,
  UpdateHomeworkRequest,
  HomeworkResponse,
  HomeworkDetailResponse,
  MarkHomeworkDoneRequest,
} from '../types/homework';

export const homeworkService = {
  async createHomework(request: CreateHomeworkRequest): Promise<HomeworkResponse> {
    return api.request<HomeworkResponse>('/homework', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async listTeacherHomework(page = 1, pageSize = 20): Promise<PagedResult<HomeworkResponse>> {
    return api.request<PagedResult<HomeworkResponse>>(`/homework/teacher?page=${page}&pageSize=${pageSize}`);
  },

  async listMyHomework(page = 1, pageSize = 20): Promise<PagedResult<HomeworkResponse>> {
    return api.request<PagedResult<HomeworkResponse>>(`/homework/my-assignments?page=${page}&pageSize=${pageSize}`);
  },

  async listChildHomework(studentId: number, page = 1, pageSize = 20): Promise<PagedResult<HomeworkResponse>> {
    return api.request<PagedResult<HomeworkResponse>>(
      `/homework/child-assignments?studentId=${studentId}&page=${page}&pageSize=${pageSize}`
    );
  },

  async getHomeworkDetail(id: number): Promise<HomeworkDetailResponse> {
    return api.request<HomeworkDetailResponse>(`/homework/${id}`);
  },

  async updateHomework(id: number, request: UpdateHomeworkRequest): Promise<HomeworkResponse> {
    return api.request<HomeworkResponse>(`/homework/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async deleteHomework(id: number): Promise<void> {
    return api.request<void>(`/homework/${id}`, { method: 'DELETE' });
  },

  async markHomeworkDone(id: number, request: MarkHomeworkDoneRequest): Promise<void> {
    return api.request<void>(`/homework/${id}/mark-done`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};