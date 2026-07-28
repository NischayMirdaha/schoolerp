export interface CreateBookRequest {
  title: string;
  author?: string | null;
  category?: string | null;
  bookCode: string;
  isbn?: string | null;
  totalCopies: number;
}

export interface UpdateBookRequest {
  title?: string | null;
  author?: string | null;
  category?: string | null;
  bookCode?: string | null;
  isbn?: string | null;
  totalCopies?: number | null;
}

export interface BookResponse {
  id: number;
  schoolId: number;
  title: string;
  author?: string | null;
  category?: string | null;
  bookCode: string;
  isbn?: string | null;
  totalCopies: number;
  availableCopies: number;
  isActive: boolean;
  createdAt: string;
}

export interface IssueBookRequest {
  bookId: number;
  studentId: number;
  issueDate?: string | null;
  dueDate: string; // YYYY-MM-DD
}

export interface BookIssueResponse {
  id: number;
  schoolId: number;
  bookId: number;
  bookTitle: string;
  bookCode: string;
  studentId: number;
  studentName: string;
  admissionNo: string;
  issueDate: string;
  dueDate: string;
  returnedDate?: string | null;
  issuedBy?: number | null;
  createdAt: string;
}

export interface OverdueBookResponse {
  issueId: number;
  bookId: number;
  bookTitle: string;
  bookCode: string;
  studentId: number;
  studentName: string;
  admissionNo: string;
  classId: number;
  className: string;
  issueDate: string;
  dueDate: string;
  daysOverdue: number;
}