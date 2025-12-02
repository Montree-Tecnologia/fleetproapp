import { apiRequest } from '@/lib/api';

export interface VehicleConsumption {
  vehicleId: number;
  liters: number;
  kmDiff: number;
  consumption: number;
  vehicle: {
    plate: string;
    model: string;
  };
}

export interface RefrigerationConsumption {
  unitId: number;
  liters: number;
  hours: number;
  consumption: number;
  unit: {
    brand: string;
    model: string;
  };
}

export interface StatusCounts {
  active: number;
  maintenance: number;
  defective: number;
  inactive: number;
  sold: number;
}

export interface DashboardStats {
  total: number;
  counts: StatusCounts;
  availability: number;
  avgConsumption: number;
  totalFuelCost: number;
}

export interface DashboardResponse {
  vehiclesStats: DashboardStats;
  refrigerationStats: DashboardStats;
  vehiclesConsumption: VehicleConsumption[];
  refrigerationConsumption: RefrigerationConsumption[];
}

export interface RecentRefueling {
  id: number;
  refuelingDate: string;
  liters: number | string;
  totalValue: number | string;
  vehicleId?: number;
  refrigerationUnitId?: number;
  supplierId: number;
  vehicle?: {
    plate: string;
    model: string;
  };
  refrigerationUnit?: {
    serialNumber: string;
    brand: string;
    model: string;
  };
  supplier?: {
    fantasyName: string;
  };
}

export async function fetchDashboardData(limit: number = 5): Promise<DashboardResponse> {
  const response = await apiRequest<DashboardResponse>(
    `/dashboard?limit=${limit}&order=desc`
  );
  return response.data!;
}

export async function fetchRecentRefuelings(type: 'vehicle' | 'refrigeration', limit: number = 5): Promise<RecentRefueling[]> {
  const response = await apiRequest<{ data: RecentRefueling[] }>(
    `/refuelings?limit=${limit}&order=desc&type=${type}`
  );
  return response.data!.data;
}
