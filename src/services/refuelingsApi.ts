import { apiRequest } from '@/lib/api';

export interface ImagePayload {
  base64: string;
  extension: string;
}

export interface CreateRefuelingPayload {
  entityType: 'vehicle' | 'refrigeration';
  vehicleId?: string;
  refrigerationUnitId?: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalValue: number;
  currentKm?: number;
  currentHours?: number;
  supplierId: string;
  driverId?: string;
  paymentReceipt?: ImagePayload;
  fiscalNote?: ImagePayload;
}

export interface Refueling {
  id: string;
  entityType: 'vehicle' | 'refrigeration';
  vehicleId?: string;
  refrigerationUnitId?: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalValue: number;
  currentKm?: number;
  currentHours?: number;
  supplierId: string;
  driverId?: string;
  paymentReceiptUrl?: string;
  fiscalNoteUrl?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: any;
  refrigerationUnit?: any;
  supplier?: any;
  driver?: any;
}

export interface GetRefuelingsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  refrigerationUnitId?: string;
  driverId?: string;
  vehicleId?: string;
  supplierId?: string;
}

export interface PaginatedRefuelingsResponse {
  data: Refueling[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalRecords: number;
    totalPages: number;
  };
}

export async function getRefuelings(params: GetRefuelingsParams = {}) {
  const { page = 1, limit = 20, ...filters } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.refrigerationUnitId) queryParams.append('refrigerationUnitId', filters.refrigerationUnitId);
  if (filters.driverId) queryParams.append('driverId', filters.driverId);
  if (filters.vehicleId) queryParams.append('vehicleId', filters.vehicleId);
  if (filters.supplierId) queryParams.append('supplierId', filters.supplierId);
  
  const response = await apiRequest<PaginatedRefuelingsResponse>(`/refuelings?${queryParams.toString()}`);
  return response;
}

export async function createRefueling(data: CreateRefuelingPayload) {
  const response = await apiRequest<Refueling>('/refuelings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateRefueling(id: string, data: Partial<CreateRefuelingPayload>) {
  const response = await apiRequest<Refueling>(`/refuelings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteRefueling(id: string) {
  await apiRequest(`/refuelings/${id}`, {
    method: 'DELETE',
  });
}
