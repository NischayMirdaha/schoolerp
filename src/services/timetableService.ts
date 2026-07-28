import { api } from './api';
import {
  PeriodResponse,
  CreatePeriodRequest,
  UpdatePeriodRequest,
  TimetableEntryResponse,
  CreateTimetableEntryRequest,
  UpdateTimetableEntryRequest,
} from '../types/timetable';

export const timetableService = {
  async listPeriods(): Promise<PeriodResponse[]> {
    return api.request<PeriodResponse[]>('/periods');
  },

  async createPeriod(request: CreatePeriodRequest): Promise<PeriodResponse> {
    return api.request<PeriodResponse>('/periods', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updatePeriod(id: number, request: UpdatePeriodRequest): Promise<PeriodResponse> {
    return api.request<PeriodResponse>(`/periods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async deletePeriod(id: number): Promise<void> {
    return api.request<void>(`/periods/${id}`, {
      method: 'DELETE',
    });
  },

  async listTimetable(
    academicYearId?: number,
    classId?: number,
    sectionId?: number
  ): Promise<TimetableEntryResponse[]> {
    const params = new URLSearchParams();
    if (academicYearId) params.set('academicYearId', String(academicYearId));
    if (classId) params.set('classId', String(classId));
    if (sectionId) params.set('sectionId', String(sectionId));

    return api.request<TimetableEntryResponse[]>(`/timetable?${params.toString()}`);
  },

  async getMyTimetable(): Promise<TimetableEntryResponse[]> {
    return api.request<TimetableEntryResponse[]>('/timetable/my-schedule');
  },

  async createTimetableEntry(request: CreateTimetableEntryRequest): Promise<TimetableEntryResponse> {
    return api.request<TimetableEntryResponse>('/timetable', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateTimetableEntry(id: number, request: UpdateTimetableEntryRequest): Promise<TimetableEntryResponse> {
    return api.request<TimetableEntryResponse>(`/timetable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async deleteTimetableEntry(id: number): Promise<void> {
    return api.request<void>(`/timetable/${id}`, {
      method: 'DELETE',
    });
  },
};