import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Vehicle, RefrigerationUnit, Refueling } from '@/hooks/useMockData';

/**
 * Exporta dados de veículos para Excel
 */
export const exportVehiclesToExcel = (vehicles: Vehicle[]) => {
  const data = vehicles.map(v => ({
    'Placa': v.plate,
    'Tipo': v.vehicleType,
    'Marca': v.brand,
    'Modelo': v.model,
    'Ano Fabricação': v.manufacturingYear,
    'Ano Modelo': v.modelYear,
    'Chassis': v.chassis,
    'RENAVAM': v.renavam,
    'Cor': v.color,
    'Combustível': v.fuelType,
    'KM Compra': v.purchaseKm,
    'Peso (ton)': v.weight || '-',
    'Eixos': v.axles || '-',
    'Valor Compra (R$)': v.purchaseValue ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(v.purchaseValue) : '-',
    'Data Compra': v.purchaseDate ? format(new Date(v.purchaseDate), 'dd/MM/yyyy') : '-',
    'Status': 
      v.status === 'active' ? 'Ativo' :
      v.status === 'defective' ? 'Com Defeito' :
      v.status === 'maintenance' ? 'Em Manutenção' :
      v.status === 'inactive' ? 'Inativo' : 'Vendido',
    'Motorista': v.driverId || '-',
    'Fornecedor': v.supplierId || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Veículos');

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 10 }, // Placa
    { wch: 12 }, // Tipo
    { wch: 15 }, // Marca
    { wch: 20 }, // Modelo
    { wch: 15 }, // Ano Fabricação
    { wch: 12 }, // Ano Modelo
    { wch: 18 }, // Chassis
    { wch: 12 }, // RENAVAM
    { wch: 12 }, // Cor
    { wch: 15 }, // Combustível
    { wch: 12 }, // KM Compra
    { wch: 12 }, // Peso
    { wch: 8 },  // Eixos
    { wch: 18 }, // Valor Compra
    { wch: 12 }, // Data Compra
    { wch: 15 }, // Status
    { wch: 15 }, // Motorista
    { wch: 15 }, // Fornecedor
  ];
  ws['!cols'] = colWidths;

  const fileName = `veiculos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Exporta dados de equipamentos de refrigeração para Excel
 */
export const exportRefrigerationsToExcel = (units: RefrigerationUnit[]) => {
  const data = units.map(r => ({
    'Número de Série': r.serialNumber,
    'Tipo': 
      r.type === 'freezer' ? 'Freezer' :
      r.type === 'cooled' ? 'Refrigerado' : 'Climatizado',
    'Marca': r.brand,
    'Modelo': r.model,
    'Temp. Mínima (°C)': new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.minTemp),
    'Temp. Máxima (°C)': new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.maxTemp),
    'Combustível': r.fuelType || '-',
    'Data Instalação': format(new Date(r.installDate), 'dd/MM/yyyy'),
    'Horímetro Compra': r.initialUsageHours || '-',
    'Valor Compra (R$)': r.purchaseValue ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.purchaseValue) : '-',
    'Data Compra': r.purchaseDate ? format(new Date(r.purchaseDate), 'dd/MM/yyyy') : '-',
    'Status': 
      r.status === 'active' ? 'Ativo' :
      r.status === 'defective' ? 'Com Defeito' :
      r.status === 'maintenance' ? 'Em Manutenção' :
      r.status === 'inactive' ? 'Inativo' : 'Vendido',
    'Veículo': r.vehicleId || '-',
    'Fornecedor': r.supplierId || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Refrigeração');

  const colWidths = [
    { wch: 18 }, // Número de Série
    { wch: 15 }, // Tipo
    { wch: 15 }, // Marca
    { wch: 20 }, // Modelo
    { wch: 18 }, // Temp. Mínima
    { wch: 18 }, // Temp. Máxima
    { wch: 15 }, // Combustível
    { wch: 16 }, // Data Instalação
    { wch: 16 }, // Horímetro Compra
    { wch: 18 }, // Valor Compra
    { wch: 12 }, // Data Compra
    { wch: 15 }, // Status
    { wch: 15 }, // Veículo
    { wch: 15 }, // Fornecedor
  ];
  ws['!cols'] = colWidths;

  const fileName = `refrigeracao_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Exporta dados de abastecimentos para Excel
 */
export const exportRefuelingsToExcel = (
  refuelings: Refueling[],
  vehicles: Vehicle[],
  refrigerationUnits: RefrigerationUnit[]
) => {
  const data = refuelings.map(r => {
    const vehicle = vehicles.find(v => v.id === r.vehicleId);
    const refrigeration = refrigerationUnits.find(ru => ru.id === r.refrigerationUnitId);
    
    return {
      'Data': format(new Date(r.date), 'dd/MM/yyyy'),
      'Tipo': r.vehicleId ? 'Veículo' : 'Refrigeração',
      'Identificação': r.vehicleId 
        ? (vehicle?.plate || '-')
        : (refrigeration?.serialNumber || '-'),
      'KM/Horímetro': r.km || r.usageHours || '-',
      'Combustível': r.fuelType,
      'Litros': new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.liters),
      'Preço/Litro (R$)': new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.pricePerLiter),
      'Valor Total (R$)': new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.liters * r.pricePerLiter),
      'Motorista': r.driver || '-',
      'Posto': r.supplierId || '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Abastecimentos');

  const colWidths = [
    { wch: 12 }, // Data
    { wch: 12 }, // Tipo
    { wch: 18 }, // Identificação
    { wch: 15 }, // KM/Horímetro
    { wch: 15 }, // Combustível
    { wch: 10 }, // Litros
    { wch: 16 }, // Preço/Litro
    { wch: 16 }, // Valor Total
    { wch: 15 }, // Motorista
    { wch: 15 }, // Posto
  ];
  ws['!cols'] = colWidths;

  const fileName = `abastecimentos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
