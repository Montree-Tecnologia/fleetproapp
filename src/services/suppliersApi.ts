import { apiRequest } from '@/lib/api';

export interface Supplier {
  id: string;
  cnpj?: string;
  cpf?: string;
  name: string;
  fantasyName?: string;
  type: 'gas_station' | 'workshop' | 'dealer' | 'parts_store' | 'tire_store' | 'refrigeration_equipment' | 'other';
  brand?: string;
  city: string;
  state: string;
  phone?: string;
  contactPerson?: string;
  branches: string[];
  active: boolean;
}

export interface CreateSupplierPayload {
  cnpj?: string;
  cpf?: string;
  name: string;
  fantasyName?: string;
  type: string;
  brand?: string;
  city: string;
  state: string;
  phone?: string;
  contactPerson?: string;
  branches: string[];
  active?: boolean;
}

export interface UpdateSupplierPayload extends Partial<CreateSupplierPayload> {
  active?: boolean;
}

export async function getSuppliers() {
  const response = await apiRequest<Supplier[]>('/suppliers');
  return response.data;
}

export async function createSupplier(data: CreateSupplierPayload) {
  const response = await apiRequest<Supplier>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateSupplier(id: string, data: UpdateSupplierPayload) {
  const response = await apiRequest<Supplier>(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteSupplier(id: string) {
  await apiRequest(`/suppliers/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleSupplierActive(id: string, active: boolean) {
  const endpoint = active ? `/suppliers/${id}` : `/suppliers/${id}/inactivate`;
  const response = await apiRequest<Supplier>(endpoint, {
    method: active ? 'PUT' : 'POST',
    body: active ? JSON.stringify({ active }) : undefined,
  });
  return response.data;
}

export interface SupplierCombo {
  id: string;
  name: string;
  fantasyName?: string;
  cnpj?: string;
  cpf?: string;
  city?: string;
  state?: string;
  type?: string;
  active?: boolean;
}

export async function getSuppliersCombo() {
  return apiRequest<SupplierCombo[]>('/suppliers/combo');
}
