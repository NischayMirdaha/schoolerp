export interface CreateTeacherRequest {
  employeeId: string;
  username: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  dob?: string | null;
  joiningDate?: string | null;
  morningStart?: string | null;
  morningEnd?: string | null;
  afternoonStart?: string | null;
  afternoonEnd?: string | null;
}

export interface UpdateTeacherRequest {
  employeeId: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  dob?: string | null;
  joiningDate?: string | null;
  morningStart?: string | null;
  morningEnd?: string | null;
  afternoonStart?: string | null;
  afternoonEnd?: string | null;
}

export interface QualificationResponse {
  id: number;
  degree: string;
  institution: string | null;
  yearCompleted: number | null;
}

export interface TeacherResponse {
  teacherId: number;
  userId: number;
  schoolId: number;
  employeeId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  gender: string | null;
  dob: string | null;
  joiningDate: string | null;
  morningStart: string | null;
  morningEnd: string | null;
  afternoonStart: string | null;
  afternoonEnd: string | null;
  isActive: boolean;
  qualifications: QualificationResponse[];
  createdAt: string;
}

export interface AddQualificationRequest {
  degree: string;
  institution?: string | null;
  yearCompleted?: number | null;
}

// RoleId: 4 = Accountant, 5 = Reception, 6 = Librarian, 7 = TransportManager
export interface CreateStaffRequest {
  roleId: 4 | 5 | 6 | 7;
  employeeId: string;
  designation: string;
  username: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  dob?: string | null;
  joiningDate?: string | null;
}

export interface StaffResponse {
  staffProfileId: number;
  userId: number;
  schoolId: number;
  roleId: number;
  roleName: string;
  employeeId: string;
  designation: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AssignTeacherToSubjectRequest {
  academicYearId: number;
  teacherId: number;
  classId: number;
  sectionId?: number | null;
  subjectId: number;
}

export interface TeacherAssignmentResponse {
  id: number;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  sectionId: number | null;
  sectionName: string | null;
  subjectId: number;
  subjectName: string;
  academicYearId: number;
}

export interface AssignClassTeacherRequest {
  academicYearId: number;
  classId: number;
  sectionId?: number | null;
  teacherId: number;
}

export interface ClassTeacherResponse {
  id: number;
  academicYearId: number;
  classId: number;
  className: string;
  sectionId: number | null;
  sectionName: string | null;
  teacherId: number;
  teacherName: string;
}

export interface MyTeacherAssignmentsResponse {
  assignments: TeacherAssignmentResponse[];
  classTeacherOf: ClassTeacherResponse[];
}

export type TeacherAttendanceStatus = 'present' | 'absent' | 'half_day_am' | 'half_day_pm';

export interface MarkTeacherAttendanceRequest {
  teacherId: number;
  date: string;
  status: TeacherAttendanceStatus;
}

export interface TeacherAttendanceResponse {
  id: number;
  teacherId: number;
  teacherName: string;
  date: string;
  status: TeacherAttendanceStatus;
  updatedAt: string;
}

export interface TeacherAttendanceSummaryItem {
  teacherId: number;
  employeeId: string;
  teacherName: string;
  totalDaysMarked: number;
  presentDays: number;
  absentDays: number;
  halfDaysAM: number;
  halfDaysPM: number;
  attendancePercentage: number;
}

export interface TeacherAttendanceSummaryResponse {
  schoolId: number;
  month: number;
  year: number;
  totalTeachers: number;
  summaries: TeacherAttendanceSummaryItem[];
}
