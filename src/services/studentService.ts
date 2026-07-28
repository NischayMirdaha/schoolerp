import { api } from './api';
import { StudentResponse } from '../types/student';

/** Student role self-service ("me") calls. */
export const StudentService = {
  async getMyProfile(): Promise<StudentResponse> {
    return api.request<StudentResponse>('/students/me');
  },
};
