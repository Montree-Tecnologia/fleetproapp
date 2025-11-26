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

export interface CreateVehiclePayload {
  plate: string;
  chassis: string;
  renavam: string;
  brand: string;
  model: string;
  manufacturingYear: number;
  modelYear: number;
  color: string;
  vehicleType: string;
  status: string;
  purchaseKm: number;
  fuelType: string;
  axles: number;
  weight?: number;
  purchaseDate: string;
  purchaseValue: number;
  ownerBranch: string;
  supplierId?: string;
  branches?: string[];
  driverId?: string;
  hasComposition?: boolean;
  compositionPlates?: string[];
  compositionAxles?: number[];
  images?: string[];
  crlvDocument?: string;
  purchaseInvoice?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  chassis: string;
  renavam: string;
  brand: string;
  model: string;
  manufacturingYear: number;
  modelYear: number;
  color: string;
  vehicleType: string;
  status: string;
  purchaseKm: number;
  currentKm: number;
  fuelType: string;
  axles: number;
  weight?: number;
  purchaseDate: string;
  purchaseValue: number;
  ownerBranch: string;
  supplierId?: string;
  branches: string[];
  driverId?: string;
  hasComposition?: boolean;
  compositionPlates?: string[];
  compositionAxles?: number[];
  vehicleImages?: string[];
  crlvImage?: string;
  purchaseInvoiceImage?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createVehicle(data: CreateVehiclePayload) {
  const response = await apiRequest<Vehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateVehicle(id: string, data: Partial<CreateVehiclePayload>) {
  const response = await apiRequest<Vehicle>(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}
