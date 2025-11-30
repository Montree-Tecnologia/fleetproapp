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

export async function getVehicleBrandByIdOrName(identifier: number | string) {
  return apiRequest<VehicleBrand>(`/vehicle-brands/${encodeURIComponent(identifier)}`);
}

export async function getVehicleModelByIdOrName(identifier: number | string) {
  return apiRequest<VehicleModel>(`/vehicle-models/${encodeURIComponent(identifier)}`);
}

export interface ImagePayload {
  base64: string;
  extension: string;
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
  currentKm: number;
  fuelType: string;
  axles: number;
  weight?: number;
  purchaseDate: string;
  purchaseValue: number;
  ownerBranchId: string;
  supplierId?: string;
  branches?: number[];
  driverId?: string;
  isTraction?: boolean;
  hasComposition?: boolean;
  compositions?: number[];  // IDs dos veículos acoplados
  images?: ImagePayload[];
  deleteImageIds?: string[];           // IDs das imagens a serem excluídas
  crlvDocument?: ImagePayload;
  deleteCrlvDocument?: boolean;        // Flag para excluir CRLV
  purchaseInvoice?: ImagePayload;
  deletePurchaseInvoice?: boolean;     // Flag para excluir Nota Fiscal
}

export interface VehicleImage {
  id: string;
  url: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleComposition {
  id: string;
  mainVehicleId: string;
  trailerVehicleId: string;
  axles: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  chassis: string;
  renavam: string;
  brand: string;
  brandId?: number;
  model: string;
  modelId?: number;
  manufacturingYear: number;
  modelYear: number;
  color: string;
  vehicleType: string;
  vehicleTypeId?: number;
  status: string;
  previousStatus: string | null;
  purchaseKm: number;
  currentKm: number;
  fuelType: string;
  axles: number;
  weight: string;
  ownerBranchId: string;
  supplierId: string | null;
  driverId: string | null;
  isTraction: boolean;
  hasComposition: boolean;
  purchaseDate: string;
  purchaseValue: string;
  crlvDocumentUrl: string | null;
  purchaseInvoiceUrl: string | null;
  saleInfo: any | null;
  createdAt: string;
  updatedAt: string;
  driver: any | null;
  images: VehicleImage[];
  composition: VehicleComposition[];
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

export interface PaginatedVehiclesResponse {
  data: Vehicle[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface GetVehiclesParams {
  page?: number;
  limit?: number;
  search?: string;
  vehicleType?: string;
}

export async function getVehicles(params: GetVehiclesParams = {}) {
  const { page = 1, limit = 20, search, vehicleType } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) queryParams.append('search', search);
  if (vehicleType) queryParams.append('vehicleType', vehicleType);
  
  const response = await apiRequest<PaginatedVehiclesResponse>(`/vehicles?${queryParams.toString()}`);
  return response;
}

export async function deleteVehicle(id: string) {
  const response = await apiRequest<void>(`/vehicles/${id}`, {
    method: 'DELETE',
  });
  return response;
}

export async function updateVehicleStatus(id: string, status: string) {
  const response = await apiRequest<Vehicle>(`/vehicles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return response;
}

export async function assignDriverToVehicle(vehicleId: string, driverId: string) {
  const response = await apiRequest<Vehicle>(`/vehicles/${vehicleId}/drivers/${driverId}`, {
    method: 'POST',
  });
  return response;
}

export async function unassignDriverFromVehicle(vehicleId: string, driverId: string) {
  const response = await apiRequest<Vehicle>(`/vehicles/${vehicleId}/drivers/${driverId}`, {
    method: 'DELETE',
  });
  return response;
}

export async function addCompositionToVehicle(mainVehicleId: string, trailerVehicleId: string) {
  const response = await apiRequest<Vehicle>(`/vehicles/${mainVehicleId}/compositions/${trailerVehicleId}`, {
    method: 'POST',
  });
  return response;
}

export async function removeCompositionFromVehicle(mainVehicleId: string, trailerVehicleId: string) {
  const response = await apiRequest<Vehicle>(`/vehicles/${mainVehicleId}/compositions/${trailerVehicleId}`, {
    method: 'DELETE',
  });
  return response;
}
