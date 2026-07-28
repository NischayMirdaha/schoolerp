export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  targetType: 'school' | 'class' | 'section';
  targetClassId?: number | null;
  targetSectionId?: number | null;
  isImportant: boolean;
  startAt: string; // ISO String
  endAt: string;   // ISO String
}

export interface UpdateAnnouncementRequest {
  title?: string | null;
  body?: string | null;
  targetType?: string | null;
  targetClassId?: number | null;
  targetSectionId?: number | null;
  isImportant?: boolean | null;
  startAt?: string | null;
  endAt?: string | null;
}

export interface AnnouncementResponse {
  id: number;
  schoolId: number;
  title: string;
  body: string;
  targetType: string;
  targetClassId?: number | null;
  targetClassName?: string | null;
  targetSectionId?: number | null;
  targetSectionName?: string | null;
  isImportant: boolean;
  startAt: string;
  endAt: string;
  createdBy: number;
  createdByName?: string | null;
  createdAt: string;
}