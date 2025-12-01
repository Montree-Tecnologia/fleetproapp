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
  saleInvoice?: string;
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
  vehicleType: 'Truck' | 'Baú' | 'Carreta' | 'Graneleiro' | 'Container' | 'Caçamba' | 'Cavalo Mecânico' | 'Baú Frigorífico' | 'Toco' | 'VUC' | '3/4' | 'Sider' | 'Prancha' | 'Tanque' | 'Cegonheiro' | 'Bitruck' | 'Rodotrem';
  vehicleTypeId?: number;
  status: 'active' | 'defective' | 'maintenance' | 'inactive' | 'sold';
  purchaseKm: number;
  currentKm: number;
  fuelType: 'Diesel S10' | 'Diesel S500' | 'Arla 32' | 'Arla 42' | 'Etanol' | 'Gasolina' | 'GNV' | 'Biometano';
  axles: number;
  weight?: number;
  branches: string[];
  ownerBranch: string;
  driverId?: string;
  isTraction?: boolean;
  hasComposition: boolean;
  composition?: VehicleComposition[];
  purchaseDate: string;
  purchaseValue: number;
  supplierId?: string;
  images?: string[] | Array<{ id: string; url: string; category: string; createdAt: string; updatedAt: string }>;
  crlvDocument?: string;
  purchaseInvoice?: string;
  saleInfo?: VehicleSale;
  previousStatus?: 'active' | 'defective' | 'maintenance' | 'inactive';
  // Campos opcionais para controle de deleção
  deleteImageIds?: string[];
  deleteCrlvDocument?: boolean;
  deletePurchaseInvoice?: boolean;
}

export interface Refueling {
  id: string;
  vehicleId?: string;
  refrigerationUnitId?: string;
  date: string;
  km?: number;
  usageHours?: number;
  liters: number;
  pricePerLiter: number;
  totalValue: number;
  fuelType: string;
  supplierId: string;
  driver: string;
  paymentReceipt?: string;
  fiscalNote?: string;
}

export interface RefrigerationSale {
  buyerName: string;
  buyerCpfCnpj: string;
  saleDate: string;
  usageHours: number;
  salePrice: number;
  paymentReceipt?: string;
  transferDocument?: string;
}

export interface RefrigerationUnit {
  id: string;
  vehicleId?: string;
  companyId: string;
  brand: string;
  model: string;
  serialNumber: string;
  type: 'freezer' | 'cooled' | 'climatized';
  minTemp: number;
  maxTemp: number;
  installDate: string;
  purchaseDate?: string;
  purchaseValue?: number;
  supplierId?: string;
  purchaseInvoice?: string | { base64: string; extension: string };
  status: 'active' | 'defective' | 'maintenance' | 'inactive' | 'sold';
  previousStatus?: 'active' | 'defective' | 'maintenance' | 'inactive';
  initialUsageHours?: number;
  fuelType?: string;
  saleInfo?: RefrigerationSale;
}

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

export type ModulePermission = {
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export type UserPermissions = {
  dashboard?: { view: boolean };
  vehicles?: ModulePermission;
  drivers?: ModulePermission;
  refuelings?: ModulePermission;
  refrigeration?: ModulePermission;
  suppliers?: ModulePermission;
  companies?: ModulePermission;
  users?: ModulePermission;
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  company: string; // Manter para compatibilidade, mas será deprecated
  linkedCompanies?: string[]; // IDs das empresas vinculadas
  hasAccessToAllCompanies?: boolean; // Se true, tem acesso a todas
  active: boolean;
  createdAt: string;
  customPermissions?: UserPermissions;
}

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
  },
  {
    id: '4',
    name: 'Roberto Silva',
    cpf: '321.654.987-00',
    birthDate: '1987-03-12',
    cnhCategory: 'E',
    cnhValidity: '2026-11-30',
    active: true,
    branches: ['Matriz', 'Filial SP'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '5',
    name: 'Marcos Costa',
    cpf: '789.123.456-00',
    birthDate: '1992-09-25',
    cnhCategory: 'E',
    cnhValidity: '2027-05-18',
    active: true,
    branches: ['Filial RJ'],
    cnhDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '6',
    name: 'Fernando Oliveira',
    cpf: '654.321.987-00',
    birthDate: '1986-12-08',
    cnhCategory: 'E',
    cnhValidity: '2026-09-22',
    active: true,
    branches: ['Matriz'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '7',
    name: 'Lucas Almeida',
    cpf: '147.258.369-00',
    birthDate: '1991-06-14',
    cnhCategory: 'D',
    cnhValidity: '2027-12-10',
    active: true,
    branches: ['Filial SP', 'Filial RJ'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '8',
    name: 'Rafael Souza',
    cpf: '369.258.147-00',
    birthDate: '1989-04-20',
    cnhCategory: 'E',
    cnhValidity: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Vence em 15 dias
    active: true,
    branches: ['Matriz', 'Filial RJ'],
    cnhDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '9',
    name: 'André Ferreira',
    cpf: '258.147.369-00',
    birthDate: '1993-11-03',
    cnhCategory: 'C',
    cnhValidity: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Vence em 45 dias
    active: true,
    branches: ['Filial SP'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '10',
    name: 'Gustavo Rodrigues',
    cpf: '741.852.963-00',
    birthDate: '1984-02-18',
    cnhCategory: 'E',
    cnhValidity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Vencida há 10 dias
    active: true,
    branches: ['Matriz'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '11',
    name: 'Thiago Mendes',
    cpf: '852.963.741-00',
    birthDate: '1990-08-12',
    cnhCategory: 'E',
    cnhValidity: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Vence em 55 dias
    active: true,
    branches: ['Filial MG'],
    cnhDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '12',
    name: 'Diego Martins',
    cpf: '963.741.852-00',
    birthDate: '1988-12-30',
    cnhCategory: 'E',
    cnhValidity: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Vence em 25 dias
    active: true,
    branches: ['Filial RJ', 'Filial MG'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '13',
    name: 'Paulo Henrique',
    cpf: '159.753.486-00',
    birthDate: '1986-04-22',
    cnhCategory: 'E',
    cnhValidity: '2028-06-18',
    active: true,
    branches: ['Matriz', 'Filial SP', 'Filial RJ'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '14',
    name: 'Vinícius Araújo',
    cpf: '357.159.246-00',
    birthDate: '1992-01-17',
    cnhCategory: 'D',
    cnhValidity: '2027-08-25',
    active: false,
    branches: ['Filial SP'],
    cnhDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '15',
    name: 'Bruno Cardoso',
    cpf: '246.135.789-00',
    birthDate: '1987-09-09',
    cnhCategory: 'E',
    cnhValidity: '2026-12-12',
    active: false,
    branches: ['Matriz'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '16',
    name: 'Ricardo Barbosa',
    cpf: '582.694.137-00',
    birthDate: '1983-07-25',
    cnhCategory: 'E',
    cnhValidity: '2024-03-15',
    active: true,
    branches: ['Matriz', 'Filial SP'],
    cnhDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
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
    manufacturingYear: 2022,
    modelYear: 2023,
    color: 'Branco',
    vehicleType: 'Cavalo Mecânico',
    status: 'active',
    purchaseKm: 85000,
    currentKm: 125000,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 7.5,
    branches: ['Matriz', 'Filial SP'],
    ownerBranch: 'Matriz',
    driverId: '1',
    hasComposition: true,
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
    manufacturingYear: 2020,
    modelYear: 2021,
    color: 'Vermelho',
    vehicleType: 'Bitruck',
    status: 'active',
    purchaseKm: 120000,
    currentKm: 185000,
    fuelType: 'Diesel S10',
    axles: 4,
    weight: 15.0,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    driverId: '2',
    hasComposition: false,
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
    brand: 'Mercedes-Benz',
    model: 'Actros 2646',
    manufacturingYear: 2022,
    modelYear: 2023,
    color: 'Prata',
    vehicleType: 'Truck',
    status: 'maintenance',
    purchaseKm: 45000,
    currentKm: 52000,
    fuelType: 'Diesel S500',
    axles: 3,
    weight: 23.0,
    branches: ['Filial SP', 'Filial RJ'],
    ownerBranch: 'Filial SP',
    driverId: '3',
    hasComposition: false,
    purchaseDate: '2023-01-10',
    purchaseValue: 720000,
    supplierId: '5',
    images: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80',
      'https://images.unsplash.com/photo-1615529162924-f7e4e5e9e9b4?w=800&q=80',
      'https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?w=800&q=80',
      'https://images.unsplash.com/photo-1570560258091-1a8f8b8c7dfc?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '4',
    plate: 'XYZ-1111',
    chassis: '9BWZZZ377VT004254',
    renavam: '00123456792',
    brand: 'Randon',
    model: 'Sider 3 Eixos',
    manufacturingYear: 2020,
    modelYear: 2020,
    color: 'Branco',
    vehicleType: 'Sider',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 12.5,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2020-05-10',
    purchaseValue: 180000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1586281380614-7c7f351b5c37?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '5',
    plate: 'JKL-2345',
    chassis: '9BWZZZ377VT004255',
    renavam: '00123456793',
    brand: 'Librelato',
    model: 'Baú Frigorífico 3 Eixos',
    manufacturingYear: 2021,
    modelYear: 2022,
    color: 'Branco',
    vehicleType: 'Baú Frigorífico',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 14.0,
    branches: ['Matriz', 'Filial SP'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2022-07-15',
    purchaseValue: 220000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '6',
    plate: 'MNO-3456',
    chassis: '9BWZZZ377VT004256',
    renavam: '00123456794',
    brand: 'Guerra',
    model: 'Graneleiro 3 Eixos',
    manufacturingYear: 2021,
    modelYear: 2021,
    color: 'Cinza',
    vehicleType: 'Graneleiro',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 13.0,
    branches: ['Filial SP'],
    ownerBranch: 'Filial SP',
    hasComposition: false,
    purchaseDate: '2021-09-20',
    purchaseValue: 195000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '7',
    plate: 'PQR-4567',
    chassis: '9BWZZZ377VT004257',
    renavam: '00123456795',
    brand: 'Volkswagen',
    model: 'Delivery 11.180',
    manufacturingYear: 2022,
    modelYear: 2023,
    color: 'Branco',
    vehicleType: 'VUC',
    status: 'active',
    purchaseKm: 15000,
    currentKm: 28000,
    fuelType: 'Diesel S10',
    axles: 2,
    weight: 5.0,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    driverId: '4',
    hasComposition: false,
    purchaseDate: '2023-02-10',
    purchaseValue: 280000,
    supplierId: '6',
    images: [
      'https://images.unsplash.com/photo-1570560258091-1a8f8b8c7dfc?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '8',
    plate: 'STU-5678',
    chassis: '9BWZZZ377VT004258',
    renavam: '00123456796',
    brand: 'Ford',
    model: 'Cargo 1319',
    manufacturingYear: 2022,
    modelYear: 2022,
    color: 'Azul',
    vehicleType: '3/4',
    status: 'active',
    purchaseKm: 35000,
    currentKm: 48000,
    fuelType: 'Diesel S10',
    axles: 2,
    weight: 8.0,
    branches: ['Filial RJ'],
    ownerBranch: 'Filial RJ',
    driverId: '5',
    hasComposition: false,
    purchaseDate: '2022-06-15',
    purchaseValue: 240000,
    supplierId: '6',
    images: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '9',
    plate: 'VWX-6789',
    chassis: '9BWZZZ377VT004259',
    renavam: '00123456797',
    brand: 'Randon',
    model: 'Prancha 3 Eixos',
    manufacturingYear: 2020,
    modelYear: 2021,
    color: 'Preto',
    vehicleType: 'Prancha',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 11.0,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2021-11-05',
    purchaseValue: 175000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '10',
    plate: 'YZA-7890',
    chassis: '9BWZZZ377VT004260',
    renavam: '00123456798',
    brand: 'Iveco',
    model: 'Tector 240',
    manufacturingYear: 2023,
    modelYear: 2023,
    color: 'Vermelho',
    vehicleType: 'Toco',
    status: 'active',
    purchaseKm: 22000,
    currentKm: 35000,
    fuelType: 'Diesel S10',
    axles: 2,
    weight: 6.0,
    branches: ['Filial SP'],
    ownerBranch: 'Filial SP',
    driverId: '3',
    hasComposition: false,
    purchaseDate: '2023-03-20',
    purchaseValue: 320000,
    supplierId: '6',
    images: [
      'https://images.unsplash.com/photo-1615529162924-f7e4e5e9e9b4?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '11',
    plate: 'BCD-8901',
    chassis: '9BWZZZ377VT004261',
    renavam: '00123456799',
    brand: 'Kässbohrer',
    model: 'Tanque 3 Eixos',
    manufacturingYear: 2022,
    modelYear: 2022,
    color: 'Prata',
    vehicleType: 'Tanque',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 15.0,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    driverId: '16',
    hasComposition: false,
    purchaseDate: '2022-08-10',
    purchaseValue: 240000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '12',
    plate: 'EFG-9012',
    chassis: '9BWZZZ377VT004262',
    renavam: '00123456800',
    brand: 'Randon',
    model: 'Cegonheiro 3 Andares',
    manufacturingYear: 2020,
    modelYear: 2020,
    color: 'Azul',
    vehicleType: 'Cegonheiro',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 10.0,
    branches: ['Filial RJ'],
    ownerBranch: 'Filial RJ',
    hasComposition: false,
    purchaseDate: '2020-12-15',
    purchaseValue: 200000,
    images: [
      'https://images.unsplash.com/photo-1570560258091-1a8f8b8c7dfc?w=800&q=80'
    ]
  },
  {
    id: '13',
    plate: 'HIJ-0123',
    chassis: '9BWZZZ377VT004263',
    renavam: '00123456801',
    brand: 'Scania',
    model: 'G 440',
    manufacturingYear: 2020,
    modelYear: 2021,
    color: 'Branco',
    vehicleType: 'Cavalo Mecânico',
    status: 'active',
    purchaseKm: 95000,
    currentKm: 145000,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 7.0,
    branches: ['Filial SP'],
    ownerBranch: 'Filial SP',
    hasComposition: true,
    purchaseDate: '2021-04-10',
    purchaseValue: 590000,
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80'
    ]
  },
  {
    id: '14',
    plate: 'KLM-1234',
    chassis: '9BWZZZ377VT004264',
    renavam: '00123456802',
    brand: 'Facchini',
    model: 'Caçamba Basculante 3 Eixos',
    manufacturingYear: 2022,
    modelYear: 2022,
    color: 'Amarelo',
    vehicleType: 'Caçamba',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2022-10-05',
    purchaseValue: 210000,
    images: [
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80'
    ]
  },
  {
    id: '17',
    plate: 'WXY-7890',
    chassis: '9BWZZZ377VT004267',
    renavam: '00123456805',
    brand: 'Mercedes-Benz',
    model: 'Atego 2426',
    manufacturingYear: 2021,
    modelYear: 2022,
    color: 'Azul',
    vehicleType: 'Truck',
    status: 'active',
    purchaseKm: 42000,
    currentKm: 68000,
    fuelType: 'Diesel S10',
    axles: 2,
    weight: 8.5,
    branches: ['Matriz', 'Filial SP'],
    ownerBranch: 'Matriz',
    driverId: '16',
    hasComposition: false,
    purchaseDate: '2021-11-15',
    purchaseValue: 420000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1615529162924-f7e4e5e9e9b4?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '15',
    plate: 'NOP-2345',
    chassis: '9BWZZZ377VT004265',
    renavam: '00123456803',
    brand: 'Mercedes-Benz',
    model: 'Axor 2544',
    manufacturingYear: 2021,
    modelYear: 2022,
    color: 'Branco',
    vehicleType: 'Cavalo Mecânico',
    status: 'active',
    purchaseKm: 78000,
    currentKm: 112000,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Filial RJ'],
    ownerBranch: 'Filial RJ',
    hasComposition: true,
    purchaseDate: '2022-05-20',
    purchaseValue: 620000,
    images: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80'
    ]
  },
  {
    id: '16',
    plate: 'QRS-3456',
    chassis: '9BWZZZ377VT004266',
    renavam: '00123456804',
    brand: 'Librelato',
    model: 'Porta Container 3 Eixos',
    manufacturingYear: 2020,
    modelYear: 2021,
    color: 'Cinza',
    vehicleType: 'Container',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2021-07-15',
    purchaseValue: 185000,
    images: [
      'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80'
    ]
  },
  {
    id: '20',
    plate: 'TUV-4567',
    chassis: '9BWZZZ377VT004270',
    renavam: '00123456808',
    brand: 'Volvo',
    model: 'FH 480',
    manufacturingYear: 2023,
    modelYear: 2023,
    color: 'Azul',
    vehicleType: 'Cavalo Mecânico',
    status: 'active',
    purchaseKm: 42000,
    currentKm: 68000,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Matriz', 'Filial SP'],
    ownerBranch: 'Matriz',
    driverId: '1',
    hasComposition: true,
    purchaseDate: '2023-01-25',
    purchaseValue: 680000,
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80'
    ]
  },
  {
    id: '18',
    plate: 'WXY-5678',
    chassis: '9BWZZZ377VT004268',
    renavam: '00123456806',
    brand: 'Recrusul',
    model: 'Porta Container 3 Eixos',
    manufacturingYear: 2023,
    modelYear: 2023,
    color: 'Verde',
    vehicleType: 'Container',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Filial SP'],
    ownerBranch: 'Filial SP',
    hasComposition: false,
    purchaseDate: '2023-04-10',
    purchaseValue: 195000,
    images: [
      'https://images.unsplash.com/photo-1615529162924-f7e4e5e9e9b4?w=800&q=80'
    ]
  },
  {
    id: '19',
    plate: 'ZAB-6789',
    chassis: '9BWZZZ377VT004269',
    renavam: '00123456807',
    brand: 'DAF',
    model: 'XF 480',
    manufacturingYear: 2021,
    modelYear: 2021,
    color: 'Vermelho',
    vehicleType: 'Cavalo Mecânico',
    status: 'active',
    purchaseKm: 115000,
    currentKm: 168000,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Filial MG'],
    ownerBranch: 'Filial MG',
    hasComposition: true,
    purchaseDate: '2021-03-18',
    purchaseValue: 570000,
    images: [
      'https://images.unsplash.com/photo-1570560258091-1a8f8b8c7dfc?w=800&q=80'
    ]
  },
  {
    id: '20',
    plate: 'CDE-7890',
    chassis: '9BWZZZ377VT004270',
    renavam: '00123456808',
    brand: 'Pastre',
    model: 'Baú Seco 3 Eixos',
    manufacturingYear: 2021,
    modelYear: 2022,
    color: 'Branco',
    vehicleType: 'Baú',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2022-09-12',
    purchaseValue: 170000,
    images: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
    ]
  },
  {
    id: '21',
    plate: 'FGH-8901',
    chassis: '9BWZZZ377VT004271',
    renavam: '00123456809',
    brand: 'Scania',
    model: 'R 500',
    manufacturingYear: 2023,
    modelYear: 2023,
    color: 'Prata',
    vehicleType: 'Cavalo Mecânico',
    status: 'maintenance',
    purchaseKm: 28000,
    currentKm: 45000,
    fuelType: 'Diesel S10',
    axles: 3,
    branches: ['Filial SP'],
    ownerBranch: 'Filial SP',
    hasComposition: true,
    purchaseDate: '2023-06-05',
    purchaseValue: 710000,
    supplierId: '5',
    images: [
      'https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '23',
    plate: 'LMN-0123',
    chassis: '9BWZZZ377VT004273',
    renavam: '00123456811',
    brand: 'Fiat',
    model: 'Ducato Cargo',
    manufacturingYear: 2022,
    modelYear: 2023,
    color: 'Branco',
    vehicleType: 'VUC',
    status: 'active',
    purchaseKm: 8000,
    currentKm: 18000,
    fuelType: 'Diesel S10',
    axles: 2,
    weight: 3.5,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    driverId: '6',
    hasComposition: false,
    purchaseDate: '2022-11-15',
    purchaseValue: 185000,
    supplierId: '6',
    images: [
      'https://images.unsplash.com/photo-1570560258091-1a8f8b8c7dfc?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '24',
    plate: 'OPQ-1234',
    chassis: '9BWZZZ377VT004274',
    renavam: '00123456812',
    brand: 'Hyundai',
    model: 'HR 2.5',
    manufacturingYear: 2023,
    modelYear: 2023,
    color: 'Prata',
    vehicleType: '3/4',
    status: 'active',
    purchaseKm: 5000,
    currentKm: 12000,
    fuelType: 'Diesel S10',
    axles: 2,
    weight: 3.0,
    branches: ['Filial SP'],
    ownerBranch: 'Filial SP',
    driverId: '7',
    hasComposition: false,
    purchaseDate: '2023-08-10',
    purchaseValue: 165000,
    supplierId: '6',
    images: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '25',
    plate: 'RST-2345',
    chassis: '9BWZZZ377VT004275',
    renavam: '00123456813',
    brand: 'Randon',
    model: 'Carreta Graneleira 3 Eixos',
    manufacturingYear: 2022,
    modelYear: 2023,
    color: 'Cinza',
    vehicleType: 'Carreta',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 16.0,
    branches: ['Filial RJ'],
    ownerBranch: 'Filial RJ',
    hasComposition: false,
    purchaseDate: '2023-02-28',
    purchaseValue: 205000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '26',
    plate: 'UVW-3456',
    chassis: '9BWZZZ377VT004276',
    renavam: '00123456814',
    brand: 'Librelato',
    model: 'Rodotrem Graneleiro 7 Eixos',
    manufacturingYear: 2023,
    modelYear: 2023,
    color: 'Preto',
    vehicleType: 'Rodotrem',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 7,
    weight: 25.0,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2023-09-12',
    purchaseValue: 420000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80'
  },
  {
    id: '22',
    plate: 'IJK-9012',
    chassis: '9BWZZZ377VT004272',
    renavam: '00123456810',
    brand: 'Mercedes-Benz',
    model: 'Actros 2651',
    manufacturingYear: 2019,
    modelYear: 2020,
    color: 'Azul',
    vehicleType: 'Cavalo Mecânico',
    status: 'sold',
    purchaseKm: 180000,
    currentKm: 285000,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 8.2,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2020-05-10',
    purchaseValue: 520000,
    supplierId: '5',
    previousStatus: 'active',
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
    saleInfo: {
      buyerName: 'Logística Brasil Transportes Ltda',
      buyerCpfCnpj: '78.912.345/0001-67',
      saleDate: '2024-10-15',
      km: 285000,
      salePrice: 380000,
      paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
      transferDocument: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
    }
  },
  // Novos mockups para teste de funcionalidade
  {
    id: '27',
    plate: 'TEST-1000',
    chassis: '9BWZZZ377VT004277',
    renavam: '00123456815',
    brand: 'Scania',
    model: 'R 450 A6x4',
    manufacturingYear: 2024,
    modelYear: 2024,
    color: 'Branco',
    vehicleType: 'Cavalo Mecânico',
    status: 'active',
    purchaseKm: 0,
    currentKm: 5000,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 7.8,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    driverId: '1',
    hasComposition: true,
    purchaseDate: '2024-01-15',
    purchaseValue: 650000,
    supplierId: '5',
    images: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
  },
  {
    id: '28',
    plate: 'TEST-1001',
    chassis: '9BWZZZ377VT004278',
    renavam: '00123456816',
    brand: 'Librelato',
    model: 'Baú Frigorífico 3 Eixos',
    manufacturingYear: 2024,
    modelYear: 2024,
    color: 'Branco',
    vehicleType: 'Baú Frigorífico',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 14.0,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2024-01-20',
    purchaseValue: 230000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  },
  {
    id: '29',
    plate: 'TEST-1002',
    chassis: '9BWZZZ377VT004279',
    renavam: '00123456817',
    brand: 'Librelato',
    model: 'Baú Frigorífico 3 Eixos',
    manufacturingYear: 2024,
    modelYear: 2024,
    color: 'Branco',
    vehicleType: 'Baú Frigorífico',
    status: 'active',
    purchaseKm: 0,
    currentKm: 0,
    fuelType: 'Diesel S10',
    axles: 3,
    weight: 14.0,
    branches: ['Matriz'],
    ownerBranch: 'Matriz',
    hasComposition: false,
    purchaseDate: '2024-01-20',
    purchaseValue: 230000,
    supplierId: '4',
    images: [
      'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80'
    ],
    crlvDocument: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    purchaseInvoice: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
  }
];

const mockRefuelings: Refueling[] = [
  // Abastecimentos do veículo 1 (ABC-1234)
  {
    id: '1',
    vehicleId: '1',
    date: '2025-10-10',
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
    date: '2025-10-03',
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
    date: '2025-09-26',
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
    date: '2025-09-20',
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
    date: '2025-10-09',
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
    date: '2025-10-02',
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
    date: '2025-09-26',
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
    date: '2025-09-19',
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
    date: '2025-10-07',
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
    date: '2025-09-30',
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
    date: '2025-09-24',
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
    date: '2025-09-17',
    km: 47000,
    liters: 275,
    pricePerLiter: 6.12,
    totalValue: 1683.00,
    fuelType: 'Diesel S500',
    supplierId: '2',
    driver: 'João Pereira'
  },
  // Abastecimentos do veículo 20 (TUV-4567)
  {
    id: '13',
    vehicleId: '20',
    date: '2025-10-11',
    km: 68000,
    liters: 330,
    pricePerLiter: 5.91,
    totalValue: 1950.30,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Carlos Santos'
  },
  {
    id: '14',
    vehicleId: '20',
    date: '2025-10-04',
    km: 66200,
    liters: 325,
    pricePerLiter: 5.94,
    totalValue: 1930.50,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'Carlos Santos'
  },
  {
    id: '15',
    vehicleId: '20',
    date: '2025-09-27',
    km: 64500,
    liters: 320,
    pricePerLiter: 5.87,
    totalValue: 1878.40,
    fuelType: 'Diesel S10',
    supplierId: '11',
    driver: 'Carlos Santos'
  },
  // Abastecimentos do veículo 19 (ZAB-6789)
  {
    id: '16',
    vehicleId: '19',
    date: '2025-10-10',
    km: 168000,
    liters: 340,
    pricePerLiter: 5.88,
    totalValue: 1999.20,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Thiago Mendes'
  },
  {
    id: '17',
    vehicleId: '19',
    date: '2025-10-03',
    km: 165800,
    liters: 335,
    pricePerLiter: 5.92,
    totalValue: 1983.20,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Thiago Mendes'
  },
  {
    id: '18',
    vehicleId: '19',
    date: '2025-09-26',
    km: 163600,
    liters: 330,
    pricePerLiter: 5.85,
    totalValue: 1930.50,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Thiago Mendes'
  },
  // Abastecimentos de equipamento de refrigeração 1
  {
    id: '19',
    refrigerationUnitId: '1',
    date: '2025-10-09',
    usageHours: 3250,
    liters: 25,
    pricePerLiter: 6.20,
    totalValue: 155.00,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Carlos Santos'
  },
  {
    id: '20',
    refrigerationUnitId: '1',
    date: '2025-10-02',
    usageHours: 3180,
    liters: 24,
    pricePerLiter: 6.25,
    totalValue: 150.00,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'Carlos Santos'
  },
  {
    id: '21',
    refrigerationUnitId: '1',
    date: '2025-09-26',
    usageHours: 3115,
    liters: 23,
    pricePerLiter: 6.18,
    totalValue: 142.14,
    fuelType: 'Diesel S10',
    supplierId: '11',
    driver: 'Carlos Santos'
  },
  {
    id: '101',
    refrigerationUnitId: '1',
    date: '2025-09-19',
    usageHours: 3050,
    liters: 22,
    pricePerLiter: 6.15,
    totalValue: 135.30,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Carlos Santos'
  },
  {
    id: '102',
    refrigerationUnitId: '1',
    date: '2025-09-12',
    usageHours: 2985,
    liters: 23,
    pricePerLiter: 6.22,
    totalValue: 143.06,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'Carlos Santos'
  },
  // Abastecimentos de equipamento de refrigeração 2
  {
    id: '22',
    refrigerationUnitId: '2',
    date: '2025-10-08',
    usageHours: 4580,
    liters: 22,
    pricePerLiter: 6.22,
    totalValue: 136.84,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Pedro Lima'
  },
  {
    id: '23',
    refrigerationUnitId: '2',
    date: '2025-10-01',
    usageHours: 4515,
    liters: 21,
    pricePerLiter: 6.28,
    totalValue: 131.88,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Pedro Lima'
  },
  {
    id: '24',
    refrigerationUnitId: '2',
    date: '2025-09-25',
    usageHours: 4450,
    liters: 22,
    pricePerLiter: 6.15,
    totalValue: 135.30,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Pedro Lima'
  },
  {
    id: '103',
    refrigerationUnitId: '2',
    date: '2025-09-18',
    usageHours: 4385,
    liters: 21,
    pricePerLiter: 6.18,
    totalValue: 129.78,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Pedro Lima'
  },
  {
    id: '104',
    refrigerationUnitId: '2',
    date: '2025-09-11',
    usageHours: 4320,
    liters: 22,
    pricePerLiter: 6.20,
    totalValue: 136.40,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Pedro Lima'
  },
  // Abastecimentos de equipamento de refrigeração 3
  {
    id: '105',
    refrigerationUnitId: '3',
    date: '2025-10-10',
    usageHours: 1580,
    liters: 18,
    pricePerLiter: 6.25,
    totalValue: 112.50,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'João Pereira'
  },
  {
    id: '106',
    refrigerationUnitId: '3',
    date: '2025-10-03',
    usageHours: 1525,
    liters: 17,
    pricePerLiter: 6.28,
    totalValue: 106.76,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'João Pereira'
  },
  {
    id: '107',
    refrigerationUnitId: '3',
    date: '2025-09-27',
    usageHours: 1470,
    liters: 18,
    pricePerLiter: 6.15,
    totalValue: 110.70,
    fuelType: 'Diesel S10',
    supplierId: '11',
    driver: 'João Pereira'
  },
  {
    id: '108',
    refrigerationUnitId: '3',
    date: '2025-09-20',
    usageHours: 1415,
    liters: 17,
    pricePerLiter: 6.18,
    totalValue: 105.06,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'João Pereira'
  },
  {
    id: '109',
    refrigerationUnitId: '3',
    date: '2025-09-13',
    usageHours: 1360,
    liters: 18,
    pricePerLiter: 6.22,
    totalValue: 111.96,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'João Pereira'
  },
  // Abastecimentos de equipamento de refrigeração 4
  {
    id: '110',
    refrigerationUnitId: '4',
    date: '2025-10-07',
    usageHours: 2180,
    liters: 20,
    pricePerLiter: 6.30,
    totalValue: 126.00,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Marcos Costa'
  },
  {
    id: '111',
    refrigerationUnitId: '4',
    date: '2025-09-30',
    usageHours: 2120,
    liters: 19,
    pricePerLiter: 6.25,
    totalValue: 118.75,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Marcos Costa'
  },
  {
    id: '112',
    refrigerationUnitId: '4',
    date: '2025-09-24',
    usageHours: 2060,
    liters: 20,
    pricePerLiter: 6.18,
    totalValue: 123.60,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Marcos Costa'
  },
  {
    id: '113',
    refrigerationUnitId: '4',
    date: '2025-09-17',
    usageHours: 2000,
    liters: 19,
    pricePerLiter: 6.20,
    totalValue: 117.80,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Marcos Costa'
  },
  {
    id: '114',
    refrigerationUnitId: '4',
    date: '2025-09-10',
    usageHours: 1940,
    liters: 20,
    pricePerLiter: 6.15,
    totalValue: 123.00,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Marcos Costa'
  },
  // Abastecimentos de equipamento de refrigeração 5
  {
    id: '115',
    refrigerationUnitId: '5',
    date: '2025-10-06',
    usageHours: 3820,
    liters: 24,
    pricePerLiter: 6.28,
    totalValue: 150.72,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Roberto Silva'
  },
  {
    id: '116',
    refrigerationUnitId: '5',
    date: '2025-09-29',
    usageHours: 3750,
    liters: 23,
    pricePerLiter: 6.22,
    totalValue: 143.06,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'Roberto Silva'
  },
  {
    id: '117',
    refrigerationUnitId: '5',
    date: '2025-09-23',
    usageHours: 3680,
    liters: 24,
    pricePerLiter: 6.15,
    totalValue: 147.60,
    fuelType: 'Diesel S10',
    supplierId: '11',
    driver: 'Roberto Silva'
  },
  {
    id: '118',
    refrigerationUnitId: '5',
    date: '2025-09-16',
    usageHours: 3610,
    liters: 23,
    pricePerLiter: 6.18,
    totalValue: 142.14,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Roberto Silva'
  },
  {
    id: '119',
    refrigerationUnitId: '5',
    date: '2025-09-09',
    usageHours: 3540,
    liters: 24,
    pricePerLiter: 6.20,
    totalValue: 148.80,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'Roberto Silva'
  },
  // Abastecimentos de equipamento de refrigeração 6
  {
    id: '120',
    refrigerationUnitId: '6',
    date: '2025-10-08',
    usageHours: 2650,
    liters: 21,
    pricePerLiter: 6.32,
    totalValue: 132.72,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Ana Silva'
  },
  {
    id: '121',
    refrigerationUnitId: '6',
    date: '2025-10-01',
    usageHours: 2585,
    liters: 20,
    pricePerLiter: 6.28,
    totalValue: 125.60,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'Ana Silva'
  },
  {
    id: '122',
    refrigerationUnitId: '6',
    date: '2025-09-25',
    usageHours: 2520,
    liters: 21,
    pricePerLiter: 6.18,
    totalValue: 129.78,
    fuelType: 'Diesel S10',
    supplierId: '11',
    driver: 'Ana Silva'
  },
  {
    id: '123',
    refrigerationUnitId: '6',
    date: '2025-09-18',
    usageHours: 2455,
    liters: 20,
    pricePerLiter: 6.20,
    totalValue: 124.00,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Ana Silva'
  },
  {
    id: '124',
    refrigerationUnitId: '6',
    date: '2025-09-11',
    usageHours: 2390,
    liters: 21,
    pricePerLiter: 6.15,
    totalValue: 129.15,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'Ana Silva'
  },
  // Abastecimentos de equipamento de refrigeração 8
  {
    id: '125',
    refrigerationUnitId: '8',
    date: '2025-10-09',
    usageHours: 5780,
    liters: 26,
    pricePerLiter: 6.25,
    totalValue: 162.50,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Fernando Costa'
  },
  {
    id: '126',
    refrigerationUnitId: '8',
    date: '2025-10-02',
    usageHours: 5705,
    liters: 25,
    pricePerLiter: 6.28,
    totalValue: 157.00,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Fernando Costa'
  },
  {
    id: '127',
    refrigerationUnitId: '8',
    date: '2025-09-26',
    usageHours: 5630,
    liters: 26,
    pricePerLiter: 6.18,
    totalValue: 160.68,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Fernando Costa'
  },
  {
    id: '128',
    refrigerationUnitId: '8',
    date: '2025-09-19',
    usageHours: 5555,
    liters: 25,
    pricePerLiter: 6.20,
    totalValue: 155.00,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Fernando Costa'
  },
  {
    id: '129',
    refrigerationUnitId: '8',
    date: '2025-09-12',
    usageHours: 5480,
    liters: 26,
    pricePerLiter: 6.22,
    totalValue: 161.72,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Fernando Costa'
  },
  // Abastecimentos do veículo 4 (JKL-2345)
  {
    id: '25',
    vehicleId: '4',
    date: '2025-10-06',
    km: 98500,
    liters: 300,
    pricePerLiter: 5.90,
    totalValue: 1770.00,
    fuelType: 'Diesel S10',
    supplierId: '10',
    driver: 'Roberto Silva'
  },
  {
    id: '26',
    vehicleId: '4',
    date: '2025-09-29',
    km: 96800,
    liters: 295,
    pricePerLiter: 5.93,
    totalValue: 1749.35,
    fuelType: 'Diesel S10',
    supplierId: '11',
    driver: 'Roberto Silva'
  },
  // Abastecimentos do veículo 5 (MNO-3456)
  {
    id: '27',
    vehicleId: '5',
    date: '2025-10-05',
    km: 142000,
    liters: 310,
    pricePerLiter: 5.89,
    totalValue: 1825.90,
    fuelType: 'Diesel S10',
    supplierId: '3',
    driver: 'Marcos Costa'
  },
  {
    id: '28',
    vehicleId: '5',
    date: '2025-09-28',
    km: 140200,
    liters: 305,
    pricePerLiter: 5.92,
    totalValue: 1805.60,
    fuelType: 'Diesel S10',
    supplierId: '1',
    driver: 'Marcos Costa'
  }
];

const mockRefrigerationUnits: RefrigerationUnit[] = [
  {
    id: '1',
    vehicleId: '4', // Sider XYZ-1111 (reboque vinculado ao cavalo mecânico ABC-1234)
    companyId: '1',
    brand: 'Thermo King',
    model: 'SLXi-300',
    serialNumber: 'TK123456',
    type: 'freezer',
    minTemp: -25,
    maxTemp: -18,
    installDate: '2022-03-20',
    purchaseDate: '2022-03-15',
    purchaseValue: 85000,
    supplierId: '9',
    initialUsageHours: 2800,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '2',
    vehicleId: '2', // Bitruck DEF-5678
    companyId: '1',
    brand: 'Carrier',
    model: 'Supra 950',
    serialNumber: 'CR789012',
    type: 'cooled',
    minTemp: 0,
    maxTemp: 8,
    installDate: '2021-09-01',
    purchaseDate: '2021-08-25',
    purchaseValue: 72000,
    supplierId: '9',
    initialUsageHours: 4200,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '3',
    companyId: '2',
    brand: 'Thermo King',
    model: 'T-Series',
    serialNumber: 'TK456789',
    type: 'freezer',
    minTemp: -20,
    maxTemp: -15,
    installDate: '2023-05-15',
    purchaseDate: '2023-05-10',
    purchaseValue: 78000,
    supplierId: '9',
    initialUsageHours: 850,
    fuelType: 'Diesel S10',
    status: 'maintenance'
  },
  {
    id: '4',
    vehicleId: '3', // Truck GHI-9012
    companyId: '2',
    brand: 'Carrier',
    model: 'Xarios 600',
    serialNumber: 'CR567890',
    type: 'freezer',
    minTemp: -22,
    maxTemp: -18,
    installDate: '2023-01-15',
    purchaseDate: '2023-01-10',
    purchaseValue: 90000,
    supplierId: '9',
    initialUsageHours: 1200,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '5',
    vehicleId: '7', // VUC PQR-4567
    companyId: '1',
    brand: 'Thermo King',
    model: 'V-300',
    serialNumber: 'TK234567',
    type: 'cooled',
    minTemp: 2,
    maxTemp: 8,
    installDate: '2023-02-15',
    purchaseDate: '2023-02-10',
    purchaseValue: 45000,
    supplierId: '9',
    initialUsageHours: 950,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '6',
    vehicleId: '8', // 3/4 STU-5678
    companyId: '3',
    brand: 'Carrier',
    model: 'Pulsor Max',
    serialNumber: 'CR890123',
    type: 'climatized',
    minTemp: 15,
    maxTemp: 25,
    installDate: '2022-06-20',
    purchaseDate: '2022-06-15',
    purchaseValue: 38000,
    supplierId: '9',
    initialUsageHours: 2100,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '7',
    companyId: '1',
    brand: 'Thermo King',
    model: 'SLXe Spectrum',
    serialNumber: 'TK987654',
    type: 'freezer',
    minTemp: -28,
    maxTemp: -20,
    installDate: '2024-01-10',
    purchaseDate: '2024-01-05',
    purchaseValue: 95000,
    supplierId: '9',
    initialUsageHours: 150,
    fuelType: 'Diesel S10',
    status: 'inactive'
  },
  {
    id: '8',
    companyId: '2',
    brand: 'Carrier',
    model: 'Vector 1950',
    serialNumber: 'CR654321',
    type: 'freezer',
    minTemp: -25,
    maxTemp: -18,
    installDate: '2021-08-15',
    purchaseDate: '2021-08-10',
    purchaseValue: 105000,
    supplierId: '9',
    initialUsageHours: 5200,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '9',
    companyId: '3',
    brand: 'Thermo King',
    model: 'C-Series',
    serialNumber: 'TK345678',
    type: 'cooled',
    minTemp: -5,
    maxTemp: 5,
    installDate: '2023-11-20',
    purchaseDate: '2023-11-15',
    purchaseValue: 68000,
    supplierId: '9',
    initialUsageHours: 320,
    fuelType: 'Diesel S10',
    status: 'defective'
  },
  {
    id: '11',
    vehicleId: '5', // Baú Frigorífico JKL-2345
    companyId: '1',
    brand: 'Thermo King',
    model: 'SB-400',
    serialNumber: 'TK567890',
    type: 'freezer',
    minTemp: -20,
    maxTemp: -15,
    installDate: '2022-07-20',
    purchaseDate: '2022-07-15',
    purchaseValue: 82000,
    supplierId: '9',
    initialUsageHours: 1650,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '12',
    vehicleId: '23', // VUC Fiat Ducato LMN-0123
    companyId: '1',
    brand: 'Carrier',
    model: 'Xarios 500',
    serialNumber: 'CR135790',
    type: 'cooled',
    minTemp: 0,
    maxTemp: 10,
    installDate: '2022-11-20',
    purchaseDate: '2022-11-15',
    purchaseValue: 48000,
    supplierId: '9',
    initialUsageHours: 420,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '13',
    vehicleId: '24', // 3/4 Hyundai OPQ-1234
    companyId: '2',
    brand: 'Thermo King',
    model: 'V-200',
    serialNumber: 'TK876543',
    type: 'climatized',
    minTemp: 10,
    maxTemp: 20,
    installDate: '2023-08-15',
    purchaseDate: '2023-08-10',
    purchaseValue: 42000,
    supplierId: '9',
    initialUsageHours: 280,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '10',
    companyId: '1',
    brand: 'Carrier',
    model: 'Supra 850',
    serialNumber: 'CR246813',
    type: 'climatized',
    minTemp: 12,
    maxTemp: 22,
    installDate: '2022-12-05',
    purchaseDate: '2022-12-01',
    purchaseValue: 52000,
    supplierId: '9',
    initialUsageHours: 1850,
    fuelType: 'Diesel S10',
    status: 'sold',
    previousStatus: 'active',
    saleInfo: {
      buyerName: 'Transportes Sul Ltda',
      buyerCpfCnpj: '45.678.912/0001-34',
      saleDate: '2024-11-10',
      usageHours: 2450,
      salePrice: 38000,
      paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80'
    }
  },
  // Novos equipamentos de refrigeração para teste
  {
    id: '14',
    vehicleId: '28', // Baú Frigorífico TEST-1001
    companyId: '1',
    brand: 'Thermo King',
    model: 'SLXe-400',
    serialNumber: 'TK-TEST-001',
    type: 'freezer',
    minTemp: -25,
    maxTemp: -18,
    installDate: '2024-01-25',
    purchaseDate: '2024-01-20',
    purchaseValue: 88000,
    supplierId: '9',
    initialUsageHours: 0,
    fuelType: 'Diesel S10',
    status: 'active'
  },
  {
    id: '15',
    vehicleId: '29', // Baú Frigorífico TEST-1002
    companyId: '1',
    brand: 'Carrier',
    model: 'Vector 1850',
    serialNumber: 'CR-TEST-002',
    type: 'freezer',
    minTemp: -25,
    maxTemp: -18,
    installDate: '2024-01-25',
    purchaseDate: '2024-01-20',
    purchaseValue: 92000,
    supplierId: '9',
    initialUsageHours: 0,
    fuelType: 'Diesel S10',
    status: 'active'
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
    branches: ['Matriz', 'Filial SP'],
    active: true
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
    branches: ['Matriz'],
    active: true
  },
  {
    id: '3',
    cnpj: '45.678.912/0001-34',
    name: 'Ipiranga Produtos de Petróleo S.A.',
    fantasyName: 'Posto Ipiranga Dutra',
    type: 'gas_station',
    brand: 'Ipiranga',
    city: 'Rio de Janeiro',
    state: 'RJ',
    phone: '(21) 3456-7890',
    contactPerson: 'Maria Santos',
    branches: ['Filial RJ'],
    active: true
  },
  {
    id: '4',
    cnpj: '78.912.345/0001-67',
    name: 'Oficina Mecânica Total Truck',
    fantasyName: 'Total Truck',
    type: 'workshop',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 4567-8901',
    contactPerson: 'Roberto Mecânico',
    branches: ['Matriz', 'Filial SP'],
    active: true
  },
  {
    id: '5',
    cnpj: '32.165.498/0001-89',
    name: 'Volvo do Brasil',
    fantasyName: 'Concessionária Volvo SP',
    type: 'dealer',
    brand: 'Volvo',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 5678-9012',
    contactPerson: 'Carlos Vendas',
    branches: ['Matriz', 'Filial SP', 'Filial RJ'],
    active: true
  },
  {
    id: '6',
    cnpj: '65.432.198/0001-12',
    name: 'Scania Brasil',
    fantasyName: 'Concessionária Scania',
    type: 'dealer',
    brand: 'Scania',
    city: 'Campinas',
    state: 'SP',
    phone: '(19) 6789-0123',
    contactPerson: 'Paulo Vendedor',
    branches: ['Matriz'],
    active: true
  },
  {
    id: '7',
    cnpj: '98.732.165/0001-45',
    name: 'Auto Peças Brasil Ltda',
    fantasyName: 'Auto Peças Express',
    type: 'parts_store',
    city: 'Belo Horizonte',
    state: 'MG',
    phone: '(31) 7890-1234',
    contactPerson: 'Ana Peças',
    branches: ['Filial MG'],
    active: true
  },
  {
    id: '8',
    cnpj: '14.725.836/0001-78',
    name: 'Pneus Michelin do Brasil',
    fantasyName: 'Michelin Center',
    type: 'tire_store',
    brand: 'Michelin',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 8901-2345',
    contactPerson: 'José Pneus',
    branches: ['Matriz', 'Filial SP', 'Filial RJ', 'Filial MG'],
    active: true
  },
  {
    id: '9',
    cnpj: '36.925.814/0001-90',
    name: 'Thermo King Brasil',
    fantasyName: 'Thermo King Refrigeração',
    type: 'refrigeration_equipment',
    brand: 'Thermo King',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 9012-3456',
    contactPerson: 'Ricardo Técnico',
    branches: ['Matriz', 'Filial SP'],
    active: true
  },
  {
    id: '10',
    cnpj: '75.318.426/0001-23',
    name: 'BR Distribuidora de Combustíveis',
    fantasyName: 'Posto BR Via Anhanguera',
    type: 'gas_station',
    brand: 'BR',
    city: 'Jundiaí',
    state: 'SP',
    phone: '(11) 2345-6789',
    contactPerson: 'Fernanda Gerente',
    branches: ['Filial SP'],
    active: true
  },
  {
    id: '11',
    cnpj: '84.629.513/0001-56',
    name: 'Raízen Combustíveis',
    fantasyName: 'Posto Shell Raposo',
    type: 'gas_station',
    brand: 'Shell',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3456-7891',
    contactPerson: 'Marcos Frentista',
    branches: ['Matriz', 'Filial SP'],
    active: true
  },
  {
    id: '12',
    cnpj: '95.174.826/0001-67',
    name: 'Oficina Diesel Power',
    fantasyName: 'Diesel Power Manutenção',
    type: 'workshop',
    city: 'Rio de Janeiro',
    state: 'RJ',
    phone: '(21) 4567-8902',
    contactPerson: 'André Mecânico',
    branches: ['Filial RJ'],
    active: false
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
    name: 'Matriz',
    cnpj: '12.345.678/0001-90',
    city: 'São Paulo',
    state: 'SP',
    active: true,
  },
  {
    id: '2',
    type: 'filial',
    name: 'Filial RJ',
    cnpj: '12.345.678/0002-71',
    city: 'Rio de Janeiro',
    state: 'RJ',
    matrizId: '1',
    active: true,
  },
  {
    id: '3',
    type: 'filial',
    name: 'Filial MG',
    cnpj: '12.345.678/0003-52',
    city: 'Belo Horizonte',
    state: 'MG',
    matrizId: '1',
    active: true,
  },
  {
    id: '4',
    type: 'filial',
    name: 'Filial SP',
    cnpj: '12.345.678/0004-33',
    city: 'Guarulhos',
    state: 'SP',
    matrizId: '1',
    active: true,
  },
  {
    id: '5',
    type: 'filial',
    name: 'Filial PR',
    cnpj: '12.345.678/0005-14',
    city: 'Curitiba',
    state: 'PR',
    matrizId: '1',
    active: true,
  },
  {
    id: '6',
    type: 'filial',
    name: 'Filial Campinas',
    cnpj: '12.345.678/0006-95',
    city: 'Campinas',
    state: 'SP',
    matrizId: '1',
    active: false,
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
    
    // Se o motorista foi inativado, desvincular de todos os veículos
    if (data.active === false) {
      setVehicles(prev => prev.map(v => 
        v.driverId === id ? { ...v, driverId: undefined } : v
      ));
    }
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
    
    // Lógica de composições removida - usar a API real para gerenciar composições
    setVehicles(prev => [...prev, newVehicle]);
    
    return newVehicle;
  }, []);
  const updateVehicle = useCallback((id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => {
      // Lógica de compositions removida - usar a API real para gerenciar composições
      return prev.map(v => {
        if (v.id === id) {
          if (data.purchaseKm && v.currentKm < data.purchaseKm) {
            return { ...v, ...data, currentKm: data.purchaseKm };
          }
          return { ...v, ...data };
        }
        return v;
      });
    });
  }, []);
  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, []);
  const sellVehicle = useCallback((id: string, saleData: VehicleSale) => {
    setVehicles(prev => {
      // Encontrar o veículo sendo vendido
      const vehicleBeingSold = prev.find(v => v.id === id);
      
      return prev.map(v => {
        // Atualizar o veículo vendido
        if (v.id === id) {
          return { 
            ...v, 
            previousStatus: v.status as 'active' | 'maintenance' | 'inactive',
            status: 'sold' as const, 
            saleInfo: saleData, 
            currentKm: saleData.km,
            driverId: undefined,
            // Composições gerenciadas pela API
            hasComposition: false,
          };
        }
        
        return v;
      });
    });
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
    setVehicles(prev => {
      const vehicle = prev.find(v => v.id === refueling.vehicleId);
      if (!vehicle) return prev;
      
      const oldKm = vehicle.currentKm;
      const newKm = Math.max(oldKm, refueling.km);
      const kmIncrement = newKm - oldKm;
      
      return prev.map(v => {
        // Atualiza o veículo de tração
        if (v.id === refueling.vehicleId) {
          return { ...v, currentKm: newKm };
        }
        
        // Atualiza os reboques vinculados ao veículo de tração
        if (vehicle.hasComposition && vehicle.composition?.some(comp => comp.trailerVehicleId === v.id)) {
          return { ...v, currentKm: v.currentKm + kmIncrement };
        }
        
        return v;
      });
    });
    
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
  
  const sellRefrigerationUnit = useCallback((id: string, saleData: RefrigerationSale) => {
    setRefrigerationUnits(prev => prev.map(u => 
      u.id === id 
        ? { 
            ...u, 
            previousStatus: u.status as 'active' | 'defective' | 'maintenance',
            status: 'sold' as const, 
            saleInfo: saleData,
            vehicleId: undefined
          } 
        : u
    ));
  }, []);
  
  const reverseRefrigerationSale = useCallback((id: string) => {
    setRefrigerationUnits(prev => prev.map(u => 
      u.id === id 
        ? { 
            ...u, 
            status: (u.previousStatus || 'maintenance') as 'active' | 'defective' | 'maintenance',
            saleInfo: undefined,
            previousStatus: undefined
          } 
        : u
    ));
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
    const defectiveVehicles = vehicles.filter(v => v.status === 'defective').length;
    const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;
    const soldVehicles = vehicles.filter(v => v.status === 'sold').length;
    
    // Disponibilidade: Ativos/(Ativos+Manutenção+Defeituosos+Inativos)
    const denominator = activeVehicles + maintenanceVehicles + defectiveVehicles + inactiveVehicles;
    const availability = denominator > 0 
      ? ((activeVehicles / denominator) * 100).toFixed(1) 
      : '0';
    
    // Filtrar abastecimentos do mês atual apenas de veículos
    const now = new Date();
    const thisMonthRefuelings = refuelings.filter(r => {
      if (!r.vehicleId) return false; // Apenas veículos
      const refuelDate = new Date(r.date);
      return refuelDate.getMonth() === now.getMonth() && 
             refuelDate.getFullYear() === now.getFullYear();
    });
    
    const totalFuelCost = thisMonthRefuelings.reduce((sum, r) => sum + r.totalValue, 0);
    
    // Calcular consumo médio real (km/L) baseado em abastecimentos consecutivos
    let totalConsumption = 0;
    let consumptionCount = 0;
    
    vehicles.forEach(vehicle => {
      // Pular reboques, veículos sem motor próprio e veículos vendidos
      const trailerTypes = ['Baú', 'Carreta', 'Graneleiro', 'Container', 'Caçamba', 'Baú Frigorífico', 'Sider', 'Prancha', 'Tanque', 'Cegonheiro', 'Rodotrem'];
      if (trailerTypes.includes(vehicle.vehicleType) || vehicle.status === 'sold') return;
      
      const vehicleRefuelings = refuelings
        .filter(r => r.vehicleId === vehicle.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calcular consumo entre abastecimentos consecutivos
      for (let i = 1; i < vehicleRefuelings.length; i++) {
        const kmDiff = (vehicleRefuelings[i].km || 0) - (vehicleRefuelings[i - 1].km || 0);
        const liters = vehicleRefuelings[i].liters;
        
        if (kmDiff > 0 && liters > 0) {
          const consumption = kmDiff / liters;
          // Filtrar valores absurdos (consumo entre 1 e 10 km/L é razoável para caminhões)
          if (consumption >= 1 && consumption <= 10) {
            totalConsumption += consumption;
            consumptionCount++;
          }
        }
      }
    });
    
    const avgConsumption = consumptionCount > 0 
      ? (totalConsumption / consumptionCount).toFixed(2) 
      : '0.00';

    return {
      totalVehicles: vehicles.filter(v => v.status !== 'sold').length,
      activeVehicles,
      maintenanceVehicles,
      defectiveVehicles,
      inactiveVehicles,
      soldVehicles,
      totalFuelCost,
      avgConsumption,
      availability
    };
  }, [vehicles, refuelings]);

  // Dashboard Stats for Refrigeration
  const getDashboardStatsForRefrigeration = useCallback(() => {
    const activeUnits = refrigerationUnits.filter(u => u.status === 'active').length;
    const maintenanceUnits = refrigerationUnits.filter(u => u.status === 'maintenance').length;
    const defectiveUnits = refrigerationUnits.filter(u => u.status === 'defective').length;
    const inactiveUnits = refrigerationUnits.filter(u => u.status === 'inactive').length;
    const soldUnits = refrigerationUnits.filter(u => u.status === 'sold').length;
    
    // Disponibilidade: Ativos/(Ativos+Manutenção+Defeituosos+Inativos)
    const denominator = activeUnits + maintenanceUnits + defectiveUnits + inactiveUnits;
    const availability = denominator > 0 
      ? ((activeUnits / denominator) * 100).toFixed(1) 
      : '0';
    
    // Filtrar abastecimentos do mês atual apenas de equipamentos de refrigeração
    const now = new Date();
    const thisMonthRefuelings = refuelings.filter(r => {
      if (!r.refrigerationUnitId) return false;
      const refuelDate = new Date(r.date);
      return refuelDate.getMonth() === now.getMonth() && 
             refuelDate.getFullYear() === now.getFullYear();
    });
    
    const totalFuelCost = thisMonthRefuelings.reduce((sum, r) => sum + r.totalValue, 0);
    
    // Calcular consumo médio (litros/hora) baseado em abastecimentos consecutivos
    let totalConsumption = 0;
    let consumptionCount = 0;
    
    refrigerationUnits.forEach(unit => {
      // Pular equipamentos vendidos
      if (unit.status === 'sold') return;
      
      const unitRefuelings = refuelings
        .filter(r => r.refrigerationUnitId === unit.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calcular consumo entre abastecimentos consecutivos
      for (let i = 1; i < unitRefuelings.length; i++) {
        const hoursDiff = (unitRefuelings[i].usageHours || 0) - (unitRefuelings[i - 1].usageHours || 0);
        const liters = unitRefuelings[i].liters;
        
        if (hoursDiff > 0 && liters > 0) {
          const consumption = liters / hoursDiff;
          // Filtrar valores absurdos (consumo entre 0.2 e 5 L/h é razoável para refrigeração)
          if (consumption >= 0.2 && consumption <= 5) {
            totalConsumption += consumption;
            consumptionCount++;
          }
        }
      }
    });
    
    const avgConsumption = consumptionCount > 0 
      ? (totalConsumption / consumptionCount).toFixed(2) 
      : '0.00';

    return {
      totalUnits: refrigerationUnits.filter(u => u.status !== 'sold').length,
      activeUnits,
      maintenanceUnits,
      defectiveUnits,
      inactiveUnits,
      soldUnits,
      totalFuelCost,
      avgConsumption,
      availability
    };
  }, [refrigerationUnits, refuelings]);

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
    sellRefrigerationUnit,
    reverseRefrigerationSale,
    
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
    getDashboardStats,
    getDashboardStatsForRefrigeration
  };
}
