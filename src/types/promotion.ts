export interface CreatePromotionMappingRequest {
  academicYearFromId: number;
  academicYearToId: number;
  fromClassId: number;
  toClassId?: number | null;
  isGraduation?: boolean;
}

export interface PromotionMappingResponse {
  id: number;
  academicYearFromId: number;
  academicYearFromName: string;
  academicYearToId: number;
  academicYearToName: string;
  fromClassId: number;
  fromClassName: string;
  toClassId: number | null;
  toClassName: string | null;
  isGraduation: boolean;
  createdAt: string;
}

export interface BulkPromoteStudentsRequest {
  promotionMappingId: number;
  excludedStudentIds?: number[] | null;
}

export interface BulkPromotionResultResponse {
  totalProcessed: number;
  promotedCount: number;
  graduatedCount: number;
  retainedCount: number;
}

export interface EnrollOptionalSubjectRequest {
  academicYearId: number;
  subjectId: number;
}

export interface OptionalSubjectResponse {
  id: number;
  studentId: number;
  subjectId: number;
  subjectName: string;
  academicYearId: number;
}

export interface EligibleStudentResponse {
  studentId: number;
  studentName: string;
  admissionNo: string;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  closingBalance: number;
  closingCreditBalance: number;
}

export interface PromotionPreviewResponse {
  mappingId: number;
  fromAcademicYearName: string;
  toAcademicYearName: string;
  fromClassName: string;
  toClassName?: string | null;
  isGraduation: boolean;
  totalEligible: number;
  promotedStudents: EligibleStudentResponse[];
  retainedStudents: EligibleStudentResponse[];
}