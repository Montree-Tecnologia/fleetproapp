import { apiRequest, ApiResponse } from '@/lib/api';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'operator';
  companyId: string;
  linkedCompanies?: string[];
  hasAccessToAllCompanies?: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  companyId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function createUser(
  data: CreateUserRequest
): Promise<ApiResponse<{ user: UserResponse }>> {
  return apiRequest<{ user: UserResponse }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
