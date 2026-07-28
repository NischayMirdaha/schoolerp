export interface CreateHomeworkRequest {
  classId: number;
  sectionId?: number | null;
  subjectId: number;
  targetScope: 'class' | 'section' | 'individual';
  title: string;
  description?: string | null;
  dueDate: string; // YYYY-MM-DD
  individualStudentIds?: number[] | null;
}

export interface UpdateHomeworkRequest {
  title?: string | null;
  description?: string | null;
  dueDate?: string | null;
}

export interface HomeworkChecklistRecord {
  studentId: number;
  admissionNumber: string;
  rollNumber?: string | null;
  studentName: string;
  isDone: boolean;
  markedDoneAt?: string | null;
}

export interface HomeworkResponse {
  id: number;
  schoolId: number;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  targetScope: string;
  title: string;
  description?: string | null;
  dueDate: string;
  createdAt: string;
  isDoneByMe?: boolean;
}

export interface HomeworkDetailResponse {
  id: number;
  schoolId: number;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  subjectId: number;
  subjectName: string;
  title: string;
  description?: string | null;
  dueDate: string;
  students: HomeworkChecklistRecord[];
}

export interface MarkHomeworkDoneRequest {
  studentIds: number[];
  isDone: boolean;
}