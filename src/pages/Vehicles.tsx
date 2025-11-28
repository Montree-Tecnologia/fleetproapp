import { useMockData, Vehicle } from '@/hooks/useMockData';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Truck, Pencil, Trash2, Eye, FileText, Search, DollarSign, FileSpreadsheet } from 'lucide-react';
import { exportVehiclesToExcel } from '@/lib/excelExport';
import { getCompaniesCombo, CompanyCombo } from '@/services/companiesApi';
import { getSuppliersCombo, SupplierCombo } from '@/services/suppliersApi';
import { createVehicle, updateVehicle as updateVehicleApi, getVehicles, Vehicle as ApiVehicle } from '@/services/vehiclesApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VehicleForm } from '@/components/forms/VehicleForm';
import { VehicleSaleForm, VehicleSale } from '@/components/forms/VehicleSaleForm';
import { VehicleCard } from '@/components/VehicleCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Vehicles() {
  const { drivers, refuelings, companies, suppliers, refrigerationUnits, getRefrigerationUnitByVehicle, addVehicle, updateVehicle, deleteVehicle, sellVehicle, reverseSale, sellRefrigerationUnit, updateRefrigerationUnit } = useMockData();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Estados para veículos da API
  const [apiVehicles, setApiVehicles] = useState<ApiVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreVehicles, setHasMoreVehicles] = useState(true);
  const ITEMS_PER_PAGE = 20;
  
  const allDrivers = drivers();
  const allRefuelings = refuelings();
  const allCompanies = companies();
  const allSuppliers = suppliers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [vehicleToSell, setVehicleToSell] = useState<Vehicle | null>(null);
  const [reverseSaleDialogOpen, setReverseSaleDialogOpen] = useState(false);
  const [vehicleToReverseSale, setVehicleToReverseSale] = useState<Vehicle | null>(null);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [vehicleToChangeStatus, setVehicleToChangeStatus] = useState<{ vehicleId: string; plate: string; newStatus: string; currentStatus: string } | null>(null);
  const [apiCompanies, setApiCompanies] = useState<CompanyCombo[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [apiSuppliers, setApiSuppliers] = useState<SupplierCombo[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Buscar veículos da API
  const fetchVehicles = useCallback(async (page: number = 1, append: boolean = false) => {
    setLoadingVehicles(true);
    try {
      const response = await getVehicles({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
      });
      
      if (response.success && response.data) {
        const { data, pagination } = response.data;
        
        if (append) {
          setApiVehicles(prev => [...prev, ...data]);
        } else {
          setApiVehicles(data);
        }
        
        setCurrentPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
        setHasMoreVehicles(pagination.currentPage < pagination.totalPages);
      }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast({
        title: 'Erro ao carregar veículos',
        description: 'Não foi possível carregar a lista de veículos.',
        variant: 'destructive',
      });
    } finally {
      setLoadingVehicles(false);
    }
  }, [searchTerm, toast]);

  // Carregar veículos ao montar e quando refreshKey mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVehicles(1, false);
    }, 500); // Debounce de 500ms para a busca

    return () => clearTimeout(timeoutId);
  }, [fetchVehicles, refreshKey]);

  // Função para carregar mais veículos (infinite scroll)
  const loadMoreVehicles = () => {
    if (hasMoreVehicles && !loadingVehicles) {
      fetchVehicles(currentPage + 1, true);
    }
  };

  // Buscar empresas e fornecedores da API quando o modal abrir
  useEffect(() => {
    if (isDialogOpen) {
      const fetchData = async () => {
        setLoadingCompanies(true);
        setLoadingSuppliers(true);
        
        try {
          const [companiesResponse, suppliersResponse] = await Promise.all([
            getCompaniesCombo(),
            getSuppliersCombo()
          ]);
          
          if (companiesResponse.success && companiesResponse.data) {
            setApiCompanies(companiesResponse.data);
          }
          
          if (suppliersResponse.success && suppliersResponse.data) {
            setApiSuppliers(suppliersResponse.data);
          }
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
          toast({
            title: 'Erro ao carregar dados',
            description: 'Não foi possível carregar empresas e/ou fornecedores.',
            variant: 'destructive',
          });
        } finally {
          setLoadingCompanies(false);
          setLoadingSuppliers(false);
        }
      };
      
      fetchData();
    }
  }, [isDialogOpen, toast]);

  const getDriverName = (driverId?: string) => {
    if (!driverId) return null;
    const driver = allDrivers.find(d => d.id === driverId);
    return driver?.name;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Ativo', variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700' },
      defective: { label: 'Defeito', variant: 'destructive' as const, className: '' },
      maintenance: { label: 'Manutenção', variant: undefined, className: 'bg-yellow-500 text-white' },
      inactive: { label: 'Inativo', variant: 'destructive' as const, className: '' },
      sold: { label: 'Vendido', variant: undefined, className: 'bg-gray-500 text-white' }
    };
    const config = variants[status as keyof typeof variants];
    if (config.variant && config.className) {
      return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
    } else if (config.variant) {
      return <Badge variant={config.variant}>{config.label}</Badge>;
    } else {
      return <Badge className={config.className}>{config.label}</Badge>;
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setViewingVehicle(vehicle);
    setDetailsDialogOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete.id);
      toast({
        title: 'Veículo excluído',
        description: `${vehicleToDelete.plate} foi removido com sucesso.`,
      });
      setVehicleToDelete(null);
      setDeleteDialogOpen(false);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSellVehicle = (vehicle: Vehicle) => {
    setVehicleToSell(vehicle);
    setSaleDialogOpen(true);
  };

  const handleConfirmSale = (saleData: VehicleSale) => {
    if (vehicleToSell) {
      // Processar venda do veículo
      sellVehicle(vehicleToSell.id, saleData);

      // Se houver equipamento de refrigeração vinculado
      const refrigerationUnit = getRefrigerationUnitByVehicle(vehicleToSell.id);
      
      if (refrigerationUnit && saleData.refrigerationSale) {
        if (saleData.refrigerationSale.sellRefrigeration) {
          // Vender o equipamento de refrigeração
          sellRefrigerationUnit(refrigerationUnit.id, {
            buyerName: saleData.buyerName,
            buyerCpfCnpj: saleData.buyerCpfCnpj,
            saleDate: saleData.saleDate,
            usageHours: saleData.refrigerationSale.refrigerationUsageHours || 0,
            salePrice: saleData.refrigerationSale.refrigerationPrice || 0,
          });

          toast({
            title: 'Veículo e equipamento vendidos',
            description: `${vehicleToSell.plate} e equipamento de refrigeração foram vendidos com sucesso.`,
          });
        } else {
          // Apenas desvincular o equipamento
          updateRefrigerationUnit(refrigerationUnit.id, { vehicleId: undefined });
          
          toast({
            title: 'Veículo vendido',
            description: `${vehicleToSell.plate} foi vendido e o equipamento de refrigeração foi desvinculado.`,
          });
        }
      } else {
        toast({
          title: 'Veículo vendido',
          description: `${vehicleToSell.plate} foi vendido com sucesso.`,
        });
      }

      setVehicleToSell(null);
      setSaleDialogOpen(false);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleReverseSale = (vehicle: Vehicle) => {
    setVehicleToReverseSale(vehicle);
    setReverseSaleDialogOpen(true);
  };

  const confirmReverseSale = () => {
    if (vehicleToReverseSale) {
      reverseSale(vehicleToReverseSale.id);
      toast({
        title: 'Venda revertida',
        description: `Venda do veículo ${vehicleToReverseSale.plate} foi revertida com sucesso.`,
      });
      setVehicleToReverseSale(null);
      setReverseSaleDialogOpen(false);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingVehicle(null);
    }
  };

  const handleStatusChange = (vehicleId: string, plate: string, newStatus: string, currentStatus: string) => {
    // Abre o diálogo de confirmação apenas se está ativando ou inativando
    if (newStatus === 'active' || newStatus === 'inactive') {
      setVehicleToChangeStatus({ vehicleId, plate, newStatus, currentStatus });
      setStatusChangeDialogOpen(true);
    } else {
      // Para outros status (manutenção, defeito), aplica diretamente
      confirmStatusChange(vehicleId, newStatus);
    }
  };

  const confirmStatusChange = (vehicleId: string, newStatus: string) => {
    const vehicle = apiVehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      toast({
        title: 'Erro',
        description: 'Veículo não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    const trailerTypes = ['Baú', 'Carreta', 'Graneleiro', 'Container', 'Caçamba', 'Baú Frigorífico', 'Sider', 'Prancha', 'Tanque', 'Cegonheiro', 'Rodotrem'];
    const isTrailer = trailerTypes.includes(vehicle.vehicleType);
    const isInactiveOrMaintenance = newStatus === 'inactive' || newStatus === 'maintenance' || newStatus === 'defective';

    try {
      updateVehicle(vehicleId, { status: newStatus as 'active' | 'maintenance' | 'inactive' | 'defective' });
      
      const statusLabels = {
        active: 'Ativo',
        defective: 'Defeito',
        maintenance: 'Manutenção',
        inactive: 'Inativo'
      };
      
      toast({
        title: 'Status alterado',
        description: `Status alterado para ${statusLabels[newStatus as keyof typeof statusLabels]} com sucesso.`,
      });

      // Notifica sobre desvinculação automática de reboque
      if (isTrailer && isInactiveOrMaintenance) {
        const tractionVehicles = apiVehicles.filter(v =>
          v.hasComposition
        );
        if (tractionVehicles.length > 0) {
          toast({
            description: 'Veículo desvinculado automaticamente das composições.',
          });
        }
      }

      // Notifica sobre alteração de status das composições
      if (!isTrailer && isInactiveOrMaintenance && vehicle.hasComposition) {
        toast({
          description: `Status das composições acopladas também alterado para ${statusLabels[newStatus as keyof typeof statusLabels]}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status.',
        variant: 'destructive',
      });
    }

    setStatusChangeDialogOpen(false);
    setVehicleToChangeStatus(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleDriverChange = (vehicleId: string, driverId: string) => {
    const actualDriverId = driverId === 'none' ? undefined : driverId;
    
    try {
      updateVehicle(vehicleId, { driverId: actualDriverId });
      
      if (actualDriverId) {
        const driver = allDrivers.find(d => d.id === actualDriverId);
        toast({
          title: 'Motorista vinculado',
          description: `${driver?.name} foi vinculado ao veículo com sucesso.`,
        });
      } else {
        toast({
          title: 'Vínculo removido',
          description: 'Vínculo com motorista foi removido com sucesso.',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o vínculo do motorista.',
        variant: 'destructive',
      });
    }
    setRefreshKey(prev => prev + 1);
  };

  const getAvailableDrivers = (currentVehicleId: string) => {
    return allDrivers.filter(driver => {
      if (!driver.active) return false;
      return true;
    });
  };

  const handleAddComposition = (vehicleId: string, trailerId: string) => {
    const vehicle = apiVehicles.find(v => v.id === vehicleId);
    const trailer = apiVehicles.find(v => v.id === trailerId);
    
    if (!vehicle || !trailer) {
      toast({
        title: 'Erro',
        description: 'Veículo ou reboque não encontrado.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      updateVehicle(vehicleId, {
        hasComposition: true,
      });
      
      toast({
        title: 'Reboque vinculado',
        description: `${trailer.plate} foi vinculado ao veículo com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível vincular o reboque.',
        variant: 'destructive',
      });
    }
    setRefreshKey(prev => prev + 1);
  };

  const handleRemoveComposition = (vehicleId: string, trailerId: number) => {
    const vehicle = apiVehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      toast({
        title: 'Erro',
        description: 'Veículo ou composição não encontrada.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      updateVehicle(vehicleId, {
        hasComposition: false,
      });
      
      toast({
        title: 'Reboque desvinculado',
        description: `Reboque foi desvinculado do veículo com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível desvincular o reboque.',
        variant: 'destructive',
      });
    }
    setRefreshKey(prev => prev + 1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculateAverageConsumption = (vehicleId: string): number | null => {
    const vehicle = apiVehicles.find(v => v.id === vehicleId);
    
    // Nunca calcular consumo para veículos de reboque
    if (vehicle && trailerVehicleTypes.includes(vehicle.vehicleType)) {
      return null;
    }
    
    const vehicleRefuelings = allRefuelings
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => a.km - b.km);

    if (vehicleRefuelings.length < 2) return null;

    const totalKmTraveled = vehicleRefuelings[vehicleRefuelings.length - 1].km - vehicleRefuelings[0].km;
    const totalLiters = vehicleRefuelings.reduce((sum, r) => sum + r.liters, 0);

    if (totalLiters === 0) return null;

    return totalKmTraveled / totalLiters;
  };

  const tractionVehicleTypes = ['Truck', 'Cavalo Mecânico', 'Toco', 'VUC', '3/4', 'Bitruck'];
  const trailerVehicleTypes = ['Baú', 'Carreta', 'Graneleiro', 'Container', 'Caçamba', 'Baú Frigorífico', 'Sider', 'Prancha', 'Tanque', 'Cegonheiro', 'Rodotrem'];

  const tractionVehicles = (apiVehicles || []).filter(v => tractionVehicleTypes.includes(v.vehicleType));
  const trailerVehicles = (apiVehicles || []).filter(v => trailerVehicleTypes.includes(v.vehicleType));

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Gestão de Frota</h2>
            <p className="text-sm lg:text-base text-muted-foreground">
              Controle completo dos veículos da sua empresa
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
              <Button 
              variant="outline"
              onClick={() => exportVehiclesToExcel(apiVehicles as any)}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por placa, modelo, chassi ou motorista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</DialogTitle>
            <DialogDescription>
              {editingVehicle ? 'Atualize os dados do veículo' : 'Preencha os dados do veículo para cadastrá-lo no sistema'}
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            initialData={editingVehicle || undefined}
            availableVehicles={apiVehicles as any}
            companies={apiCompanies}
            suppliers={apiSuppliers}
            onSubmit={async (data) => {
              try {
                // Helper function to convert base64 string to ImagePayload format
                const convertToImagePayload = (base64String: string | undefined) => {
                  if (!base64String) return undefined;
                  
                  // Extract extension from base64 string (e.g., "data:image/png;base64,...")
                  const match = base64String.match(/^data:image\/(\w+);base64,/);
                  const extension = match ? match[1] : 'png';
                  
                  return {
                    base64: base64String,
                    extension: extension
                  };
                };

                const payload = {
                  plate: data.plate,
                  chassis: data.chassis,
                  renavam: data.renavam,
                  brand: data.brand,
                  model: data.model,
                  manufacturingYear: data.manufacturingYear,
                  modelYear: data.modelYear,
                  color: data.color,
                  vehicleType: data.vehicleType,
                  status: data.status,
                  purchaseKm: data.purchaseKm,
                  currentKm: data.purchaseKm,
                  fuelType: data.fuelType,
                  axles: data.axles,
                  weight: data.weight,
                  purchaseDate: data.purchaseDate,
                  purchaseValue: data.purchaseValue,
                  ownerBranchId: data.ownerBranch,
                  supplierId: data.supplierId,
                  branches: data.branches
                    ?.filter(b => b !== data.ownerBranch)  // Remover ownerBranch do array
                    ?.map(b => Number(b))  // Converter strings para números
                    .filter(n => !isNaN(n) && n !== null),  // Filtrar valores inválidos
                  driverId: data.driverId,
                  hasComposition: data.hasComposition,
                  compositions: data.compositions,
                  images: data.images?.map(img => convertToImagePayload(img)).filter(Boolean),
                  crlvDocument: convertToImagePayload(data.crlvDocument),
                  purchaseInvoice: convertToImagePayload(data.purchaseInvoice),
                };

                if (editingVehicle) {
                  await updateVehicleApi(editingVehicle.id, payload);
                  toast({
                    title: 'Veículo atualizado',
                    description: 'Dados do veículo foram atualizados com sucesso.',
                  });
                } else {
                  await createVehicle(payload);
                  toast({
                    title: 'Veículo cadastrado',
                    description: 'Novo veículo foi adicionado à frota.',
                  });
                }
                handleDialogClose(false);
                setRefreshKey(prev => prev + 1);
              } catch (error: any) {
                console.error('Erro ao salvar veículo:', error);
                toast({
                  title: 'Erro ao salvar veículo',
                  description: error.message || 'Não foi possível salvar o veículo.',
                  variant: 'destructive',
                });
              }
            }}
            onCancel={() => handleDialogClose(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o veículo <strong>{vehicleToDelete?.plate}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {vehicleToChangeStatus?.newStatus === 'active' ? 'ativar' : 'inativar'} o veículo <strong>{vehicleToChangeStatus?.plate}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => vehicleToChangeStatus && confirmStatusChange(vehicleToChangeStatus.vehicleId, vehicleToChangeStatus.newStatus)}>
              {vehicleToChangeStatus?.newStatus === 'active' ? 'Ativar' : 'Inativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reverseSaleDialogOpen} onOpenChange={setReverseSaleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar reversão de venda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reverter a venda do veículo <strong>{vehicleToReverseSale?.plate}</strong>? 
              O veículo voltará ao status "{vehicleToReverseSale?.previousStatus === 'active' ? 'Ativo' : vehicleToReverseSale?.previousStatus === 'maintenance' ? 'Manutenção' : 'Inativo'}" e as informações da venda serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReverseSale} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Reverter Venda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Veículo - {viewingVehicle?.plate}</DialogTitle>
            <DialogDescription>
              Informações completas do veículo
            </DialogDescription>
          </DialogHeader>
          
          {viewingVehicle && (
            <div className="space-y-6">
              {viewingVehicle.images && viewingVehicle.images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Imagens do Veículo</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {viewingVehicle.images.map((image, index) => (
                      <div 
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image}
                          alt={`${viewingVehicle.plate} - ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border hover:border-primary transition-colors"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Placa:</span>
                    <p className="font-medium">{viewingVehicle.plate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">{viewingVehicle.vehicleType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Marca:</span>
                    <p className="font-medium">{viewingVehicle.brand}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Modelo:</span>
                    <p className="font-medium">{viewingVehicle.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ano:</span>
                    <p className="font-medium">
                      {viewingVehicle.manufacturingYear && viewingVehicle.modelYear
                        ? `${viewingVehicle.manufacturingYear}/${viewingVehicle.modelYear.toString().slice(-2)}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cor:</span>
                    <p className="font-medium">{viewingVehicle.color}</p>
                  </div>
                  {tractionVehicleTypes.includes(viewingVehicle.vehicleType) && (
                    <div>
                      <span className="text-muted-foreground">Consumo Médio:</span>
                      <p className="font-medium">
                        {(() => {
                          const avgConsumption = calculateAverageConsumption(viewingVehicle.id);
                          return avgConsumption 
                            ? `${avgConsumption.toFixed(2)} km/l` 
                            : 'Dados insuficientes';
                        })()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">KM Atual:</span>
                    <p className="font-medium">{viewingVehicle.currentKm.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium inline-flex">{getStatusBadge(viewingVehicle.status)}</p>
                  </div>
                </div>
              </div>


              <div>
                <h3 className="font-semibold mb-3">Documentação</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Chassis:</span>
                    <p className="font-medium font-mono">{viewingVehicle.chassis}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RENAVAM:</span>
                    <p className="font-medium font-mono">{viewingVehicle.renavam}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">KM de Compra:</span>
                    <p className="font-medium">{viewingVehicle.purchaseKm.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data de Compra:</span>
                    <p className="font-medium">{formatDate(viewingVehicle.purchaseDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor de Compra:</span>
                    <p className="font-medium">{formatCurrency(viewingVehicle.purchaseValue)}</p>
                  </div>
                  {viewingVehicle.crlvDocument && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Documento CRLV:</span>
                      <div className="mt-2 grid grid-cols-4 gap-3">
                        {viewingVehicle.crlvDocument.startsWith('data:image') || viewingVehicle.crlvDocument.includes('unsplash') ? (
                          <div className="relative group cursor-pointer">
                            <img
                              src={viewingVehicle.crlvDocument}
                              alt="CRLV"
                              className="w-full h-32 object-cover rounded-lg border border-border hover:border-primary transition-colors"
                              onClick={() => window.open(viewingVehicle.crlvDocument, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <a
                            href={viewingVehicle.crlvDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                          >
                            <FileText className="h-5 w-5" />
                            <span className="text-sm font-medium">Ver CRLV</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {viewingVehicle.purchaseInvoice && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Nota Fiscal de Compra:</span>
                      <div className="mt-2 grid grid-cols-4 gap-3">
                        {viewingVehicle.purchaseInvoice.startsWith('data:image') || viewingVehicle.purchaseInvoice.includes('unsplash') ? (
                          <div className="relative group cursor-pointer">
                            <img
                              src={viewingVehicle.purchaseInvoice}
                              alt="Nota Fiscal"
                              className="w-full h-32 object-cover rounded-lg border border-border hover:border-primary transition-colors"
                              onClick={() => window.open(viewingVehicle.purchaseInvoice, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <a
                            href={viewingVehicle.purchaseInvoice}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                          >
                            <FileText className="h-5 w-5" />
                            <span className="text-sm font-medium">Ver Nota Fiscal</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Características Técnicas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo de Combustível:</span>
                    <p className="font-medium">{viewingVehicle.fuelType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantidade de Eixos:</span>
                    <p className="font-medium">{viewingVehicle.axles}</p>
                  </div>
                  {viewingVehicle.weight && (
                    <div>
                      <span className="text-muted-foreground">Peso:</span>
                      <p className="font-medium">{viewingVehicle.weight} toneladas</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Propriedade e Filiais</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground text-sm">Matriz/Filial Proprietária:</span>
                    <div className="mt-1 space-y-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {viewingVehicle.ownerBranch}
                      </Badge>
                      {(() => {
                        const ownerCompany = allCompanies.find(c => c.name === viewingVehicle.ownerBranch);
                        return ownerCompany ? (
                          <p className="text-sm text-muted-foreground">
                            CNPJ: <span className="font-mono font-medium">{ownerCompany.cnpj}</span>
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Matriz/Filiais Vinculadas:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(() => {
                        // Mapeia IDs para nomes e remove duplicatas
                        const branchNames = viewingVehicle.branches.map(branchIdOrName => {
                          // Tentar encontrar pelo ID first
                          const companyById = allCompanies.find(c => String(c.id) === branchIdOrName);
                          if (companyById) return companyById.name;
                          
                          // Se não encontrar, tentar pelo nome ou retornar o próprio valor
                          const companyByName = allCompanies.find(c => c.name === branchIdOrName);
                          return companyByName ? companyByName.name : branchIdOrName;
                        });
                        
                        // Remove duplicatas
                        const uniqueBranchNames = Array.from(new Set(branchNames));
                        
                        return uniqueBranchNames.map((displayName, index) => (
                          <Badge key={index} variant="secondary">
                            {displayName}
                          </Badge>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {viewingVehicle.driverId && (() => {
                const driver = allDrivers.find(d => d.id === viewingVehicle.driverId);
                return driver ? (
                  <div>
                    <h3 className="font-semibold mb-3">Motorista Vinculado</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-muted rounded-lg border border-border">
                      <div>
                        <span className="text-muted-foreground">Nome:</span>
                        <p className="font-semibold">{driver.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPF:</span>
                        <p className="font-medium font-mono">{driver.cpf}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Categoria CNH:</span>
                        <p className="font-medium">{driver.cnhCategory}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Validade CNH:</span>
                        <p className="font-medium">{formatDate(driver.cnhValidity)}</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Seção para veículos de reboque - mostra o veículo de tração e conjunto */}
              {(() => {
                const trailerTypes = ['Baú', 'Carreta', 'Graneleiro', 'Container', 'Caçamba', 'Baú Frigorífico', 'Sider', 'Prancha', 'Tanque', 'Cegonheiro', 'Rodotrem'];
                const isTrailer = trailerTypes.includes(viewingVehicle.vehicleType);
                
                if (!isTrailer) return null;

                // Buscar veículo de tração que contém este reboque
                const tractionVehicle = apiVehicles.find(v => 
                  v.hasComposition
                );

                if (!tractionVehicle) return null;

                // Buscar motorista do veículo de tração
                const driver = tractionVehicle.driverId 
                  ? allDrivers.find(d => d.id === tractionVehicle.driverId)
                  : null;

                // Buscar empresa proprietária do veículo de tração
                const ownerCompany = allCompanies.find(c => String(c.id) === tractionVehicle.ownerBranchId);

                // Calcular peso total do conjunto
                const tractionWeight = parseFloat(String(tractionVehicle.weight || 0));
                const totalWeight = tractionWeight;

                return (
                  <div className="border-t pt-6 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Veículo de Tração do Conjunto</h3>
                      <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20 space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-600 text-white text-base">{tractionVehicle.plate}</Badge>
                          <span className="font-medium">{tractionVehicle.vehicleType}</span>
                          {getStatusBadge(tractionVehicle.status)}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Marca/Modelo:</span>
                            <p className="font-medium">{tractionVehicle.brand} {tractionVehicle.model}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ano:</span>
                            <p className="font-medium">
                              {tractionVehicle.manufacturingYear && tractionVehicle.modelYear
                                ? `${tractionVehicle.manufacturingYear}/${tractionVehicle.modelYear.toString().slice(-2)}`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cor:</span>
                            <p className="font-medium">{tractionVehicle.color}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Chassis:</span>
                            <p className="font-medium font-mono">{tractionVehicle.chassis}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">RENAVAM:</span>
                            <p className="font-medium font-mono">{tractionVehicle.renavam}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Combustível:</span>
                            <p className="font-medium">{tractionVehicle.fuelType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Eixos:</span>
                            <p className="font-medium">{tractionVehicle.axles}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Peso:</span>
                            <p className="font-medium">
                              {tractionVehicle.weight 
                                ? `${parseFloat(String(tractionVehicle.weight)).toLocaleString('pt-BR')} ton` 
                                : 'Não informado'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">KM Atual:</span>
                            <p className="font-medium">{Number(tractionVehicle.currentKm || 0).toLocaleString('pt-BR')}</p>
                          </div>
                        </div>

                        {ownerCompany && (
                          <div className="pt-4 border-t border-green-500/20">
                            <h4 className="font-semibold mb-2 text-sm">Propriedade</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">Matriz/Filial:</span> <span className="font-medium">{ownerCompany.name}</span></p>
                              <p><span className="text-muted-foreground">CNPJ:</span> <span className="font-medium font-mono">{ownerCompany.cnpj}</span></p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {driver && (
                      <div>
                        <h3 className="font-semibold mb-3">Motorista do Conjunto</h3>
                        <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Nome:</span>
                              <p className="font-semibold">{driver.name}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">CPF:</span>
                              <p className="font-medium font-mono">{driver.cpf}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Categoria CNH:</span>
                              <p className="font-medium">{driver.cnhCategory}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Validade CNH:</span>
                              <p className="font-medium">{formatDate(driver.cnhValidity)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-3 text-sm">Informações do Conjunto</h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">
                          <span className="text-muted-foreground">Veículo de tração com composições</span>
                        </p>
                        <p className="font-medium">
                          <span className="text-muted-foreground">Total de eixos:</span> {tractionVehicle.axles} eixos
                        </p>
                        {totalWeight > 0 && (
                          <p className="font-medium">
                            <span className="text-muted-foreground">Peso total:</span> {totalWeight.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} toneladas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Seção para veículos de tração - mostra composições acopladas */}
              {viewingVehicle.hasComposition && (
                <div>
                  <h3 className="font-semibold mb-3">Composições</h3>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Este veículo possui composições acopladas.</p>
                  </div>
                </div>
              )}

              {(() => {
                const refrigerationUnit = getRefrigerationUnitByVehicle(viewingVehicle.id);
                if (!refrigerationUnit) return null;

                // Calcular horímetro atual
                const refrigerationRefuelings = allRefuelings
                  .filter(r => r.refrigerationUnitId === refrigerationUnit.id)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                const currentUsageHours = refrigerationRefuelings.length > 0 
                  ? refrigerationRefuelings[refrigerationRefuelings.length - 1].usageHours || refrigerationUnit.initialUsageHours || 0
                  : refrigerationUnit.initialUsageHours || 0;

                const supplier = refrigerationUnit.supplierId 
                  ? allSuppliers.find(s => s.id === refrigerationUnit.supplierId)
                  : null;

                const getStatusLabel = (status: string) => {
                  const labels = {
                    active: 'Ativo',
                    defective: 'Defeito',
                    maintenance: 'Manutenção',
                    inactive: 'Inativo',
                    sold: 'Vendido'
                  };
                  return labels[status as keyof typeof labels] || status;
                };

                return (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span>Equipamento de Refrigeração Vinculado</span>
                      <Badge variant={refrigerationUnit.status === 'active' ? 'default' : 'secondary'}>
                        {getStatusLabel(refrigerationUnit.status)}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                      <div>
                        <span className="text-muted-foreground">Marca:</span>
                        <p className="font-medium">{refrigerationUnit.brand}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Modelo:</span>
                        <p className="font-medium">{refrigerationUnit.model}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Número de Série:</span>
                        <p className="font-medium font-mono">{refrigerationUnit.serialNumber}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <p className="font-medium capitalize">
                          {refrigerationUnit.type === 'freezer' ? 'Freezer' : refrigerationUnit.type === 'cooled' ? 'Resfriado' : 'Climatizado'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Faixa de Temperatura:</span>
                        <p className="font-medium">{refrigerationUnit.minTemp}°C a {refrigerationUnit.maxTemp}°C</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Horímetro Atual:</span>
                        <p className="font-medium">{currentUsageHours.toLocaleString('pt-BR')} horas</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data de Instalação:</span>
                        <p className="font-medium">{formatDate(refrigerationUnit.installDate)}</p>
                      </div>
                      {refrigerationUnit.purchaseDate && (
                        <div>
                          <span className="text-muted-foreground">Data de Compra:</span>
                          <p className="font-medium">{formatDate(refrigerationUnit.purchaseDate)}</p>
                        </div>
                      )}
                      {refrigerationUnit.purchaseValue && (
                        <div>
                          <span className="text-muted-foreground">Valor de Compra:</span>
                          <p className="font-medium">{formatCurrency(refrigerationUnit.purchaseValue)}</p>
                        </div>
                      )}
                      {supplier && (
                        <div>
                          <span className="text-muted-foreground">Fornecedor:</span>
                          <p className="font-medium">{supplier.name}</p>
                        </div>
                      )}
                      {refrigerationUnit.fuelType && (
                        <div>
                          <span className="text-muted-foreground">Tipo de Combustível:</span>
                          <p className="font-medium">{refrigerationUnit.fuelType}</p>
                        </div>
                      )}
                      {refrigerationUnit.initialUsageHours !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Horímetro Inicial:</span>
                          <p className="font-medium">{refrigerationUnit.initialUsageHours.toLocaleString('pt-BR')} horas</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {viewingVehicle.status === 'sold' && viewingVehicle.saleInfo && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-lg">Informações da Venda</h3>
                  <div className="space-y-4 bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Comprador:</span>
                        <p className="font-semibold text-base">{viewingVehicle.saleInfo.buyerName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPF/CNPJ:</span>
                        <p className="font-medium">{viewingVehicle.saleInfo.buyerCpfCnpj}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data da Venda:</span>
                        <p className="font-medium">{formatDate(viewingVehicle.saleInfo.saleDate)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quilometragem na Venda:</span>
                        <p className="font-medium">{viewingVehicle.saleInfo.km.toLocaleString('pt-BR')} km</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Preço de Venda:</span>
                        <p className="font-bold text-2xl text-green-600">{formatCurrency(viewingVehicle.saleInfo.salePrice)}</p>
                      </div>
                    </div>

                    {(viewingVehicle.saleInfo.paymentReceipt || viewingVehicle.saleInfo.transferDocument || viewingVehicle.saleInfo.saleInvoice) && (
                      <div className="pt-4 border-t border-green-500/20">
                        <h4 className="font-semibold mb-3">Documentos da Venda</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {viewingVehicle.saleInfo.paymentReceipt && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-muted-foreground">Comprovante de Recebimento</span>
                              {viewingVehicle.saleInfo.paymentReceipt.startsWith('data:image') || viewingVehicle.saleInfo.paymentReceipt.includes('unsplash') ? (
                                <img
                                  src={viewingVehicle.saleInfo.paymentReceipt}
                                  alt="Comprovante"
                                  className="w-full h-40 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(viewingVehicle.saleInfo!.paymentReceipt, '_blank')}
                                />
                              ) : (
                                <a
                                  href={viewingVehicle.saleInfo.paymentReceipt}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                                >
                                  <FileText className="h-5 w-5" />
                                  <span className="text-sm">Ver Comprovante</span>
                                </a>
                              )}
                            </div>
                          )}
                          {viewingVehicle.saleInfo.transferDocument && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-muted-foreground">CRV Assinado</span>
                              {viewingVehicle.saleInfo.transferDocument.startsWith('data:image') || viewingVehicle.saleInfo.transferDocument.includes('unsplash') ? (
                                <img
                                  src={viewingVehicle.saleInfo.transferDocument}
                                  alt="CRV"
                                  className="w-full h-40 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(viewingVehicle.saleInfo!.transferDocument, '_blank')}
                                />
                              ) : (
                                <a
                                  href={viewingVehicle.saleInfo.transferDocument}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                                >
                                  <FileText className="h-5 w-5" />
                                  <span className="text-sm">Ver CRV</span>
                                </a>
                              )}
                            </div>
                          )}
                          {viewingVehicle.saleInfo.saleInvoice && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-muted-foreground">Nota Fiscal de Venda</span>
                              {viewingVehicle.saleInfo.saleInvoice.startsWith('data:image') || viewingVehicle.saleInfo.saleInvoice.includes('unsplash') ? (
                                <img
                                  src={viewingVehicle.saleInfo.saleInvoice}
                                  alt="Nota Fiscal de Venda"
                                  className="w-full h-40 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(viewingVehicle.saleInfo!.saleInvoice, '_blank')}
                                />
                              ) : (
                                <a
                                  href={viewingVehicle.saleInfo.saleInvoice}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                                >
                                  <FileText className="h-5 w-5" />
                                  <span className="text-sm">Ver Nota Fiscal</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    if (viewingVehicle) {
                      handleEdit(viewingVehicle);
                    }
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {viewingVehicle.status !== 'sold' && (
                  <Select
                    value={viewingVehicle.status}
                    onValueChange={(value) => {
                      handleStatusChange(viewingVehicle.id, viewingVehicle.plate, value, viewingVehicle.status);
                      setViewingVehicle({ ...viewingVehicle, status: value as any });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="defective">Defeito</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Visualização da Imagem</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Imagem ampliada"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Venda de Veículo - {vehicleToSell?.plate}</DialogTitle>
            <DialogDescription>
              Preencha os dados da venda do veículo
            </DialogDescription>
          </DialogHeader>
          {vehicleToSell && (() => {
            const refrigerationUnit = getRefrigerationUnitByVehicle(vehicleToSell.id);
            
            // Calcular horímetro atual do equipamento
            let currentRefrigerationUsageHours = 0;
            if (refrigerationUnit) {
              const refrigerationRefuelings = allRefuelings
                .filter(r => r.refrigerationUnitId === refrigerationUnit.id)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              
              currentRefrigerationUsageHours = refrigerationRefuelings.length > 0 
                ? refrigerationRefuelings[refrigerationRefuelings.length - 1].usageHours || refrigerationUnit.initialUsageHours || 0
                : refrigerationUnit.initialUsageHours || 0;
            }
            
            return (
              <VehicleSaleForm
                currentKm={vehicleToSell.currentKm}
                hasRefrigeration={!!refrigerationUnit}
                refrigerationId={refrigerationUnit?.id}
                currentRefrigerationUsageHours={currentRefrigerationUsageHours}
                onSubmit={handleConfirmSale}
                onCancel={() => setSaleDialogOpen(false)}
              />
            );
          })()}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="traction" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="traction">
            Veículos de Tração ({tractionVehicles.length})
          </TabsTrigger>
          <TabsTrigger value="trailer">
            Veículos de Reboque ({trailerVehicles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traction" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tractionVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle as any}
                getStatusBadge={getStatusBadge}
                getRefrigerationUnit={getRefrigerationUnitByVehicle}
                calculateAverageConsumption={calculateAverageConsumption}
                allDrivers={allDrivers}
                allVehicles={apiVehicles as any}
                allCompanies={allCompanies}
                getAvailableDrivers={getAvailableDrivers}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleViewDetails={handleViewDetails}
                handleSellVehicle={handleSellVehicle}
                handleReverseSale={handleReverseSale}
                handleStatusChange={handleStatusChange}
                handleDriverChange={handleDriverChange}
                handleAddComposition={handleAddComposition}
                handleRemoveComposition={handleRemoveComposition}
                isAdmin={isAdmin}
              />
            ))}
          </div>
          {loadingVehicles && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground text-sm">Carregando veículos...</div>
            </div>
          )}
          {hasMoreVehicles && !loadingVehicles && (
            <div className="flex items-center justify-center py-4">
              <Button onClick={loadMoreVehicles} variant="outline">
                Carregar mais veículos
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trailer" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trailerVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle as any}
                getStatusBadge={getStatusBadge}
                getRefrigerationUnit={getRefrigerationUnitByVehicle}
                calculateAverageConsumption={calculateAverageConsumption}
                allDrivers={allDrivers}
                allVehicles={apiVehicles as any}
                allCompanies={allCompanies}
                getAvailableDrivers={getAvailableDrivers}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleViewDetails={handleViewDetails}
                handleSellVehicle={handleSellVehicle}
                handleReverseSale={handleReverseSale}
                handleStatusChange={handleStatusChange}
                handleDriverChange={handleDriverChange}
                handleAddComposition={handleAddComposition}
                handleRemoveComposition={handleRemoveComposition}
                isAdmin={isAdmin}
              />
            ))}
          </div>
          {loadingVehicles && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground text-sm">Carregando veículos...</div>
            </div>
          )}
          {hasMoreVehicles && !loadingVehicles && (
            <div className="flex items-center justify-center py-4">
              <Button onClick={loadMoreVehicles} variant="outline">
                Carregar mais veículos
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
