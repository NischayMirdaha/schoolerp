import { api } from './api';
import { downloadAndOpenPdf } from './fileDownload';
import {
  ExamScheduleMarksGridResponse,
  SaveStudentMarksRequest,
  StudentResultSummaryRecordDto,
  StudentExamResultDetailResponse,
  ClassMeritRecordDto,
} from '../types/exam';

export const examService = {
  async getMarksGrid(examScheduleId: number): Promise<ExamScheduleMarksGridResponse> {
    return api.request<ExamScheduleMarksGridResponse>(`/exams/schedules/${examScheduleId}/marks`);
  },

  async saveStudentMarks(request: SaveStudentMarksRequest): Promise<void> {
    return api.request<void>(`/exams/schedules/${request.examScheduleId}/marks`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async publishExamSchedule(examScheduleId: number): Promise<void> {
    return api.request<void>(`/exams/schedules/${examScheduleId}/publish`, {
      method: 'POST',
    });
  },

  async getStudentExamResults(): Promise<StudentResultSummaryRecordDto[]> {
    return api.request<StudentResultSummaryRecordDto[]>('/exams/results/me');
  },

  async getStudentExamResultDetail(examId: number): Promise<StudentExamResultDetailResponse> {
    return api.request<StudentExamResultDetailResponse>(`/exams/results/me/${examId}`);
  },

  async getChildExamResults(studentId: number): Promise<StudentResultSummaryRecordDto[]> {
    return api.request<StudentResultSummaryRecordDto[]>(`/exams/results/child?studentId=${studentId}`);
  },

  async getChildExamResultDetail(examId: number, studentId: number): Promise<StudentExamResultDetailResponse> {
    return api.request<StudentExamResultDetailResponse>(`/exams/results/child/${examId}?studentId=${studentId}`);
  },

  async getClassMeritRank(examId: number, classId: number, sectionId?: number): Promise<ClassMeritRecordDto[]> {
    const params = new URLSearchParams({ classId: String(classId) });
    if (sectionId) params.set('sectionId', String(sectionId));

    return api.request<ClassMeritRecordDto[]>(`/exams/${examId}/merit?${params.toString()}`);
  },

  async downloadReportCard(examId: number, studentId?: number, examName?: string): Promise<string> {
    const path = studentId
      ? `/exams/${examId}/report-card/${studentId}`
      : `/exams/${examId}/report-card/me`;

    const label = examName ? examName : `exam-${examId}`;
    return downloadAndOpenPdf(path, `report-card-${label}.pdf`);
  },
};