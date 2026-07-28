export interface PeriodResponse {
  id: number;
  schoolId: number;
  periodNo: number;
  startTime: string; // "09:00:00"
  endTime: string;   // "09:45:00"
  isTeaching: boolean;
  label?: string | null;
  createdAt: string;
}

export interface CreatePeriodRequest {
  periodNo: number;
  startTime: string;
  endTime: string;
  isTeaching: boolean;
  label?: string | null;
}

export interface UpdatePeriodRequest {
  periodNo?: number;
  startTime?: string;
  endTime?: string;
  isTeaching?: boolean;
  label?: string | null;
}

export interface TimetableEntryResponse {
  id: number;
  schoolId: number;
  academicYearId: number;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  dayOfWeek: number; // 1 = Mon ... 7 = Sun
  periodId: number;
  periodNo: number;
  startTime: string;
  endTime: string;
  isTeaching: boolean;
  periodLabel?: string | null;
  subjectId?: number | null;
  subjectName?: string | null;
  teacherId?: number | null;
  teacherName?: string | null;
  createdAt: string;
}

export interface CreateTimetableEntryRequest {
  academicYearId: number;
  classId: number;
  sectionId?: number | null;
  dayOfWeek: number;
  periodId: number;
  subjectId?: number | null;
  teacherId?: number | null;
}

export interface UpdateTimetableEntryRequest {
  subjectId?: number | null;
  teacherId?: number | null;
}