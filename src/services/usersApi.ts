import { apiRequest, ApiResponse } from '@/lib/api';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  companyId: string;
  linkedCompanies?: string[];
  hasAccessToAllCompanies?: boolean;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  companyId: string;
  linkedCompanies?: string[];
  hasAccessToAllCompanies?: boolean;
}

export interface CompanyData {
  id: string;
  type: string;
  name: string;
  cnpj: string;
  city: string;
  state: string;
  matrizId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedCompany {
  userId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  primaryCompanyId: string;
  hasAccessToAllCompanies: boolean;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  primaryCompany: CompanyData;
  linkedCompanies: LinkedCompany[];
}

export interface PaginationInfo {
  currentPage: number;
  itemsPerPage: number;
  totalRecords: number;
  totalPages: number;
}

export interface GetUsersResponse {
  data: UserResponse[];
  pagination: PaginationInfo;
}

export interface GetUsersParams {
  page?: number;
  perPage?: number;
}

export async function getUsers(
  params: GetUsersParams = {}
): Promise<ApiResponse<GetUsersResponse>> {
  const { page = 1, perPage = 10 } = params;
  return apiRequest<GetUsersResponse>(`/users?page=${page}&perPage=${perPage}`);
}

export async function createUser(
  data: CreateUserRequest
): Promise<ApiResponse<{ user: UserResponse }>> {
  return apiRequest<{ user: UserResponse }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(
  userId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function updateUser(
  userId: string,
  data: UpdateUserRequest
): Promise<ApiResponse<{ user: UserResponse }>> {
  return apiRequest<{ user: UserResponse }>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function toggleUserStatus(
  userId: string
): Promise<ApiResponse<{ user: UserResponse }>> {
  return apiRequest<{ user: UserResponse }>(`/users/${userId}/status`, {
    method: 'PATCH',
  });
}
