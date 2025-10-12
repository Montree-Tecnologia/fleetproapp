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
    'KM Atual': v.currentKm,
    'Peso (ton)': v.weight || '-',
    'Eixos': v.axles,
    'Tem Composição': v.hasComposition ? 'Sim' : 'Não',
    'Composições': v.compositionPlates?.join(', ') || '-',
    'Valor Compra (R$)': v.purchaseValue ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(v.purchaseValue) : '-',
    'Data Compra': v.purchaseDate ? format(new Date(v.purchaseDate), 'dd/MM/yyyy') : '-',
    'Filial Proprietária': v.ownerBranch,
    'Status': 
      v.status === 'active' ? 'Ativo' :
      v.status === 'defective' ? 'Com Defeito' :
      v.status === 'maintenance' ? 'Em Manutenção' :
      v.status === 'inactive' ? 'Inativo' : 'Vendido',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Veículos');

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 10 }, // Placa
    { wch: 18 }, // Tipo
    { wch: 15 }, // Marca
    { wch: 20 }, // Modelo
    { wch: 15 }, // Ano Fabricação
    { wch: 12 }, // Ano Modelo
    { wch: 18 }, // Chassis
    { wch: 12 }, // RENAVAM
    { wch: 12 }, // Cor
    { wch: 15 }, // Combustível
    { wch: 12 }, // KM Compra
    { wch: 12 }, // KM Atual
    { wch: 12 }, // Peso
    { wch: 8 },  // Eixos
    { wch: 15 }, // Tem Composição
    { wch: 25 }, // Composições
    { wch: 18 }, // Valor Compra
    { wch: 12 }, // Data Compra
    { wch: 20 }, // Filial Proprietária
    { wch: 15 }, // Status
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
    'Marca': r.brand,
    'Modelo': r.model,
    'Tipo': 
      r.type === 'freezer' ? 'Freezer' :
      r.type === 'cooled' ? 'Refrigerado' : 'Climatizado',
    'Temp. Mínima (°C)': r.minTemp,
    'Temp. Máxima (°C)': r.maxTemp,
    'Combustível': r.fuelType || '-',
    'Data Instalação': format(new Date(r.installDate), 'dd/MM/yyyy'),
    'Horímetro Inicial': r.initialUsageHours || 0,
    'Valor Compra (R$)': r.purchaseValue ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.purchaseValue) : '-',
    'Data Compra': r.purchaseDate ? format(new Date(r.purchaseDate), 'dd/MM/yyyy') : '-',
    'Empresa': r.companyId,
    'Status': 
      r.status === 'active' ? 'Ativo' :
      r.status === 'defective' ? 'Com Defeito' :
      r.status === 'maintenance' ? 'Em Manutenção' :
      r.status === 'inactive' ? 'Inativo' : 'Vendido',
    'Veículo Vinculado': r.vehicleId || 'Não vinculado',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Refrigeração');

  const colWidths = [
    { wch: 18 }, // Número de Série
    { wch: 15 }, // Marca
    { wch: 20 }, // Modelo
    { wch: 15 }, // Tipo
    { wch: 16 }, // Temp. Mínima
    { wch: 16 }, // Temp. Máxima
    { wch: 15 }, // Combustível
    { wch: 16 }, // Data Instalação
    { wch: 16 }, // Horímetro Inicial
    { wch: 18 }, // Valor Compra
    { wch: 12 }, // Data Compra
    { wch: 15 }, // Empresa
    { wch: 15 }, // Status
    { wch: 18 }, // Veículo Vinculado
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
      'Placa/Série': r.vehicleId 
        ? (vehicle?.plate || '-')
        : (refrigeration?.serialNumber || '-'),
      'Veículo': vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.vehicleType})` : 
                 (refrigeration ? `${refrigeration.brand} ${refrigeration.model}` : '-'),
      'KM/Horímetro': r.km || r.usageHours || '-',
      'Combustível': r.fuelType,
      'Litros': new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.liters),
      'Preço/Litro (R$)': new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.pricePerLiter),
      'Valor Total (R$)': new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(r.totalValue),
      'Motorista': r.driver || '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Abastecimentos');

  const colWidths = [
    { wch: 12 }, // Data
    { wch: 12 }, // Tipo
    { wch: 18 }, // Placa/Série
    { wch: 35 }, // Veículo
    { wch: 15 }, // KM/Horímetro
    { wch: 15 }, // Combustível
    { wch: 10 }, // Litros
    { wch: 16 }, // Preço/Litro
    { wch: 16 }, // Valor Total
    { wch: 20 }, // Motorista
  ];
  ws['!cols'] = colWidths;

  const fileName = `abastecimentos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
