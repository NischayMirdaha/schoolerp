import { api } from './api';
import {
  CreateAcademicYearRequest,
  AcademicYearResponse,
  CreateClassRequest,
  UpdateClassRequest,
  ReorderClassRequest,
  ClassResponse,
  CreateSectionRequest,
  UpdateSectionRequest,
  SectionResponse,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  SubjectResponse,
  AssignSubjectToClassRequest,
  ClassSubjectResponse,
  CreateGradingScaleRequest,
  GradingScaleResponse,
  CreateExamRequest,
  UpdateExamRequest,
  ExamResponse,
  CreateExamScheduleRequest,
  UpdateExamScheduleRequest,
  ExamScheduleResponse,
} from '../types/academic';

export const AcademicService = {
  // ── Academic Years ──────────────────────────────────────────────────────
  async listAcademicYears(): Promise<AcademicYearResponse[]> {
    return api.request<AcademicYearResponse[]>('/academic-years');
  },
  async createAcademicYear(request: CreateAcademicYearRequest): Promise<AcademicYearResponse> {
    return api.request<AcademicYearResponse>('/academic-years', { method: 'POST', body: JSON.stringify(request) });
  },
  async setCurrentAcademicYear(id: number): Promise<void> {
    return api.request<void>(`/academic-years/${id}/set-current`, { method: 'POST' });
  },
  async archiveAcademicYear(id: number): Promise<void> {
    return api.request<void>(`/academic-years/${id}/archive`, { method: 'POST' });
  },

  // ── Classes ─────────────────────────────────────────────────────────────
  async listClasses(): Promise<ClassResponse[]> {
    return api.request<ClassResponse[]>('/classes');
  },
  async createClass(request: CreateClassRequest): Promise<ClassResponse> {
    return api.request<ClassResponse>('/classes', { method: 'POST', body: JSON.stringify(request) });
  },
  async updateClass(id: number, request: UpdateClassRequest): Promise<ClassResponse> {
    return api.request<ClassResponse>(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(request) });
  },
  async deleteClass(id: number): Promise<void> {
    return api.request<void>(`/classes/${id}`, { method: 'DELETE' });
  },
  async reorderClass(request: ReorderClassRequest): Promise<void> {
    return api.request<void>('/classes/reorder', { method: 'POST', body: JSON.stringify(request) });
  },

  // ── Sections ────────────────────────────────────────────────────────────
  async listSections(classId?: number): Promise<SectionResponse[]> {
    const qs = classId ? `?classId=${classId}` : '';
    return api.request<SectionResponse[]>(`/sections${qs}`);
  },
  async createSection(request: CreateSectionRequest): Promise<SectionResponse> {
    return api.request<SectionResponse>('/sections', { method: 'POST', body: JSON.stringify(request) });
  },
  async updateSection(id: number, request: UpdateSectionRequest): Promise<SectionResponse> {
    return api.request<SectionResponse>(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(request) });
  },
  async deleteSection(id: number): Promise<void> {
    return api.request<void>(`/sections/${id}`, { method: 'DELETE' });
  },

  // ── Subjects ────────────────────────────────────────────────────────────
  async listSubjects(): Promise<SubjectResponse[]> {
    return api.request<SubjectResponse[]>('/subjects');
  },
  async createSubject(request: CreateSubjectRequest): Promise<SubjectResponse> {
    return api.request<SubjectResponse>('/subjects', { method: 'POST', body: JSON.stringify(request) });
  },
  async updateSubject(id: number, request: UpdateSubjectRequest): Promise<SubjectResponse> {
    return api.request<SubjectResponse>(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(request) });
  },
  async deleteSubject(id: number): Promise<void> {
    return api.request<void>(`/subjects/${id}`, { method: 'DELETE' });
  },
  async listClassSubjects(classId: number): Promise<ClassSubjectResponse[]> {
    return api.request<ClassSubjectResponse[]>(`/subjects/class/${classId}`);
  },
  async assignSubjectToClass(request: AssignSubjectToClassRequest): Promise<ClassSubjectResponse> {
    return api.request<ClassSubjectResponse>('/subjects/assign', { method: 'POST', body: JSON.stringify(request) });
  },
  async unassignSubjectFromClass(classSubjectId: number): Promise<void> {
    return api.request<void>(`/subjects/assign/${classSubjectId}`, { method: 'DELETE' });
  },

  // ── Grading Scales ──────────────────────────────────────────────────────
  async listGradingScales(): Promise<GradingScaleResponse[]> {
    return api.request<GradingScaleResponse[]>('/grading-scales');
  },
  async createGradingScale(request: CreateGradingScaleRequest): Promise<GradingScaleResponse> {
    return api.request<GradingScaleResponse>('/grading-scales', { method: 'POST', body: JSON.stringify(request) });
  },
  async deleteGradingScale(id: number): Promise<void> {
    return api.request<void>(`/grading-scales/${id}`, { method: 'DELETE' });
  },

  // ── Exams ───────────────────────────────────────────────────────────────
  async listExams(academicYearId?: number): Promise<ExamResponse[]> {
    const qs = academicYearId ? `?academicYearId=${academicYearId}` : '';
    return api.request<ExamResponse[]>(`/exams${qs}`);
  },
  async createExam(request: CreateExamRequest): Promise<ExamResponse> {
    return api.request<ExamResponse>('/exams', { method: 'POST', body: JSON.stringify(request) });
  },
  async updateExam(id: number, request: UpdateExamRequest): Promise<ExamResponse> {
    return api.request<ExamResponse>(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(request) });
  },
  async deleteExam(id: number): Promise<void> {
    return api.request<void>(`/exams/${id}`, { method: 'DELETE' });
  },
  async listExamSchedules(examId: number): Promise<ExamScheduleResponse[]> {
    return api.request<ExamScheduleResponse[]>(`/exams/${examId}/schedules`);
  },
  async createExamSchedule(examId: number, request: CreateExamScheduleRequest): Promise<ExamScheduleResponse> {
    return api.request<ExamScheduleResponse>(`/exams/${examId}/schedules`, { method: 'POST', body: JSON.stringify(request) });
  },
  async updateExamSchedule(id: number, request: UpdateExamScheduleRequest): Promise<ExamScheduleResponse> {
    return api.request<ExamScheduleResponse>(`/exams/schedules/${id}`, { method: 'PUT', body: JSON.stringify(request) });
  },
  async deleteExamSchedule(id: number): Promise<void> {
    return api.request<void>(`/exams/schedules/${id}`, { method: 'DELETE' });
  },
};
