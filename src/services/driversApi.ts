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

export async function createDriver(
  payload: CreateDriverPayload
): Promise<ApiResponse<CreateDriverResponse>> {
  return apiRequest<CreateDriverResponse>('/drivers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
