import { api } from './api';
import { ChangePasswordRequest, LoginResponse, ResetPasswordRequest, TokenResponse } from '../types/auth';

export const AuthService = {
    async login(username: string, password: string): Promise<LoginResponse> {
        return api.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    async switchRole(schoolId: number | null, roleId: number, refreshToken: string): Promise<TokenResponse> {
        return api.request<TokenResponse>('/auth/switch-role', {
            method: 'POST',
            body: JSON.stringify({ schoolId, roleId, refreshToken }),
        });
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
        return api.request<{ message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
        return api.request<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    },

    async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
        return api.request<{ message: string }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    },

    async logout(refreshToken: string): Promise<void> {
        try {
            await api.request('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });
        } catch {
            // Ignore network errors on logout
        }
    },
};