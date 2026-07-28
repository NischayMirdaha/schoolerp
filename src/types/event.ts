export interface CreateEventRequest {
  title: string;
  description?: string | null;
  eventDate: string; // YYYY-MM-DD
  endDate?: string | null;
  eventTime?: string | null; // HH:MM
  venue?: string | null;
  targetType: 'school' | 'class';
  targetClassId?: number | null;
}

export interface UpdateEventRequest {
  title?: string | null;
  description?: string | null;
  eventDate?: string | null;
  endDate?: string | null;
  eventTime?: string | null;
  venue?: string | null;
  targetType?: string | null;
  targetClassId?: number | null;
}

export interface EventResponse {
  id: number;
  schoolId: number;
  title: string;
  description?: string | null;
  eventDate: string;
  endDate?: string | null;
  eventTime?: string | null;
  venue?: string | null;
  targetType: string;
  targetClassId?: number | null;
  targetClassName?: string | null;
  createdBy?: number | null;
  createdByName?: string | null;
  createdAt: string;
}