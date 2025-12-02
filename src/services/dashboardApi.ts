import { apiRequest, ApiResponse } from '@/lib/api';

export interface VehiclesStats {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  defectiveVehicles: number;
  inactiveVehicles: number;
  soldVehicles: number;
  availability: number;
  avgConsumption: number;
  totalFuelCost: number;
}

export interface RefrigerationStats {
  totalUnits: number;
  activeUnits: number;
  maintenanceUnits: number;
  defectiveUnits: number;
  inactiveUnits: number;
  soldUnits: number;
  availability: number;
  avgConsumption: number;
  totalFuelCost: number;
}

export interface VehicleConsumption {
  id: string;
  plate: string;
  model: string;
  avgConsumption: number;
}

export interface RefrigerationConsumption {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  avgConsumption: number;
}

export interface RecentRefueling {
  id: string;
  refuelingDate: string;
  liters: number | string;
  totalValue: number | string;
  vehicle?: {
    id: string;
    plate: string;
    model: string;
  };
  refrigerationUnit?: {
    id: string;
    serialNumber: string;
    brand: string;
    model: string;
  };
  supplier?: {
    id: string;
    fantasyName: string;
  };
}

export interface DashboardData {
  vehiclesStats: VehiclesStats;
  refrigerationStats: RefrigerationStats;
  vehiclesConsumption: VehicleConsumption[];
  refrigerationConsumption: RefrigerationConsumption[];
  recentVehicleRefuelings: RecentRefueling[];
  recentRefrigerationRefuelings: RecentRefueling[];
}

export async function getVehiclesStats(): Promise<VehiclesStats> {
  const response = await apiRequest<VehiclesStats>('/dashboard/vehicles-stats');
  if (!response.data) {
    throw new Error('Dados de estatísticas de veículos não encontrados');
  }
  return response.data;
}

export async function getRefrigerationStats(): Promise<RefrigerationStats> {
  const response = await apiRequest<RefrigerationStats>('/dashboard/refrigeration-stats');
  if (!response.data) {
    throw new Error('Dados de estatísticas de refrigeração não encontrados');
  }
  return response.data;
}

export async function getVehiclesConsumption(order: 'best' | 'worst' = 'best'): Promise<VehicleConsumption[]> {
  const response = await apiRequest<VehicleConsumption[]>(`/dashboard/vehicles-consumption?order=${order}`);
  if (!response.data) {
    throw new Error('Dados de consumo de veículos não encontrados');
  }
  return response.data;
}

export async function getRefrigerationConsumption(order: 'best' | 'worst' = 'best'): Promise<RefrigerationConsumption[]> {
  const response = await apiRequest<RefrigerationConsumption[]>(`/dashboard/refrigeration-consumption?order=${order}`);
  if (!response.data) {
    throw new Error('Dados de consumo de refrigeração não encontrados');
  }
  return response.data;
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiRequest<DashboardData>('/dashboard');
  if (!response.data) {
    throw new Error('Dados do dashboard não encontrados');
  }
  return response.data;
}
