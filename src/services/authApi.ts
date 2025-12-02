import { apiRequest, ApiResponse } from '@/lib/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenData {
  type: string;
  name: string | null;
  token: string;
  abilities: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  primaryCompanyId: string | null;
  hasAccessToAllCompanies: boolean;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: TokenData;
  user: UserData;
  linkedCompanyIds: string[];
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<void>> {
  return apiRequest<void>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchUserProfile(): Promise<ApiResponse<UserData>> {
  return apiRequest<UserData>('/auth/profile');
}

export async function logoutUser(): Promise<ApiResponse<void>> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  });
}
