export interface ParentEnrollmentInfo {
  firstName: string;
  lastName?: string | null;
  phone: string;
  email: string;
  relation: string; // 'father' | 'mother' | 'guardian'
  occupation?: string | null;
  address?: string | null;
}

export interface EnrollStudentRequest {
  admissionNo?: string | null;
  rollNo?: string | null;
  firstName: string;
  lastName?: string | null;
  gender?: string | null;
  dob?: string | null;
  address?: string | null;
  phone?: string | null;
  bloodGroup?: string | null;
  classId: number;
  sectionId?: number | null;
  academicYearId: number;
  email?: string | null;
  parent: ParentEnrollmentInfo;
}

export interface UpdateStudentRequest {
  rollNo?: string | null;
  firstName: string;
  lastName?: string | null;
  gender?: string | null;
  dob?: string | null;
  address?: string | null;
  phone?: string | null;
  bloodGroup?: string | null;
  email?: string | null;
}

export interface TransferStudentRequest {
  newClassId: number;
  newSectionId?: number | null;
  transferReason?: string | null;
}

export interface LinkedChildSummary {
  studentId: number;
  userId: number;
  admissionNo: string;
  rollNo: string | null;
  firstName: string;
  lastName: string | null;
  classId: number;
  className: string;
  sectionId: number | null;
  sectionName: string | null;
  status: string;
  profilePicPath: string | null;
}

export interface LinkedParentResponse {
  parentId: number;
  userId: number;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string;
  relation: string;
  occupation: string | null;
}

export interface StudentResponse {
  studentId: number;
  userId: number | null;
  schoolId: number;
  admissionNo: string;
  rollNo: string | null;
  firstName: string;
  lastName: string | null;
  gender: string | null;
  dob: string | null;
  address: string | null;
  phone: string | null;
  bloodGroup: string | null;
  classId: number;
  className: string;
  sectionId: number | null;
  sectionName: string | null;
  academicYearId: number | null;
  academicYearName: string | null;
  status: string;
  examAllowed: boolean;
  admissionDate: string;
  joinedClassId: number | null;
  joinedClassName: string | null;
  parent: LinkedParentResponse | null;
  createdAt: string;
}