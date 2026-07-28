import { api } from './api';
import {
  TeacherScheduledPeriodResponse,
  AttendanceSheetResponse,
  MarkStudentAttendanceRequest,
  StudentAttendanceSummaryResponse,
} from '../types/attendance';

export const attendanceService = {
  /**
   * Periods the authenticated teacher is scheduled to teach on a given date.
   */
  async getTeacherScheduledPeriods(date: string): Promise<TeacherScheduledPeriodResponse[]> {
    return api.request<TeacherScheduledPeriodResponse[]>(
      `/attendance/teacher/scheduled-periods?date=${date}`
    );
  },

  /**
   * Attendance sheet roster for a specific class/section/period/date.
   */
  async getAttendanceSheet(
    classId: number,
    date: string,
    periodId: number,
    sectionId?: number
  ): Promise<AttendanceSheetResponse> {
    const params = new URLSearchParams({
      classId: String(classId),
      date,
      periodId: String(periodId),
    });
    if (sectionId) params.set('sectionId', String(sectionId));

    return api.request<AttendanceSheetResponse>(`/attendance/sheet?${params.toString()}`);
  },

  /**
   * Save a period's attendance sheet.
   */
  async markStudentAttendance(request: MarkStudentAttendanceRequest): Promise<void> {
    return api.request<void>('/attendance/sheet', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getStudentAttendanceSummary(
    studentId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StudentAttendanceSummaryResponse> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const qs = params.toString();
    return api.request<StudentAttendanceSummaryResponse>(
      `/attendance/students/${studentId}/summary${qs ? `?${qs}` : ''}`
    );
  },

  /**
   * Authenticated student's own attendance summary.
   */
  async getMyAttendanceSummary(
    startDate?: string,
    endDate?: string
  ): Promise<StudentAttendanceSummaryResponse> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const qs = params.toString();
    return api.request<StudentAttendanceSummaryResponse>(
      `/attendance/my-summary${qs ? `?${qs}` : ''}`
    );
  },
};