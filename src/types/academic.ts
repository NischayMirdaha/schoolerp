export interface CreateAcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface AcademicYearResponse {
  id: number;
  schoolId: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateClassRequest {
  name: string;
  sortOrder?: number;
}

export interface UpdateClassRequest {
  name: string;
  sortOrder: number;
}

export interface ReorderClassRequest {
  classId: number;
  newSortOrder: number;
}

export interface ClassResponse {
  id: number;
  schoolId: number;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface CreateSectionRequest {
  classId: number;
  name: string;
  maxStrength?: number;
}

export interface UpdateSectionRequest {
  name: string;
  maxStrength: number;
}

export interface SectionResponse {
  id: number;
  schoolId: number;
  classId: number;
  className: string;
  name: string;
  maxStrength: number;
  createdAt: string;
}

export interface CreateSubjectRequest {
  name: string;
  code?: string | null;
}

export interface UpdateSubjectRequest {
  name: string;
  code?: string | null;
}

export interface SubjectResponse {
  id: number;
  schoolId: number;
  name: string;
  code: string | null;
  createdAt: string;
}

export interface AssignSubjectToClassRequest {
  classId: number;
  subjectId: number;
  isCompulsory?: boolean;
}

export interface ClassSubjectResponse {
  id: number;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  isCompulsory: boolean;
}

export interface CreateGradingScaleRequest {
  minPercentage: number;
  maxPercentage: number;
  letterGrade: string;
  gradePoint?: number | null;
}

export interface GradingScaleResponse {
  id: number;
  schoolId: number;
  minPercentage: number;
  maxPercentage: number;
  letterGrade: string;
  gradePoint: number | null;
  createdAt: string;
}

export interface CreateExamRequest {
  academicYearId: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateExamRequest {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ExamResponse {
  id: number;
  schoolId: number;
  academicYearId: number;
  academicYearName: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface CreateExamScheduleRequest {
  classId: number;
  sectionId?: number | null;
  subjectId: number;
  examDate?: string | null;
  maxMarks: number;
  passMark?: number | null;
}

export interface UpdateExamScheduleRequest {
  examDate?: string | null;
  maxMarks: number;
  passMark?: number | null;
}

export interface ExamScheduleResponse {
  id: number;
  examId: number;
  classId: number;
  className: string;
  sectionId: number | null;
  sectionName: string | null;
  subjectId: number;
  subjectName: string;
  examDate: string | null;
  maxMarks: number;
  passMark: number | null;
  isPublished: boolean;
  publishedAt: string | null;
}
