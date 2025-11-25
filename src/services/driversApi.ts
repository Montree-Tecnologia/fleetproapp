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
  createdAt: string;
  updatedAt: string;
}

export interface DriverBranch {
  driverId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverResponse {
  driver: DriverResponse;
  branches: DriverBranch[];
}

export interface PaginatedDriversResponse {
  drivers: DriverResponse[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
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
