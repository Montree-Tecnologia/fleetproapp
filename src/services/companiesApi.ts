import { apiRequest } from '@/lib/api';

export interface Company {
  id: string;
  type: 'matriz' | 'filial';
  name: string;
  cnpj: string;
  city: string;
  state: string;
  matrizId?: string;
  active: boolean;
}

export interface CreateCompanyPayload {
  type: 'matriz' | 'filial';
  name: string;
  cnpj: string;
  city: string;
  state: string;
  matrizId?: string;
}

export interface UpdateCompanyPayload extends CreateCompanyPayload {}

export async function getCompanies() {
  return apiRequest<Company[]>('/companies');
}

export async function createCompany(data: CreateCompanyPayload) {
  return apiRequest<Company>('/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCompany(id: string, data: UpdateCompanyPayload) {
  return apiRequest<Company>(`/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCompany(id: string) {
  return apiRequest<void>(`/companies/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleCompanyActive(id: string) {
  return apiRequest<Company>(`/companies/${id}/toggle-active`, {
    method: 'PATCH',
  });
}

export interface CompanyCombo {
  id: number;
  name: string;
}

export async function getCompaniesCombo() {
  return apiRequest<CompanyCombo[]>('/companies/combo');
}
