import { apiRequest } from '@/lib/api';

export interface RefrigerationBrand {
  id: number;
  name: string;
}

export interface RefrigerationModel {
  id: number;
  name: string;
  brandId: number;
}

export interface ImagePayload {
  base64: string;
  extension: string;
}

export interface CreateRefrigerationUnitData {
  vehicleId?: string;
  companyId: string;
  brand: string;
  model: string;
  serialNumber: string;
  type: 'freezer' | 'cooled' | 'climatized';
  minTemp: number;
  maxTemp: number;
  status: 'active' | 'defective' | 'maintenance' | 'inactive' | 'sold';
  installDate: string;
  purchaseDate?: string;
  purchaseValue?: number;
  supplierId?: string;
  purchaseInvoice?: ImagePayload;
  initialUsageHours?: number;
  fuelType?: string;
}

export interface RefrigerationUnit {
  id: string;
  vehicleId?: string;
  companyId: string;
  brand: string;
  model: string;
  serialNumber: string;
  type: 'freezer' | 'cooled' | 'climatized';
  minTemp: number;
  maxTemp: number;
  status: 'active' | 'defective' | 'maintenance' | 'inactive' | 'sold';
  installDate: string;
  purchaseDate?: string;
  purchaseValue?: number;
  supplierId?: string;
  purchaseInvoice?: string | ImagePayload;
  initialUsageHours?: number;
  fuelType?: string;
}

export async function getRefrigerationBrands() {
  return apiRequest<RefrigerationBrand[]>('/refrigeration-units/brands/combo');
}

export async function getRefrigerationModels(brandId: number) {
  return apiRequest<RefrigerationModel[]>(`/refrigeration-units/models/combo?brandId=${brandId}`);
}

export interface GetRefrigerationUnitsParams {
  page: number;
  limit: number;
  brand?: string;
  model?: string;
  serialNumber?: string;
}

export interface PaginatedRefrigerationUnits {
  data: RefrigerationUnit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getRefrigerationUnits(params: GetRefrigerationUnitsParams) {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  if (params.brand) queryParams.append('brand', params.brand);
  if (params.model) queryParams.append('model', params.model);
  if (params.serialNumber) queryParams.append('serialNumber', params.serialNumber);

  return apiRequest<PaginatedRefrigerationUnits>(`/refrigeration-units?${queryParams.toString()}`);
}

export async function createRefrigerationUnit(data: CreateRefrigerationUnitData) {
  return apiRequest<RefrigerationUnit>('/refrigeration-units', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteRefrigerationUnit(id: string) {
  return apiRequest(`/refrigeration-units/${id}`, {
    method: 'DELETE',
  });
}

export async function updateRefrigerationUnitStatus(
  id: string,
  status: 'active' | 'defective' | 'maintenance' | 'inactive' | 'sold'
) {
  return apiRequest<RefrigerationUnit>(`/refrigeration-units/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export interface RefrigerationUnitCombo {
  id: string;
  model: string;
  serialNumber: string;
}

export async function getRefrigerationUnitsCombo() {
  const response = await apiRequest<RefrigerationUnitCombo[]>('/refrigeration-units/combo');
  return response.data;
}
