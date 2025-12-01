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

export async function getRefrigerationBrands() {
  return apiRequest<RefrigerationBrand[]>('/refrigeration-units/brands/combo');
}

export async function getRefrigerationModels(brandId: number) {
  return apiRequest<RefrigerationModel[]>(`/refrigeration-units/models/combo?brandId=${brandId}`);
}
