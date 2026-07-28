/**
 * Mirrors SchoolERP.Contracts/Auth/ProfileContracts.cs → UserProfileResponse.
 * Backend JSON (camelCased) actually sends:
 *   userId, username, email, firstName, lastName?, phone?, address?,
 *   profilePicPath?, roles
 * (It never sends id / schoolId / schoolName / createdAt.)
 */
export interface UserProfileResponse {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  profilePicPath?: string | null;
  roles: string[];
}

export interface UpdateUserProfileRequest {
  /* All optional on the wire, but BE handler defaults nulls to existing values */
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export interface UploadProfilePicResponse {
  profilePicPath: string;
}