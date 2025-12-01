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
  purchaseInvoice?: string;
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
  purchaseInvoice?: string;
  initialUsageHours?: number;
  fuelType?: string;
}

export async function getRefrigerationBrands() {
  return apiRequest<RefrigerationBrand[]>('/refrigeration-units/brands/combo');
}

export async function getRefrigerationModels(brandId: number) {
  return apiRequest<RefrigerationModel[]>(`/refrigeration-units/models/combo?brandId=${brandId}`);
}

export async function createRefrigerationUnit(data: CreateRefrigerationUnitData) {
  return apiRequest<RefrigerationUnit>('/refrigeration-units', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
