import { api } from './api';
import { PagedResult } from '../types/common';
import {
  CreateEventRequest,
  UpdateEventRequest,
  EventResponse,
} from '../types/event';

export const eventService = {
  /**
   * List calendar events
   */
  async listEvents(fromDate?: string, toDate?: string, page = 1, pageSize = 20): Promise<PagedResult<EventResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);

    return api.request<PagedResult<EventResponse>>(`/events?${params.toString()}`);
  },

  /**
   * Get event details
   */
  async getEventDetail(id: number): Promise<EventResponse> {
    return api.request<EventResponse>(`/events/${id}`);
  },

  /**
   * Create school calendar event (Principal)
   */
  async createEvent(request: CreateEventRequest): Promise<EventResponse> {
    return api.request<EventResponse>('/events', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Update event
   */
  async updateEvent(id: number, request: UpdateEventRequest): Promise<EventResponse> {
    return api.request<EventResponse>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  /**
   * Delete event
   */
  async deleteEvent(id: number): Promise<void> {
    return api.request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};