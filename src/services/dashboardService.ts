import { api } from './api';
import {
  PrincipalDashboardResponse,
  AccountantDashboardResponse,
  TeacherDashboardResponse,
  ReceptionDashboardResponse,
  LibrarianDashboardResponse,
  TransportDashboardResponse,
  StudentDashboardResponse,
  ParentChildDashboardResponse,
} from '../types/dashboard';

export const dashboardService = {
  async getPrincipalDashboard(): Promise<PrincipalDashboardResponse> {
    return api.request<PrincipalDashboardResponse>('/dashboards/principal');
  },

  async getAccountantDashboard(): Promise<AccountantDashboardResponse> {
    return api.request<AccountantDashboardResponse>('/dashboards/accountant');
  },

  async getTeacherDashboard(): Promise<TeacherDashboardResponse> {
    return api.request<TeacherDashboardResponse>('/dashboards/teacher');
  },

  async getReceptionDashboard(): Promise<ReceptionDashboardResponse> {
    return api.request<ReceptionDashboardResponse>('/dashboards/reception');
  },

  async getLibrarianDashboard(): Promise<LibrarianDashboardResponse> {
    return api.request<LibrarianDashboardResponse>('/dashboards/librarian');
  },

  async getTransportDashboard(): Promise<TransportDashboardResponse> {
    return api.request<TransportDashboardResponse>('/dashboards/transport');
  },

  async getStudentDashboard(): Promise<StudentDashboardResponse> {
    return api.request<StudentDashboardResponse>('/dashboards/student');
  },

  async getParentDashboard(): Promise<ParentChildDashboardResponse[]> {
    return api.request<ParentChildDashboardResponse[]>('/dashboards/parent');
  },
};