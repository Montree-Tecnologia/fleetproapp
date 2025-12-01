import { apiRequest, ApiResponse } from '@/lib/api';

export interface Refueling {
  id: string;
  vehicleId?: string;
  refrigerationUnitId?: string;
  driverId?: string;
  supplierId: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalValue: number;
  km?: number;
  usageHours?: number;
  paymentReceiptUrl?: string;
  fiscalNoteUrl?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: any;
  refrigerationUnit?: any;
  driver?: any;
  supplier?: any;
}

export interface ImagePayload {
  base64: string;
  extension: string;
}

export interface CreateRefuelingPayload {
  vehicleId?: string;
  refrigerationUnitId?: string;
  driverId?: string;
  supplierId: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalValue: number;
  km?: number;
  usageHours?: number;
  paymentReceipt?: ImagePayload;
  fiscalNote?: ImagePayload;
}

export interface UpdateRefuelingPayload extends Partial<CreateRefuelingPayload> {}

export interface PaginatedRefuelingsResponse {
  data: Refueling[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface GetRefuelingsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  vehicleId?: string;
  refrigerationUnitId?: string;
  driverId?: string;
  supplierId?: string;
}

export async function getRefuelings(params: GetRefuelingsParams = {}) {
  const { page = 1, limit = 20, ...filters } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  // Adicionar filtros opcionais
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
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

export async function updateRefueling(id: string, data: UpdateRefuelingPayload) {
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

// Combos para filtros
export interface VehicleCombo {
  id: string;
  plate: string;
  model: string;
}

export interface DriverCombo {
  id: string;
  name: string;
  cpf: string;
}

export interface RefrigerationUnitCombo {
  id: string;
  model: string;
  serialNumber: string;
}

export async function getVehiclesCombo() {
  const response = await apiRequest<VehicleCombo[]>('/vehicles/combo');
  return response.data;
}

export async function getDriversCombo() {
  const response = await apiRequest<DriverCombo[]>('/drivers/combo');
  return response.data;
}

export async function getRefrigerationUnitsCombo() {
  const response = await apiRequest<RefrigerationUnitCombo[]>('/refrigeration-units/combo');
  return response.data;
}
