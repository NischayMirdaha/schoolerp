import { api } from './api';
import { MessageResponse, PagedResult } from '../types/common';
import {
  EnrollStudentRequest,
  UpdateStudentRequest,
  TransferStudentRequest,
  StudentResponse,
} from '../types/student';
import {
  CreatePromotionMappingRequest,
  PromotionMappingResponse,
  BulkPromoteStudentsRequest,
  BulkPromotionResultResponse,
  EnrollOptionalSubjectRequest,
  OptionalSubjectResponse,
  PromotionPreviewResponse,
} from '../types/promotion';

export const StudentAdminService = {
  async listStudents(
    filters: { classId?: number; sectionId?: number; status?: string; searchTerm?: string } = {},
    page = 1,
    pageSize = 10
  ): Promise<PagedResult<StudentResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters.classId) params.set('classId', String(filters.classId));
    if (filters.sectionId) params.set('sectionId', String(filters.sectionId));
    if (filters.status) params.set('status', filters.status);
    if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
    return api.request<PagedResult<StudentResponse>>(`/students?${params.toString()}`);
  },

  async getStudent(studentId: number): Promise<StudentResponse> {
    return api.request<StudentResponse>(`/students/${studentId}`);
  },

  async enrollStudent(request: EnrollStudentRequest): Promise<StudentResponse> {
    return api.request<StudentResponse>('/students', { method: 'POST', body: JSON.stringify(request) });
  },

  async updateStudent(studentId: number, request: UpdateStudentRequest): Promise<MessageResponse> {
    return api.request<MessageResponse>(`/students/${studentId}`, { method: 'PUT', body: JSON.stringify(request) });
  },

  async transferStudent(studentId: number, request: TransferStudentRequest): Promise<MessageResponse> {
    return api.request<MessageResponse>(`/students/${studentId}/transfer`, { method: 'PUT', body: JSON.stringify(request) });
  },

  async deactivateStudent(studentId: number): Promise<MessageResponse> {
    return api.request<MessageResponse>(`/students/${studentId}/deactivate`, { method: 'PUT' });
  },

  async enrollOptionalSubject(studentId: number, request: EnrollOptionalSubjectRequest): Promise<OptionalSubjectResponse> {
    return api.request<OptionalSubjectResponse>(`/students/${studentId}/optional-subjects`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async createPromotionMapping(request: CreatePromotionMappingRequest): Promise<PromotionMappingResponse> {
    return api.request<PromotionMappingResponse>('/promotion/mappings', { method: 'POST', body: JSON.stringify(request) });
  },
  
  /** FIX (#13): list mappings for the picker — GET /api/promotion/mappings (was never called). */
  async listPromotionMappings(academicYearFromId?: number, academicYearToId?: number): Promise<PromotionMappingResponse[]> {
    const params = new URLSearchParams();
    if (academicYearFromId) params.set('academicYearFromId', String(academicYearFromId));
    if (academicYearToId) params.set('academicYearToId', String(academicYearToId));
    const qs = params.toString();
    return api.request<PromotionMappingResponse[]>(`/promotion/mappings${qs ? `?${qs}` : ''}`);
  },

  /** FIX (#13): preview a mapping — POST /api/promotion/mappings/{id}/preview. */
  async previewPromotion(mappingId: number, retainedStudentIds: number[] = []): Promise<PromotionPreviewResponse> {
    return api.request<PromotionPreviewResponse>(`/promotion/mappings/${mappingId}/preview`, {
      method: 'POST',
      body: JSON.stringify(retainedStudentIds),
    });
  },

  async bulkPromoteStudents(request: BulkPromoteStudentsRequest): Promise<BulkPromotionResultResponse> {
    return api.request<BulkPromotionResultResponse>('/promotion/bulk-promote', { method: 'POST', body: JSON.stringify(request) });
  },
};
