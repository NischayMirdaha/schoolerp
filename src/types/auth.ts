export interface RoleInfo {
    roleId: number;
    roleName: string;
    schoolId: number | null;
    schoolName: string | null;
}

export interface UserInfo {
    userId: number;
    username: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    profilePicPath: string | null;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: string;
    user: UserInfo;
    availableRoles: RoleInfo[];
    activeRole: RoleInfo | null;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: string;
    activeRole: RoleInfo | null;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}