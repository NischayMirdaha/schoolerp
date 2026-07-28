import { api } from './api';
import { downloadAndOpenPdf } from './fileDownload';
import {
  StudentAttendanceReportRow,
  FeeCollectionReportRow,
  DailyCollectionReportRow,
  LibraryReportSummary,
  VisitorReportSummary,
  TransportTripReportSummary,
} from '../types/reports';

export const reportService = {
  // ── Attendance Reports ──────────────────────────────────────────────────
  async getStudentAttendanceReport(classId?: number, sectionId?: number, fromDate?: string, toDate?: string): Promise<StudentAttendanceReportRow[]> {
    const params = new URLSearchParams();
    if (classId) params.set('classId', String(classId));
    if (sectionId) params.set('sectionId', String(sectionId));
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);

    return api.request<StudentAttendanceReportRow[]>(`/reports/student-attendance?${params.toString()}`);
  },

  // ── Financial Reports ───────────────────────────────────────────────────
  async getFeeCollectionReport(academicYearId?: number): Promise<FeeCollectionReportRow[]> {
    const params = new URLSearchParams();
    if (academicYearId) params.set('academicYearId', String(academicYearId));

    return api.request<FeeCollectionReportRow[]>(`/reports/fee-collection?${params.toString()}`);
  },

  async getDailyCollectionReport(date?: string): Promise<DailyCollectionReportRow[]> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);

    return api.request<DailyCollectionReportRow[]>(`/reports/daily-collection?${params.toString()}`);
  },

  // ── Operations Reports ──────────────────────────────────────────────────
  async getLibraryReport(): Promise<LibraryReportSummary> {
    return api.request<LibraryReportSummary>('/reports/library');
  },

  async getVisitorLogReport(fromDate?: string, toDate?: string): Promise<VisitorReportSummary> {
    const params = new URLSearchParams();
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);

    return api.request<VisitorReportSummary>(`/reports/visitor-logs?${params.toString()}`);
  },

  async getTransportTripReport(routeId?: number): Promise<TransportTripReportSummary> {
    const params = new URLSearchParams();
    if (routeId) params.set('routeId', String(routeId));

    return api.request<TransportTripReportSummary>(`/reports/transport-trips?${params.toString()}`);
  },

  /**
   * Downloads an authenticated PDF export and opens the OS share sheet.
   *
   * FIX (#6): the previous `openReportInBrowser` hardcoded `http://localhost:5265/api`
   * and handed the URL to an external browser, which has no access to the access token
   * in SecureStore — every call 401'd. This now reuses the resolved API base URL and
   * sends the Bearer token.
   */
  async downloadReportPdf(endpointPath: string, fileName: string): Promise<string> {
    return downloadAndOpenPdf(endpointPath, fileName);
  },
};