export interface CreateSchoolRequest {
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  establishedDate?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  bankBranch?: string | null;
  defaultPassMark?: number;
  maxBooksPerStudent?: number;
  feeReminderDaysBeforeDue?: number;
  feeReminderDaysAfterDue?: number;
  libraryOverdueReminderDays?: number;
}

export interface UpdateSchoolRequest {
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  establishedDate?: string | null;
  logoPath?: string | null;
  sealImagePath?: string | null;
  qrCodePath?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  bankBranch?: string | null;
  defaultPassMark: number;
  maxBooksPerStudent: number;
  feeReminderDaysBeforeDue: number;
  feeReminderDaysAfterDue: number;
  libraryOverdueReminderDays: number;
}

export interface SchoolResponse {
  id: number;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  establishedDate: string | null;
  logoPath: string | null;
  sealImagePath: string | null;
  qrCodePath: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  bankBranch: string | null;
  defaultPassMark: number;
  maxBooksPerStudent: number;
  feeReminderDaysBeforeDue: number;
  feeReminderDaysAfterDue: number;
  libraryOverdueReminderDays: number;
  principalUserId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrossSchoolStatsResponse {
  schoolId: number;
  schoolName: string;
  schoolCode: string;
  activeStudents: number;
  activeTeachers: number;
  monthCollection: number;
  refreshedAt: string;
}

export interface CrossSchoolDashboardResponse {
  totalSchools: number;
  totalStudentsSystemWide: number;
  totalTeachersSystemWide: number;
  schools: CrossSchoolStatsResponse[];
}

export interface CreatePrincipalRequest {
  username: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  dob?: string | null;
}

export interface UpdatePrincipalRequest {
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  dob?: string | null;
}

export interface PrincipalResponse {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  gender: string | null;
  dob: string | null;
  schoolId: number;
  schoolName: string;
  createdAt: string;
}

export interface CreateDefaultClassRequest {
  name: string;
  sortOrder: number;
}

export interface DefaultClassResponse {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface CreateDefaultGradingScaleRequest {
  minPercentage: number;
  maxPercentage: number;
  letterGrade: string;
  gradePoint?: number | null;
}

export interface DefaultGradingScaleResponse {
  id: number;
  minPercentage: number;
  maxPercentage: number;
  letterGrade: string;
  gradePoint: number | null;
  createdAt: string;
}
