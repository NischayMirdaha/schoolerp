export interface StudentMarkItemDto {
  studentId: number;
  marksObtained: number;
  remarks?: string | null;
  postPublishEditNote?: string | null;
}

export interface SaveStudentMarksRequest {
  examScheduleId: number;
  marks: StudentMarkItemDto[];
}

export interface StudentMarkRecordDto {
  studentId: number;
  admissionNumber: string;
  rollNumber?: string | null;
  studentName: string;
  marksObtained: number;
  maxMarks: number;
  passMark?: number | null;
  remarks?: string | null;
  postPublishEditNote?: string | null;
}

export interface ExamScheduleMarksGridResponse {
  examScheduleId: number;
  examId: number;
  examName: string;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  subjectId: number;
  subjectName: string;
  maxMarks: number;
  passMark?: number | null;
  isPublished: boolean;
  publishedAt?: string | null;
  marks: StudentMarkRecordDto[];
}

export interface StudentResultSummaryRecordDto {
  examId: number;
  examName: string;
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  letterGrade?: string | null;
  rank?: number | null;
  remarks?: string | null;
}

export interface StudentSubjectMarkRecordDto {
  subjectId: number;
  subjectName: string;
  maxMarks: number;
  marksObtained: number;
  remarks?: string | null;
}

export interface StudentExamResultDetailResponse {
  examId: number;
  examName: string;
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  letterGrade?: string | null;
  rank?: number | null;
  remarks?: string | null;
  subjects: StudentSubjectMarkRecordDto[];
}

export interface ClassMeritRecordDto {
  studentId: number;
  admissionNumber: string;
  rollNumber?: string | null;
  studentName: string;
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  letterGrade?: string | null;
  rank?: number | null;
}