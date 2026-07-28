export interface TeacherScheduledPeriodResponse {
  timetableEntryId: number;
  periodId: number;
  periodNo: number;
  startTime: string;
  endTime: string;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  subjectId?: number | null;
  subjectName?: string | null;
  /** BE field: ScheduledPeriodResponse.IsAttendanceMarked (was wrongly 'isMarked') */
  isAttendanceMarked: boolean;
}

export interface AttendanceSheetStudentDto {
  studentId: number;
  studentName: string;
  /** BE field: AdmissionNumber (was wrongly 'admissionNo') */
  admissionNumber: string;
  /** BE field: RollNumber (was wrongly 'rollNo') */
  rollNumber?: string | null;
  /** 'unmarked' = sheet loaded but attendance not saved yet (BE default) */
  status: 'present' | 'absent' | 'unmarked';
  remarks?: string | null;
}

export interface AttendanceSheetResponse {
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  date: string;
  periodId: number;
  periodNo: number;
  startTime: string;
  endTime: string;
  subjectId?: number | null;
  subjectName?: string | null;
  isMarked: boolean;
  /** BE field: Records (was wrongly 'students') */
  records: AttendanceSheetStudentDto[];
}

export interface StudentAttendanceItemDto {
  studentId: number;
  status: 'present' | 'absent';
  remarks?: string | null;
}

export interface MarkStudentAttendanceRequest {
  classId: number;
  sectionId?: number | null;
  date: string;
  periodId: number;
  subjectId?: number | null;
  /** BE field: Records — was 'attendances' (root cause of every submit failing) */
  records: StudentAttendanceItemDto[];
}

export interface DailyAttendanceDetailDto {
  date: string;
  totalPeriods: number;
  presentPeriods: number;
  absentPeriods: number;
  /** Backend emits exactly 'present' or 'absent' */
  overallStatus: string;
}

/**
 * Mirrors backend AttendanceSummaryResponse:
 *   (StudentId, StudentName, TotalDays, PresentDays, AbsentDays, AttendancePercentage, Details)
 *
 * FIXED (#8): removed `admissionNo` — the backend NEVER sends it (screens that
 * rendered it showed "undefined"). `details` is always sent, so it is required now.
 */
export interface StudentAttendanceSummaryResponse {
  studentId: number;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
  /** Per-day breakdown, newest first */
  details: DailyAttendanceDetailDto[];
}