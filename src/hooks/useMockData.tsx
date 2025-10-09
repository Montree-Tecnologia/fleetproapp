import { useState, useCallback } from 'react';

// Types
export interface Driver {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  cnhCategory: string;
  cnhValidity: string;
  cnhDocument?: string;
  active: boolean;
  branches: string[];
}

export interface VehicleSale {
  buyerName: string;
  buyerCpfCnpj: string;
  saleDate: string;
  km: number;
  salePrice: number;
  paymentReceipt?: string;
  transferDocument?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  chassis: string;
  renavam: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicleType: 'Truck' | 'Baú' | 'Carreta' | 'Graneleiro' | 'Bitrem' | 'Tritem' | 'Container' | 'Caçamba' | 'Cavalo Mecânico' | 'Baú Frigorífico' | 'Toco';
  status: 'active' | 'maintenance' | 'inactive' | 'sold';
  purchaseKm: number;
  currentKm: number;
  fuelType: 'Diesel S10' | 'Diesel S500' | 'Arla 32' | 'Arla 42' | 'Etanol' | 'Gasolina';
  axles: number;
  weight?: number;
  branches: string[];
  ownerBranch: string;
  driverId?: string;
  hasComposition: boolean;
  compositionPlates?: string[];
  compositionAxles?: number[];
  purchaseDate: string;
  purchaseValue: number;
  images?: string[];
  crlvDocument?: string;
  saleInfo?: VehicleSale;
  previousStatus?: 'active' | 'maintenance' | 'inactive';
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
  supplierId: string;
  driver: string;
  paymentReceipt?: string;
  fiscalNote?: string;
}

export interface RefrigerationUnit {
  id: string;
  vehicleId?: string;
  brand: string;
  model: string;
  serialNumber: string;
  type: 'freezer' | 'cooled' | 'climatized';
  minTemp: number;
  maxTemp: number;
  installDate: string;
  status: 'active' | 'defective' | 'maintenance' | 'sold';
}

export interface Supplier {
  id: string;
  cnpj: string;
  name: string;
  fantasyName: string;
  type: 'gas_station' | 'workshop' | 'dealer' | 'parts_store' | 'tire_store';
  brand?: string;
  city: string;
  state: string;
  branches: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  company: string;
  active: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  type: 'matriz' | 'filial';
  name: string;
  cnpj: string;
  city: string;
  state: string;
  matrizId?: string;
}

// Mock Data
const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'Carlos Santos',
    cpf: '123.456.789-00',
    birthDate: '1985-05-15',
    cnhCategory: 'E',
    cnhValidity: '2026-08-20',
    active: true,
    branches: ['Matriz'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '2',
    name: 'João Pereira',
    cpf: '987.654.321-00',
    birthDate: '1990-11-22',
    cnhCategory: 'E',
    cnhValidity: '2027-03-10',
    active: true,
    branches: ['Matriz'],
    cnhDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '3',
    name: 'Pedro Lima',
    cpf: '456.789.123-00',
    birthDate: '1988-07-08',
    cnhCategory: 'D',
    cnhValidity: '2025-12-15',
    active: true,
    branches: ['Filial SP'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  }
];

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
    vehicleType: 'Truck',
    status: 'active',
    purchaseKm: 85000,
    currentKm: 125000,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Matriz', 'Filial SP'],
    ownerBranch: 'Matriz',
    driverId: '1',
    hasComposition: false,
    purchaseDate: '2022-03-15',
    purchaseValue: 650000,
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
      'https://images.unsplash.com/photo-1570560258091-1a8f8b8c7dfc?w=800&q=80',
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
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
    vehicleType: 'Bitrem',
    status: 'active',
    purchaseKm: 120000,
    currentKm: 185000,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    driverId: '2',
    hasComposition: true,
    compositionPlates: ['XYZ-1111', 'XYZ-2222'],
    compositionAxles: [3, 3],
    purchaseDate: '2021-08-20',
    purchaseValue: 580000,
    images: [
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
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
    vehicleType: 'Carreta',
    status: 'maintenance',
    purchaseKm: 45000,
    currentKm: 52000,
    fuelType: 'Diesel S500',
    axles: 3,
    branches: ['Filial SP', 'Filial RJ'],
    ownerBranch: 'Filial SP',
    driverId: '3',
    hasComposition: true,
    compositionPlates: ['KLM-3333'],
    compositionAxles: [2],
    purchaseDate: '2023-01-10',
    purchaseValue: 720000,
    images: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80',
      'https://images.unsplash.com/photo-1615529162924-f7e4e5e9e9b4?w=800&q=80',
      'https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?w=800&q=80',
      'https://images.unsplash.com/photo-1570560258091-1a8f8b8c7dfc?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  }
];

const mockRefuelings: Refueling[] = [
  // Abastecimentos do veículo 1 (ABC-1234)
  {
    id: '1',
    vehicleId: '1',
    date: '2025-01-15',
    km: 125000,
    liters: 320,
    pricePerLiter: 5.89,
    totalValue: 1884.80,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Carlos Santos'
  },
  {
    id: '2',
    vehicleId: '1',
    date: '2025-01-08',
    km: 123200,
    liters: 310,
    pricePerLiter: 5.92,
    totalValue: 1835.20,
    fuelType: 'Diesel S10',
    supplierId: '2',
    driver: 'Carlos Santos'
  },
  {
    id: '3',
    vehicleId: '1',
    date: '2025-01-01',
    km: 121500,
    liters: 305,
    pricePerLiter: 5.85,
    totalValue: 1784.25,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Carlos Santos'
  },
  {
    id: '4',
    vehicleId: '1',
    date: '2024-12-25',
    km: 119800,
    liters: 315,
    pricePerLiter: 5.80,
    totalValue: 1827.00,
    fuelType: 'Diesel S10',
    supplierId: '2',
    driver: 'Carlos Santos'
  },
  // Abastecimentos do veículo 2 (DEF-5678)
  {
    id: '5',
    vehicleId: '2',
    date: '2025-01-14',
    km: 185000,
    liters: 450,
    pricePerLiter: 5.85,
    totalValue: 2632.50,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Pedro Lima'
  },
  {
    id: '6',
    vehicleId: '2',
    date: '2025-01-07',
    km: 183500,
    liters: 440,
    pricePerLiter: 5.90,
    totalValue: 2596.00,
    fuelType: 'Diesel S10',
    supplierId: '2',
    driver: 'Pedro Lima'
  },
  {
    id: '7',
    vehicleId: '2',
    date: '2024-12-31',
    km: 182000,
    liters: 445,
    pricePerLiter: 5.88,
    totalValue: 2616.60,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Pedro Lima'
  },
  {
    id: '8',
    vehicleId: '2',
    date: '2024-12-24',
    km: 180400,
    liters: 450,
    pricePerLiter: 5.82,
    totalValue: 2619.00,
    fuelType: 'Diesel S10',
    supplierId: '2',
    driver: 'Pedro Lima'
  },
  // Abastecimentos do veículo 3 (GHI-9012)
  {
    id: '9',
    vehicleId: '3',
    date: '2025-01-12',
    km: 52000,
    liters: 280,
    pricePerLiter: 6.10,
    totalValue: 1708.00,
    fuelType: 'Diesel S500',
    supplierId: '1',
    driver: 'João Pereira'
  },
  {
    id: '10',
    vehicleId: '3',
    date: '2025-01-05',
    km: 50300,
    liters: 275,
    pricePerLiter: 6.15,
    totalValue: 1691.25,
    fuelType: 'Diesel S500',
    supplierId: '2',
    driver: 'João Pereira'
  },
  {
    id: '11',
    vehicleId: '3',
    date: '2024-12-29',
    km: 48600,
    liters: 270,
    pricePerLiter: 6.08,
    totalValue: 1641.60,
    fuelType: 'Diesel S500',
    supplierId: '1',
    driver: 'João Pereira'
  },
  {
    id: '12',
    vehicleId: '3',
    date: '2024-12-22',
    km: 47000,
    liters: 275,
    pricePerLiter: 6.12,
    totalValue: 1683.00,
    fuelType: 'Diesel S500',
    supplierId: '2',
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
    installDate: '2022-03-20',
    status: 'active'
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
    installDate: '2021-09-01',
    status: 'active'
  },
  {
    id: '3',
    brand: 'Thermo King',
    model: 'T-Series',
    serialNumber: 'TK456789',
    type: 'freezer',
    minTemp: -20,
    maxTemp: -15,
    installDate: '2023-05-15',
    status: 'maintenance'
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    name: 'Petrobras Distribuidora S.A.',
    fantasyName: 'Posto Petrobras Anhanguera',
    type: 'gas_station',
    brand: 'Petrobras',
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
    brand: 'Shell',
    city: 'Campinas',
    state: 'SP',
    branches: ['Matriz']
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@frota.com',
    role: 'admin',
    company: 'Transportadora Matriz',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'gestor@frota.com',
    role: 'manager',
    company: 'Transportadora Matriz',
    active: true,
    createdAt: '2024-02-15'
  }
];

const mockCompanies: Company[] = [
  {
    id: '1',
    type: 'matriz',
    name: 'Transportadora Matriz',
    cnpj: '12.345.678/0001-90',
    city: 'São Paulo',
    state: 'SP',
  },
  {
    id: '2',
    type: 'filial',
    name: 'Filial Rio de Janeiro',
    cnpj: '12.345.678/0002-71',
    city: 'Rio de Janeiro',
    state: 'RJ',
    matrizId: '1',
  },
  {
    id: '3',
    type: 'filial',
    name: 'Filial Belo Horizonte',
    cnpj: '12.345.678/0003-52',
    city: 'Belo Horizonte',
    state: 'MG',
    matrizId: '1',
  },
];

// Hook
export function useMockData() {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [refuelings, setRefuelings] = useState<Refueling[]>(mockRefuelings);
  const [refrigerationUnits, setRefrigerationUnits] = useState<RefrigerationUnit[]>(mockRefrigerationUnits);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);

  // Drivers
  const getDrivers = useCallback(() => drivers, [drivers]);
  const getDriver = useCallback((id: string) => drivers.find(d => d.id === id), [drivers]);
  const addDriver = useCallback((driver: Omit<Driver, 'id'>) => {
    const newDriver = { ...driver, id: Date.now().toString() };
    setDrivers(prev => [...prev, newDriver]);
    return newDriver;
  }, []);
  const updateDriver = useCallback((id: string, data: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  }, []);
  const deleteDriver = useCallback((id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  }, []);

  // Vehicles
  const getVehicles = useCallback(() => vehicles, [vehicles]);
  const getVehicle = useCallback((id: string) => vehicles.find(v => v.id === id), [vehicles]);
  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id' | 'currentKm'>) => {
    const newVehicle = { 
      ...vehicle, 
      id: Date.now().toString(),
      currentKm: vehicle.purchaseKm, // Inicializa currentKm com purchaseKm
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  }, []);
  const updateVehicle = useCallback((id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        // Se purchaseKm for atualizado e currentKm for menor, atualiza currentKm também
        if (data.purchaseKm && v.currentKm < data.purchaseKm) {
          return { ...v, ...data, currentKm: data.purchaseKm };
        }
        return { ...v, ...data };
      }
      return v;
    }));
  }, []);
  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, []);
  const sellVehicle = useCallback((id: string, saleData: VehicleSale) => {
    setVehicles(prev => prev.map(v => 
      v.id === id 
        ? { 
            ...v, 
            previousStatus: v.status as 'active' | 'maintenance' | 'inactive',
            status: 'sold' as const, 
            saleInfo: saleData, 
            currentKm: saleData.km,
            driverId: undefined
          } 
        : v
    ));
  }, []);
  
  const reverseSale = useCallback((id: string) => {
    setVehicles(prev => prev.map(v => 
      v.id === id 
        ? { 
            ...v, 
            status: (v.previousStatus || 'active') as 'active' | 'maintenance' | 'inactive',
            saleInfo: undefined,
            previousStatus: undefined
          } 
        : v
    ));
  }, []);

  // Refuelings
  const getRefuelings = useCallback(() => refuelings, [refuelings]);
  const getRefuelingsByVehicle = useCallback((vehicleId: string) => 
    refuelings.filter(r => r.vehicleId === vehicleId), [refuelings]);
  const addRefueling = useCallback((refueling: Omit<Refueling, 'id'>) => {
    const newRefueling = { ...refueling, id: Date.now().toString() };
    setRefuelings(prev => [...prev, newRefueling]);
    
    // Atualiza o currentKm do veículo com o KM do abastecimento
    setVehicles(prev => prev.map(v => 
      v.id === refueling.vehicleId 
        ? { ...v, currentKm: Math.max(v.currentKm, refueling.km) } 
        : v
    ));
    
    return newRefueling;
  }, []);
  const updateRefueling = useCallback((id: string, data: Partial<Refueling>) => {
    setRefuelings(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);
  const deleteRefueling = useCallback((id: string) => {
    setRefuelings(prev => prev.filter(r => r.id !== id));
  }, []);

  // Refrigeration Units
  const getRefrigerationUnits = useCallback(() => refrigerationUnits, [refrigerationUnits]);
  const getRefrigerationUnitByVehicle = useCallback((vehicleId: string) => 
    refrigerationUnits.find(r => r.vehicleId === vehicleId), [refrigerationUnits]);
  const addRefrigerationUnit = useCallback((unit: Omit<RefrigerationUnit, 'id'>) => {
    const newUnit = { ...unit, id: Date.now().toString() };
    setRefrigerationUnits(prev => [...prev, newUnit]);
    return newUnit;
  }, []);
  const updateRefrigerationUnit = useCallback((id: string, data: Partial<RefrigerationUnit>) => {
    setRefrigerationUnits(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  }, []);
  const deleteRefrigerationUnit = useCallback((id: string) => {
    setRefrigerationUnits(prev => prev.filter(u => u.id !== id));
  }, []);

  // Suppliers
  const getSuppliers = useCallback(() => suppliers, [suppliers]);
  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplier, id: Date.now().toString() };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  }, []);
  const updateSupplier = useCallback((id: string, data: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);
  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  }, []);

  // Users
  const getUsers = useCallback(() => users, [users]);
  const getUser = useCallback((id: string) => users.find(u => u.id === id), [users]);
  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser = { 
      ...user, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);
  const updateUser = useCallback((id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  }, []);
  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  // Companies
  const getCompanies = useCallback(() => companies, [companies]);
  const addCompany = useCallback((company: Omit<Company, 'id'>) => {
    const newCompany = { ...company, id: Date.now().toString() };
    setCompanies(prev => [...prev, newCompany]);
    return newCompany;
  }, []);
  const updateCompany = useCallback((id: string, data: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);
  const deleteCompany = useCallback((id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  }, []);

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
    // Drivers
    drivers: getDrivers,
    getDriver,
    addDriver,
    updateDriver,
    deleteDriver,
    
    // Vehicles
    vehicles: getVehicles,
    getVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    sellVehicle,
    reverseSale,
    
    // Refuelings
    refuelings: getRefuelings,
    getRefuelingsByVehicle,
    addRefueling,
    updateRefueling,
    deleteRefueling,
    
    // Refrigeration
    refrigerationUnits: getRefrigerationUnits,
    getRefrigerationUnitByVehicle,
    addRefrigerationUnit,
    updateRefrigerationUnit,
    deleteRefrigerationUnit,
    
    // Suppliers
    suppliers: getSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    
    // Users
    users: getUsers,
    getUser,
    addUser,
    updateUser,
    deleteUser,
    
    // Companies
    companies: getCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    
    // Dashboard
    getDashboardStats
  };
}
