import { api } from './api';
import { PagedResult } from '../types/common';
import {
  CreateBookRequest,
  UpdateBookRequest,
  BookResponse,
  IssueBookRequest,
  BookIssueResponse,
  OverdueBookResponse,
} from '../types/library';

export const libraryService = {
  /**
   * List and search catalog books
   */
  async listBooks(search?: string, category?: string, availableOnly?: boolean, page = 1, pageSize = 20): Promise<PagedResult<BookResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (availableOnly !== undefined) params.set('availableOnly', String(availableOnly));

    return api.request<PagedResult<BookResponse>>(`/books?${params.toString()}`);
  },

  /**
   * Create new catalog book
   */
  async createBook(request: CreateBookRequest): Promise<BookResponse> {
    return api.request<BookResponse>('/books', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Update catalog book
   */
  async updateBook(id: number, request: UpdateBookRequest): Promise<BookResponse> {
    return api.request<BookResponse>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  /**
   * Toggle book active status
   */
  async setBookActive(id: number, isActive: boolean): Promise<BookResponse> {
    return api.request<BookResponse>(`/books/${id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  /**
   * Issue book copy to active student
   */
  async issueBook(request: IssueBookRequest): Promise<BookIssueResponse> {
    return api.request<BookIssueResponse>('/book-issues', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Mark book issue copy as returned
   */
  async returnBook(issueId: number, returnedDate?: string): Promise<BookIssueResponse> {
    return api.request<BookIssueResponse>(`/book-issues/${issueId}/return`, {
      method: 'POST',
      body: JSON.stringify({ returnedDate }),
    });
  },

  /**
   * List issued books
   */
  async listIssuedBooks(studentId?: number, bookId?: number, isActiveOnly?: boolean, page = 1, pageSize = 20): Promise<PagedResult<BookIssueResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (studentId) params.set('studentId', String(studentId));
    if (bookId) params.set('bookId', String(bookId));
    if (isActiveOnly !== undefined) params.set('isActiveOnly', String(isActiveOnly));

    return api.request<PagedResult<BookIssueResponse>>(`/book-issues?${params.toString()}`);
  },

  /**
   * List overdue books
   */
  async listOverdueBooks(classId?: number, page = 1, pageSize = 20): Promise<PagedResult<OverdueBookResponse>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (classId) params.set('classId', String(classId));

    return api.request<PagedResult<OverdueBookResponse>>(`/book-issues/overdue?${params.toString()}`);
  },

  /**
   * Trigger library overdue reminders
   */
  async triggerOverdueReminder(issueId?: number, studentId?: number, customMessage?: string): Promise<void> {
    return api.request<void>('/book-issues/reminders/trigger', {
      method: 'POST',
      body: JSON.stringify({ issueId, studentId, customMessage }),
    });
  },
};