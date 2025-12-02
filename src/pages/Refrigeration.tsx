import { useState, useEffect, useCallback } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useMockData, RefrigerationUnit } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Snowflake, Thermometer, Pencil, Trash2, Eye, Link2, Search, Building2, Check, ChevronsUpDown, DollarSign, Undo2, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { exportRefrigerationsToExcel } from '@/lib/excelExport';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { RefrigerationForm } from '@/components/forms/RefrigerationForm';
import { RefrigerationSaleForm, RefrigerationSale } from '@/components/forms/RefrigerationSaleForm';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createRefrigerationUnit, getRefrigerationUnits, deleteRefrigerationUnit as deleteRefrigerationUnitApi, updateRefrigerationUnitStatus, PaginatedRefrigerationUnits } from '@/services/refrigerationApi';

export default function Refrigeration() {
  const { 
    refrigerationUnits, 
    vehicles, 
    suppliers, 
    companies, 
    refuelings,
    addRefrigerationUnit, 
    updateRefrigerationUnit, 
    deleteRefrigerationUnit,
    sellRefrigerationUnit,
    reverseRefrigerationSale
  } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<RefrigerationUnit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<{ id: string; name: string } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<RefrigerationUnit | null>(null);
  const [brandFilter, setBrandFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [serialNumberFilter, setSerialNumberFilter] = useState('');
  const [openVehicleLink, setOpenVehicleLink] = useState<{[key: string]: boolean}>({});
  const [apiUnits, setApiUnits] = useState<RefrigerationUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [sellingUnit, setSellingUnit] = useState<RefrigerationUnit | null>(null);
  const [reverseSaleDialogOpen, setReverseSaleDialogOpen] = useState(false);
  const [unitToReverseSale, setUnitToReverseSale] = useState<RefrigerationUnit | null>(null);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [unitToChangeStatus, setUnitToChangeStatus] = useState<{ unitId: string; serialNumber: string; newStatus: string; currentStatus: string; hasVehicle: boolean } | null>(null);
  const allUnits = refrigerationUnits();
  const allVehicles = vehicles();
  const allSuppliers = suppliers();
  const allCompanies = companies();
  const allRefuelings = refuelings();

  // Função para buscar equipamentos da API
  const fetchRefrigerationUnits = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await getRefrigerationUnits({
        page,
        limit: 10,
        brand: brandFilter.length >= 2 ? brandFilter : undefined,
        model: modelFilter.length >= 2 ? modelFilter : undefined,
        serialNumber: serialNumberFilter.length >= 2 ? serialNumberFilter : undefined,
      });

      if (response.success && response.data) {
        const paginatedData = response.data as unknown as PaginatedRefrigerationUnits;
        
        if (page === 1) {
          setApiUnits(paginatedData.data);
        } else {
          setApiUnits(prev => [...prev, ...paginatedData.data]);
        }
        
        setCurrentPage(paginatedData.page);
        setTotalPages(paginatedData.totalPages);
        setHasMorePages(paginatedData.page < paginatedData.totalPages);
      }
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      toast({
        title: 'Erro ao buscar',
        description: 'Não foi possível carregar os equipamentos. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [brandFilter, modelFilter, serialNumberFilter, toast]);

  // Buscar inicial ao carregar a página
  useEffect(() => {
    fetchRefrigerationUnits(1);
  }, []);

  // Buscar quando os filtros mudarem (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRefrigerationUnits(1);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
  }, [brandFilter, modelFilter, serialNumberFilter]);

  // Carregar mais ao fazer scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMorePages) {
      fetchRefrigerationUnits(currentPage + 1);
    }
  }, [loading, hasMorePages, currentPage, fetchRefrigerationUnits]);

  const displayedItems = apiUnits;

  // Função para calcular horímetro atual e consumo
  const getRefrigerationStats = (unitId: string, initialHours: number = 0) => {
    const unitRefuelings = allRefuelings
      .filter(r => r.refrigerationUnitId === unitId)
      .sort((a, b) => new Date(a.refuelingDate).getTime() - new Date(b.refuelingDate).getTime());
    
    if (unitRefuelings.length === 0) {
      return {
        currentUsageHours: initialHours,
        consumption: 0
      };
    }

    // Pegar o último abastecimento para horímetro atual
    const lastRefueling = unitRefuelings[unitRefuelings.length - 1];
    const currentUsageHours = lastRefueling.usageHours || initialHours;

    // Calcular consumo total
    const totalLiters = unitRefuelings.reduce((sum, r) => sum + (typeof r.liters === 'string' ? parseFloat(r.liters) : r.liters), 0);
    const hoursUsed = currentUsageHours - initialHours;
    const consumption = hoursUsed > 0 ? totalLiters / hoursUsed : 0;

    return {
      currentUsageHours,
      consumption
    };
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingUnit) {
        updateRefrigerationUnit(editingUnit.id, data);
        toast({
          title: 'Equipamento atualizado',
          description: 'Aparelho de refrigeração atualizado com sucesso.',
        });
      } else {
        await createRefrigerationUnit(data);
        toast({
          title: 'Equipamento cadastrado',
          description: 'Aparelho de refrigeração cadastrado com sucesso.',
        });
      }
      handleDialogClose();
    } catch (error) {
      console.error('Erro ao cadastrar equipamento:', error);
      toast({
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o equipamento. Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (unit: RefrigerationUnit) => {
    setEditingUnit(unit);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditingUnit(null);
  };

  const handleDeleteClick = (unitId: string, unitName: string) => {
    setUnitToDelete({ id: unitId, name: unitName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (unitToDelete) {
      try {
        await deleteRefrigerationUnitApi(unitToDelete.id);
        toast({
          title: 'Equipamento removido',
          description: `${unitToDelete.name} foi removido do sistema.`,
        });
        // Atualizar a lista após excluir
        fetchRefrigerationUnits(1);
      } catch (error) {
        console.error('Erro ao excluir equipamento:', error);
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir o equipamento. Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setDeleteDialogOpen(false);
        setUnitToDelete(null);
      }
    }
  };

  const handleViewDetails = (unit: RefrigerationUnit) => {
    setViewingUnit(unit);
    setDetailsDialogOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      freezer: { label: 'Freezer', className: 'bg-chart-1 text-white' },
      cooled: { label: 'Resfriado', className: 'bg-chart-2 text-white' },
      climatized: { label: 'Climatizado', className: 'bg-chart-3 text-white' }
    };
    const variant = variants[type as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      freezer: 'Freezer',
      cooled: 'Resfriado',
      climatized: 'Climatizado'
    };
    return labels[type as keyof typeof labels];
  };

  const getCompanyName = (companyId: string) => {
    const company = allCompanies.find(c => c.id === companyId);
    return company ? `${company.name} - ${company.cnpj}` : 'Empresa não encontrada';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
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

  const handleStatusChange = (unitId: string, serialNumber: string, newStatus: string, currentStatus: string, hasVehicle: boolean) => {
    // Validação: se vinculado a veículo, só permite active ou defective
    if (hasVehicle && newStatus !== 'active' && newStatus !== 'defective') {
      toast({
        title: 'Operação inválida',
        description: 'Equipamentos vinculados só podem estar ativos ou com defeito',
        variant: 'destructive',
      });
      return;
    }
    
    // Abre o diálogo de confirmação apenas se está ativando ou inativando
    if (newStatus === 'active' || newStatus === 'inactive') {
      setUnitToChangeStatus({ unitId, serialNumber, newStatus, currentStatus, hasVehicle });
      setStatusChangeDialogOpen(true);
    } else {
      // Para outros status (manutenção, defeito), aplica diretamente
      confirmStatusChange(unitId, newStatus);
    }
  };

  const confirmStatusChange = async (unitId: string, newStatus: string) => {
    try {
      await updateRefrigerationUnitStatus(
        unitId,
        newStatus as 'active' | 'defective' | 'maintenance' | 'inactive' | 'sold'
      );
      const statusLabels = {
        active: 'Ativo',
        defective: 'Defeito',
        maintenance: 'Manutenção',
        inactive: 'Inativo',
        sold: 'Vendido'
      };
      toast({
        title: 'Status atualizado',
        description: `Status alterado para ${statusLabels[newStatus as keyof typeof statusLabels]}`,
      });
      // Atualizar a lista após alterar o status
      fetchRefrigerationUnits(currentPage);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setStatusChangeDialogOpen(false);
      setUnitToChangeStatus(null);
    }
  };

  const handleVehicleLink = (unitId: string, vehicleId: string) => {
    const unit = allUnits.find(u => u.id === unitId);
    if (!unit) return;

    const actualVehicleId = vehicleId === 'none' ? undefined : vehicleId;

    // Se está vinculando a um veículo e o status não é válido, ajusta para active
    if (actualVehicleId && unit.status !== 'active' && unit.status !== 'defective') {
      updateRefrigerationUnit(unitId, { 
        vehicleId: actualVehicleId,
        status: 'active'
      });
      toast({
        title: 'Vinculação realizada',
        description: 'Equipamento vinculado e status ajustado para Ativo',
      });
    } else {
      updateRefrigerationUnit(unitId, { vehicleId: actualVehicleId });
      toast({
        title: actualVehicleId ? 'Vinculação realizada' : 'Vínculo removido',
        description: actualVehicleId ? 'Equipamento vinculado ao veículo' : 'Equipamento desvinculado',
      });
    }
  };

  const handleSellClick = (unit: RefrigerationUnit) => {
    setSellingUnit(unit);
    setSaleDialogOpen(true);
  };

  const handleSaleSubmit = (saleData: RefrigerationSale) => {
    if (sellingUnit) {
      sellRefrigerationUnit(sellingUnit.id, saleData);
      toast({
        title: 'Venda registrada',
        description: `Equipamento ${sellingUnit.brand} ${sellingUnit.model} vendido com sucesso.`,
      });
      setSaleDialogOpen(false);
      setSellingUnit(null);
    }
  };

  const handleReverseSale = (unitId: string, unitName: string) => {
    reverseRefrigerationSale(unitId);
    toast({
      title: 'Venda revertida',
      description: `Venda de ${unitName} foi revertida.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Aparelhos de Refrigeração</h2>
            <p className="text-sm lg:text-base text-muted-foreground">
              Controle dos equipamentos de refrigeração da frota
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={() => exportRefrigerationsToExcel(displayedItems)}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
            <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Aparelho
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Editar Equipamento de Refrigeração' : 'Cadastrar Equipamento de Refrigeração'}</DialogTitle>
            <DialogDescription>
              {editingUnit ? 'Atualize as informações do aparelho' : 'Adicione um novo aparelho de refrigeração à frota'}
            </DialogDescription>
          </DialogHeader>
          <RefrigerationForm
            onSubmit={handleSubmit}
            onCancel={handleDialogClose}
            initialData={editingUnit}
          />
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por marca (mín. 2 caracteres)..."
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por modelo (mín. 2 caracteres)..."
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por número de série (mín. 2 caracteres)..."
            value={serialNumberFilter}
            onChange={(e) => setSerialNumberFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading && currentPage === 1 && (
        <div className="text-center py-8 text-muted-foreground">
          Carregando equipamentos...
        </div>
      )}

      {!loading && displayedItems.length === 0 && (brandFilter.length >= 2 || modelFilter.length >= 2 || serialNumberFilter.length >= 2) && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum equipamento encontrado com os filtros aplicados.
        </div>
      )}


      <div className="grid gap-4 md:grid-cols-2">
        {displayedItems.map((unit) => {
          const vehicle = allVehicles.find(v => v.id === unit.vehicleId);
          const stats = getRefrigerationStats(unit.id, unit.initialUsageHours || 0);
          const needsVehicle = !unit.vehicleId && unit.status !== 'sold' && unit.status !== 'inactive';
          return (
            <Card key={unit.id} className={cn(
              "hover:shadow-lg transition-shadow",
              unit.status === 'sold' && "opacity-60 grayscale",
              needsVehicle && "border-l-4 border-l-yellow-500"
            )}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      needsVehicle ? "bg-yellow-500/10" : "bg-chart-1/10"
                    )}>
                      {needsVehicle ? (
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      ) : (
                        <Snowflake className="h-6 w-6 text-chart-1" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{unit.brand} {unit.model}</CardTitle>
                      <p className="text-sm text-muted-foreground">SN: {unit.serialNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(unit.status)}
                    {getTypeBadge(unit.type)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{getCompanyName(unit.companyId)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <p className="text-muted-foreground mb-1">Horímetro - Compra</p>
                    <p className="font-semibold">{(unit.initialUsageHours || 0).toLocaleString('pt-BR')} h</p>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <p className="text-muted-foreground mb-1">Horímetro - Atual</p>
                    <p className="font-semibold">{stats.currentUsageHours.toLocaleString('pt-BR')} h</p>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <p className="text-muted-foreground mb-1">Consumo (l/h)</p>
                    <p className="font-semibold">{stats.consumption > 0 ? stats.consumption.toFixed(2) : '0.00'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
                    <Thermometer className="h-5 w-5 text-chart-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Temperatura</p>
                      <p className="text-xs text-muted-foreground">
                        {unit.minTemp}°C a {unit.maxTemp}°C
                      </p>
                    </div>
                  </div>
                  {unit.fuelType && (
                    <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Combustível</p>
                        <p className="text-xs text-muted-foreground">
                          {unit.fuelType}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={cn(
                  "pt-3 border-t border-border",
                  needsVehicle && "bg-yellow-50 dark:bg-yellow-950/20 -mx-6 px-6 pb-3 rounded-b-lg"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-muted-foreground">Vincular a Veículo:</p>
                    {needsVehicle && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400 text-xs">
                        Requer vínculo
                      </Badge>
                    )}
                  </div>
                  <Popover open={openVehicleLink[unit.id] || false} onOpenChange={(open) => setOpenVehicleLink({...openVehicleLink, [unit.id]: open})}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          needsVehicle && "border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"
                        )}
                      >
                        {unit.vehicleId
                          ? (() => {
                              const vehicle = allVehicles.find(v => v.id === unit.vehicleId);
                              return vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Sem vínculo";
                            })()
                          : "Sem vínculo"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar veículo por placa..." />
                        <CommandList>
                          <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                handleVehicleLink(unit.id, 'none');
                                setOpenVehicleLink({...openVehicleLink, [unit.id]: false});
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  !unit.vehicleId ? "opacity-100" : "opacity-0"
                                )}
                              />
                              Sem vínculo
                            </CommandItem>
                            {allVehicles.map((vehicle) => (
                              <CommandItem
                                key={vehicle.id}
                                value={`${vehicle.plate} ${vehicle.model} ${vehicle.brand} ${vehicle.vehicleType}`}
                                onSelect={() => {
                                  handleVehicleLink(unit.id, vehicle.id);
                                  setOpenVehicleLink({...openVehicleLink, [unit.id]: false});
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    vehicle.id === unit.vehicleId ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col gap-0.5">
                                  <div className="font-semibold">
                                    {vehicle.plate}
                                  </div>
                                  <div className="text-xs font-medium">
                                    {vehicle.brand} {vehicle.model} | {vehicle.vehicleType}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {unit.status !== 'sold' && (
                  <>
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Alterar Status:</p>
                      <Select
                        value={unit.status}
                        onValueChange={(value) => handleStatusChange(unit.id, unit.serialNumber, value, unit.status, !!unit.vehicleId)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="defective">Defeito</SelectItem>
                          {!unit.vehicleId && (
                            <>
                              <SelectItem value="maintenance">Manutenção</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewDetails(unit)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(unit)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSellClick(unit)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Vender</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteClick(unit.id, `${unit.brand} ${unit.model}`)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </>
                )}

                {unit.status === 'sold' && (
                  <>
                    <div className="pt-3 border-t border-border bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Informações da Venda</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Comprador:</span>
                          <p className="font-medium">{unit.saleInfo?.buyerName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor:</span>
                          <p className="font-medium">R$ {unit.saleInfo?.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data:</span>
                          <p className="font-medium">{unit.saleInfo?.saleDate ? formatDate(unit.saleInfo.saleDate) : '-'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Horímetro - Venda:</span>
                          <p className="font-medium">{unit.saleInfo?.usageHours.toLocaleString('pt-BR')} h</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewDetails(unit)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReverseSale(unit.id, `${unit.brand} ${unit.model}`)}
                      >
                        <Undo2 className="h-4 w-4 mr-2" />
                        Reverter Venda
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasMorePages && (
        <div className="flex items-center justify-center py-8">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Carregar mais equipamentos'}
          </Button>
        </div>
      )}

      {allUnits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Snowflake className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum aparelho cadastrado</p>
            <p className="text-sm text-muted-foreground mb-4">
              Comece adicionando um aparelho de refrigeração
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Aparelho
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aparelho <strong>{unitToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {unitToChangeStatus?.newStatus === 'active' ? 'ativar' : 'inativar'} o equipamento <strong>{unitToChangeStatus?.serialNumber}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => unitToChangeStatus && confirmStatusChange(unitToChangeStatus.unitId, unitToChangeStatus.newStatus)}>
              {unitToChangeStatus?.newStatus === 'active' ? 'Ativar' : 'Inativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Equipamento de Refrigeração</DialogTitle>
            <DialogDescription>
              Informações completas do aparelho
            </DialogDescription>
          </DialogHeader>

          {viewingUnit && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Informações do Equipamento</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Marca:</span>
                    <p className="font-medium">{viewingUnit.brand}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Modelo:</span>
                    <p className="font-medium">{viewingUnit.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Número de Série:</span>
                    <p className="font-medium font-mono">{viewingUnit.serialNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <div className="mt-1">
                      {getTypeBadge(viewingUnit.type)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data de Instalação:</span>
                    <p className="font-medium">{formatDate(viewingUnit.installDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      {getStatusBadge(viewingUnit.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Especificações Técnicas</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-chart-1/5 rounded-lg border border-chart-1/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Thermometer className="h-6 w-6 text-chart-1" />
                      <div>
                        <p className="font-semibold">Faixa de Temperatura Operacional</p>
                        <p className="text-sm text-muted-foreground">Capacidade de refrigeração do equipamento</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Temperatura Mínima:</span>
                        <p className="text-xl font-bold text-chart-1">{viewingUnit.minTemp}°C</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Temperatura Máxima:</span>
                        <p className="text-xl font-bold text-chart-1">{viewingUnit.maxTemp}°C</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Horímetro - Compra:</span>
                        <p className="text-lg font-semibold">{(viewingUnit.initialUsageHours || 0).toLocaleString('pt-BR')} h</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Horímetro - Atual:</span>
                        <p className="text-lg font-semibold text-primary">
                          {(() => {
                            const stats = getRefrigerationStats(viewingUnit.id, viewingUnit.initialUsageHours || 0);
                            return stats.currentUsageHours.toLocaleString('pt-BR');
                          })()} h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Veículo Vinculado</h3>
                {viewingUnit.vehicleId ? (
                  (() => {
                    const vehicle = allVehicles.find(v => v.id === viewingUnit.vehicleId);
                    return vehicle ? (
                      <div className="p-4 bg-muted rounded-lg border border-border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Placa:</span>
                            <p className="font-medium">{vehicle.plate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Marca/Modelo:</span>
                            <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <p className="font-medium">{vehicle.vehicleType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ano:</span>
                            <p className="font-medium">
                              {vehicle.manufacturingYear && vehicle.modelYear
                                ? `${vehicle.manufacturingYear}/${vehicle.modelYear.toString().slice(-2)}`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Veículo não encontrado</p>
                    );
                  })()
                ) : (
                  <div className="p-4 bg-muted rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">Sem vínculo com veículo</p>
                  </div>
                )}
              </div>

              {viewingUnit.saleInfo && (
                <div>
                  <h3 className="font-semibold mb-3">Informações da Venda</h3>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Comprador:</span>
                        <p className="font-medium">{viewingUnit.saleInfo.buyerName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPF/CNPJ:</span>
                        <p className="font-medium font-mono">{viewingUnit.saleInfo.buyerCpfCnpj}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data da Venda:</span>
                        <p className="font-medium">{formatDate(viewingUnit.saleInfo.saleDate)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Horímetro - Venda:</span>
                        <p className="font-medium">{viewingUnit.saleInfo.usageHours.toLocaleString('pt-BR')} h</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Preço de Venda:</span>
                        <p className="text-xl font-bold text-green-600">
                          R$ {viewingUnit.saleInfo.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      {viewingUnit.saleInfo.paymentReceipt && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Comprovante de Recebimento:</span>
                          {viewingUnit.saleInfo.paymentReceipt.startsWith('data:image') ? (
                            <img
                              src={viewingUnit.saleInfo.paymentReceipt}
                              alt="Comprovante"
                              className="mt-2 w-full max-w-md h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(viewingUnit.saleInfo.paymentReceipt, '_blank')}
                            />
                          ) : (
                            <a
                              href={viewingUnit.saleInfo.paymentReceipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Eye className="h-4 w-4" />
                              Visualizar documento
                            </a>
                          )}
                        </div>
                      )}
                      {viewingUnit.saleInfo.transferDocument && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Nota Fiscal de Venda:</span>
                          {viewingUnit.saleInfo.transferDocument.startsWith('data:image') ? (
                            <img
                              src={viewingUnit.saleInfo.transferDocument}
                              alt="Nota Fiscal"
                              className="mt-2 w-full max-w-md h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(viewingUnit.saleInfo.transferDocument, '_blank')}
                            />
                          ) : (
                            <a
                              href={viewingUnit.saleInfo.transferDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Eye className="h-4 w-4" />
                              Visualizar documento
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleEdit(viewingUnit);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {viewingUnit.status !== 'sold' && (
                  <Select
                    value={viewingUnit.status}
                    onValueChange={(value) => {
                      const hasVehicle = !!viewingUnit.vehicleId;
                      handleStatusChange(viewingUnit.id, viewingUnit.serialNumber, value, viewingUnit.status, hasVehicle);
                      setViewingUnit({ ...viewingUnit, status: value as any });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="defective">Defeito</SelectItem>
                      <SelectItem value="maintenance" disabled={!!viewingUnit.vehicleId}>
                        Manutenção {viewingUnit.vehicleId && '(Desvinc. veículo)'}
                      </SelectItem>
                      <SelectItem value="inactive" disabled={!!viewingUnit.vehicleId}>
                        Inativo {viewingUnit.vehicleId && '(Desvinc. veículo)'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Venda de Equipamento</DialogTitle>
            <DialogDescription>
              {sellingUnit && `${sellingUnit.brand} ${sellingUnit.model} - SN: ${sellingUnit.serialNumber}`}
            </DialogDescription>
          </DialogHeader>
          {sellingUnit && (
            <RefrigerationSaleForm
              onSubmit={handleSaleSubmit}
              onCancel={() => {
                setSaleDialogOpen(false);
                setSellingUnit(null);
              }}
              initialUsageHours={sellingUnit.initialUsageHours || 0}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
