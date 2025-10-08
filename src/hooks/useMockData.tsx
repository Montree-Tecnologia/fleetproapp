import { useState, useCallback } from 'react';

// Types
export interface Vehicle {
  id: string;
  plate: string;
  chassis: string;
  renavam: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  status: 'active' | 'maintenance' | 'inactive';
  currentKm: number;
  fuelType: 'diesel' | 'gasoline' | 'ethanol';
  branch: string;
  driver?: string;
  purchaseDate: string;
  purchaseValue: number;
}

export interface Refueling {
  id: string;
  vehicleId: string;
  date: string;
  km: number;
  liters: number;
  pricePerLiter: number;
  totalValue: number;
  fuelType: string;
  station: string;
  city: string;
  state: string;
  driver: string;
}

export interface RefrigerationUnit {
  id: string;
  vehicleId: string;
  brand: string;
  model: string;
  serialNumber: string;
  type: 'freezer' | 'cooled' | 'climatized';
  minTemp: number;
  maxTemp: number;
  installDate: string;
}

export interface Supplier {
  id: string;
  cnpj: string;
  name: string;
  fantasyName: string;
  type: 'gas_station' | 'workshop' | 'dealer';
  city: string;
  state: string;
  branches: string[];
}

// Mock Data
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    plate: 'ABC-1234',
    chassis: '9BWZZZ377VT004251',
    renavam: '00123456789',
    brand: 'Volvo',
    model: 'FH 540',
    year: 2022,
    color: 'Branco',
    status: 'active',
    currentKm: 85000,
    fuelType: 'diesel',
    branch: 'Matriz',
    driver: 'Carlos Santos',
    purchaseDate: '2022-03-15',
    purchaseValue: 650000
  },
  {
    id: '2',
    plate: 'DEF-5678',
    chassis: '9BWZZZ377VT004252',
    renavam: '00123456790',
    brand: 'Scania',
    model: 'R 450',
    year: 2021,
    color: 'Vermelho',
    status: 'active',
    currentKm: 120000,
    fuelType: 'diesel',
    branch: 'Matriz',
    driver: 'João Pereira',
    purchaseDate: '2021-08-20',
    purchaseValue: 580000
  },
  {
    id: '3',
    plate: 'GHI-9012',
    chassis: '9BWZZZ377VT004253',
    renavam: '00123456791',
    brand: 'Mercedes',
    model: 'Actros 2646',
    year: 2023,
    color: 'Prata',
    status: 'maintenance',
    currentKm: 45000,
    fuelType: 'diesel',
    branch: 'Filial SP',
    driver: 'Pedro Lima',
    purchaseDate: '2023-01-10',
    purchaseValue: 720000
  }
];

const mockRefuelings: Refueling[] = [
  {
    id: '1',
    vehicleId: '1',
    date: '2025-01-05',
    km: 85000,
    liters: 350,
    pricePerLiter: 5.89,
    totalValue: 2061.50,
    fuelType: 'Diesel S10',
    station: 'Posto Petrobras',
    city: 'São Paulo',
    state: 'SP',
    driver: 'Carlos Santos'
  },
  {
    id: '2',
    vehicleId: '1',
    date: '2024-12-28',
    km: 84200,
    liters: 340,
    pricePerLiter: 5.92,
    totalValue: 2012.80,
    fuelType: 'Diesel S10',
    station: 'Posto Shell',
    city: 'Campinas',
    state: 'SP',
    driver: 'Carlos Santos'
  },
  {
    id: '3',
    vehicleId: '2',
    date: '2025-01-04',
    km: 120000,
    liters: 380,
    pricePerLiter: 5.85,
    totalValue: 2223.00,
    fuelType: 'Diesel S10',
    station: 'Posto BR',
    city: 'Rio de Janeiro',
    state: 'RJ',
    driver: 'João Pereira'
  }
];

const mockRefrigerationUnits: RefrigerationUnit[] = [
  {
    id: '1',
    vehicleId: '1',
    brand: 'Thermo King',
    model: 'SLXi-300',
    serialNumber: 'TK123456',
    type: 'freezer',
    minTemp: -25,
    maxTemp: -18,
    installDate: '2022-03-20'
  },
  {
    id: '2',
    vehicleId: '2',
    brand: 'Carrier',
    model: 'Supra 950',
    serialNumber: 'CR789012',
    type: 'cooled',
    minTemp: 0,
    maxTemp: 8,
    installDate: '2021-09-01'
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    name: 'Petrobras Distribuidora S.A.',
    fantasyName: 'Posto Petrobras Anhanguera',
    type: 'gas_station',
    city: 'São Paulo',
    state: 'SP',
    branches: ['Matriz', 'Filial SP']
  },
  {
    id: '2',
    cnpj: '98.765.432/0001-10',
    name: 'Shell Brasil Ltda',
    fantasyName: 'Posto Shell Bandeirantes',
    type: 'gas_station',
    city: 'Campinas',
    state: 'SP',
    branches: ['Matriz']
  }
];

// Hook
export function useMockData() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [refuelings, setRefuelings] = useState<Refueling[]>(mockRefuelings);
  const [refrigerationUnits, setRefrigerationUnits] = useState<RefrigerationUnit[]>(mockRefrigerationUnits);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);

  // Vehicles
  const getVehicles = useCallback(() => vehicles, [vehicles]);
  const getVehicle = useCallback((id: string) => vehicles.find(v => v.id === id), [vehicles]);
  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: Date.now().toString() };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  }, []);
  const updateVehicle = useCallback((id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  }, []);
  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, []);

  // Refuelings
  const getRefuelings = useCallback(() => refuelings, [refuelings]);
  const getRefuelingsByVehicle = useCallback((vehicleId: string) => 
    refuelings.filter(r => r.vehicleId === vehicleId), [refuelings]);
  const addRefueling = useCallback((refueling: Omit<Refueling, 'id'>) => {
    const newRefueling = { ...refueling, id: Date.now().toString() };
    setRefuelings(prev => [...prev, newRefueling]);
    return newRefueling;
  }, []);

  // Refrigeration Units
  const getRefrigerationUnits = useCallback(() => refrigerationUnits, [refrigerationUnits]);
  const getRefrigerationUnitByVehicle = useCallback((vehicleId: string) => 
    refrigerationUnits.find(r => r.vehicleId === vehicleId), [refrigerationUnits]);

  // Suppliers
  const getSuppliers = useCallback(() => suppliers, [suppliers]);

  // Dashboard Stats
  const getDashboardStats = useCallback(() => {
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    const totalKm = vehicles.reduce((sum, v) => sum + v.currentKm, 0);
    
    const thisMonthRefuelings = refuelings.filter(r => {
      const refuelDate = new Date(r.date);
      const now = new Date();
      return refuelDate.getMonth() === now.getMonth() && refuelDate.getFullYear() === now.getFullYear();
    });
    
    const totalFuelCost = thisMonthRefuelings.reduce((sum, r) => sum + r.totalValue, 0);
    const totalLiters = thisMonthRefuelings.reduce((sum, r) => sum + r.liters, 0);
    const avgConsumption = totalLiters > 0 ? totalKm / totalLiters : 0;

    return {
      totalVehicles: vehicles.length,
      activeVehicles,
      maintenanceVehicles,
      inactiveVehicles: vehicles.filter(v => v.status === 'inactive').length,
      totalKm,
      totalFuelCost,
      avgConsumption: avgConsumption.toFixed(2),
      availability: ((activeVehicles / vehicles.length) * 100).toFixed(1)
    };
  }, [vehicles, refuelings]);

  return {
    // Vehicles
    vehicles: getVehicles,
    getVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Refuelings
    refuelings: getRefuelings,
    getRefuelingsByVehicle,
    addRefueling,
    
    // Refrigeration
    refrigerationUnits: getRefrigerationUnits,
    getRefrigerationUnitByVehicle,
    
    // Suppliers
    suppliers: getSuppliers,
    
    // Dashboard
    getDashboardStats
  };
}
