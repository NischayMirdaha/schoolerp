import { api } from './api';
import { PagedResult } from '../types/common';
import {
  CreateTeacherRequest,
  TeacherResponse,
  AddQualificationRequest,
  QualificationResponse,
  CreateStaffRequest,
  StaffResponse,
  AssignTeacherToSubjectRequest,
  TeacherAssignmentResponse,
  AssignClassTeacherRequest,
  ClassTeacherResponse,
  MarkTeacherAttendanceRequest,
  TeacherAttendanceResponse,
  TeacherAttendanceSummaryResponse,
} from '../types/staff';

export const StaffService = {
  // ── Teachers ────────────────────────────────────────────────────────────
  async listTeachers(searchTerm?: string, activeOnly?: boolean, page = 1, pageSize = 10): Promise<PagedResult<TeacherResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (searchTerm) params.set('searchTerm', searchTerm);
    if (activeOnly !== undefined) params.set('activeOnly', String(activeOnly));
    return api.request<PagedResult<TeacherResponse>>(`/teachers?${params.toString()}`);
  },
  async getTeacher(teacherId: number): Promise<TeacherResponse> {
    return api.request<TeacherResponse>(`/teachers/${teacherId}`);
  },
  async createTeacher(request: CreateTeacherRequest): Promise<TeacherResponse> {
    return api.request<TeacherResponse>('/teachers', { method: 'POST', body: JSON.stringify(request) });
  },
  async addQualification(teacherId: number, request: AddQualificationRequest): Promise<QualificationResponse> {
    return api.request<QualificationResponse>(`/teachers/${teacherId}/qualifications`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // ── Non-Teaching Staff ──────────────────────────────────────────────────
  async createStaff(request: CreateStaffRequest): Promise<StaffResponse> {
    return api.request<StaffResponse>('/staff', { method: 'POST', body: JSON.stringify(request) });
  },

  // ── Assignments ─────────────────────────────────────────────────────────
  async listTeacherAssignments(academicYearId: number, teacherId?: number, classId?: number): Promise<TeacherAssignmentResponse[]> {
    const params = new URLSearchParams({ academicYearId: String(academicYearId) });
    if (teacherId) params.set('teacherId', String(teacherId));
    if (classId) params.set('classId', String(classId));
    return api.request<TeacherAssignmentResponse[]>(`/teachers/assignments?${params.toString()}`);
  },
  async assignTeacherToSubject(request: AssignTeacherToSubjectRequest): Promise<TeacherAssignmentResponse> {
    return api.request<TeacherAssignmentResponse>('/teachers/assignments', { method: 'POST', body: JSON.stringify(request) });
  },
  async unassignTeacherFromSubject(assignmentId: number): Promise<void> {
    return api.request<void>(`/teachers/assignments/${assignmentId}`, { method: 'DELETE' });
  },
  async listClassTeachers(academicYearId: number): Promise<ClassTeacherResponse[]> {
    return api.request<ClassTeacherResponse[]>(`/class-teachers?academicYearId=${academicYearId}`);
  },
  async assignClassTeacher(request: AssignClassTeacherRequest): Promise<ClassTeacherResponse> {
    return api.request<ClassTeacherResponse>('/class-teachers', { method: 'POST', body: JSON.stringify(request) });
  },
  async unassignClassTeacher(id: number): Promise<void> {
    return api.request<void>(`/class-teachers/${id}`, { method: 'DELETE' });
  },

  // ── Teacher Attendance ──────────────────────────────────────────────────
  async markTeacherAttendance(request: MarkTeacherAttendanceRequest): Promise<TeacherAttendanceResponse> {
    return api.request<TeacherAttendanceResponse>('/teachers/attendance', { method: 'POST', body: JSON.stringify(request) });
  },
  async getTeacherAttendanceSummary(year: number, month: number): Promise<TeacherAttendanceSummaryResponse> {
    return api.request<TeacherAttendanceSummaryResponse>(`/teachers/attendance/summary?year=${year}&month=${month}`);
  },

  async setTeacherStatus(teacherId: number, isActive: boolean): Promise<TeacherResponse> {
    return api.request<TeacherResponse>(`/teachers/${teacherId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  async deleteQualification(teacherId: number, qualificationId: number): Promise<void> {
    return api.request<void>(`/teachers/${teacherId}/qualifications/${qualificationId}`, {
      method: 'DELETE',
    });
  },

  async setStaffStatus(staffId: number, isActive: boolean): Promise<StaffResponse> {
    return api.request<StaffResponse>(`/staff/${staffId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },
};
