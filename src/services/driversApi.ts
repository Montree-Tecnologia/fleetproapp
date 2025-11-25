import { apiRequest, ApiResponse } from '@/lib/api';

export interface CreateDriverPayload {
  name: string;
  cpf: string;
  birthDate: string;
  cnhCategory: string;
  cnhValidity: string;
  cnhDocumentBase64: string;
  branches: number[];
}

export interface DriverResponse {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  cnhCategory: string;
  cnhValidity: string;
  cnhDocumentUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  branches: DriverBranch[];
}

export interface Company {
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

export interface DriverBranch {
  driverId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  company: Company;
}

export interface CreateDriverResponse {
  driver: DriverResponse;
  branches: DriverBranch[];
}

export interface PaginatedDriversResponse {
  data: DriverResponse[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalRecords: number;
    totalPages: number;
  };
}

export async function fetchDrivers(
  page: number = 1,
  perPage: number = 20
): Promise<ApiResponse<PaginatedDriversResponse>> {
  return apiRequest<PaginatedDriversResponse>(`/drivers?page=${page}&perPage=${perPage}`, {
    method: 'GET',
  });
}

export async function createDriver(
  payload: CreateDriverPayload
): Promise<ApiResponse<CreateDriverResponse>> {
  return apiRequest<CreateDriverResponse>('/drivers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface UpdateDriverPayload {
  name: string;
  cpf: string;
  birthDate: string;
  cnhCategory: string;
  branches: number[];
  cnhUrl?: string;
  cnhDocumentBase64?: string;
}

export async function updateDriver(
  id: string,
  payload: UpdateDriverPayload
): Promise<ApiResponse<{ driver: DriverResponse }>> {
  return apiRequest<{ driver: DriverResponse }>(`/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteDriver(
  id: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/drivers/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleDriverStatus(
  id: string,
  isActive: boolean
): Promise<ApiResponse<{ driver: DriverResponse }>> {
  return apiRequest<{ driver: DriverResponse }>(`/drivers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}
