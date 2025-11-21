import { apiRequest } from '@/lib/api';

export interface VehicleType {
  id: number;
  name: string;
}

export interface VehicleBrand {
  id: number;
  name: string;
}

export interface VehicleModel {
  id: number;
  name: string;
}

export async function getVehicleTypes() {
  return apiRequest<VehicleType[]>('/vehicle-types');
}

export async function getVehicleBrands(vehicleTypeId: number) {
  return apiRequest<VehicleBrand[]>(`/vehicle-brands?vehicleTypeId=${vehicleTypeId}`);
}

export async function getVehicleModels(brandId: number) {
  return apiRequest<VehicleModel[]>(`/vehicle-models?brandId=${brandId}`);
}
