import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  getRefuelings, 
  createRefueling, 
  updateRefueling, 
  deleteRefueling,
  getVehiclesCombo,
  getDriversCombo,
  getRefrigerationUnitsCombo,
  type Refueling,
  type VehicleCombo,
  type DriverCombo,
  type RefrigerationUnitCombo
} from '@/services/refuelingsApi';
import { getSuppliersCombo, getSuppliers, type SupplierCombo, type Supplier } from '@/services/suppliersApi';
import { getVehicles, type Vehicle } from '@/services/vehiclesApi';
import { fetchDrivers, type DriverResponse } from '@/services/driversApi';
import { getRefrigerationUnits, type RefrigerationUnit as RefrigerationUnitAPI } from '@/services/refrigerationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Fuel, Pencil, Trash2, FilterX, CalendarIcon, FileText, Truck, Snowflake, Check, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast';
import { RefuelingForm } from '@/components/forms/RefuelingForm';

export default function Refuelings() {
  const { isAdmin } = usePermissions();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingRefueling, setEditingRefueling] = useState<Refueling | null>(null);
  const [deletingRefueling, setDeletingRefueling] = useState<Refueling | null>(null);
  const [viewingRefueling, setViewingRefueling] = useState<Refueling | null>(null);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'refrigeration'>('vehicles');
  const [loading, setLoading] = useState(true);
  
  // Dados da API
  const [refuelingsData, setRefuelingsData] = useState<Refueling[]>([]);
  
  // Combos para filtros
  const [vehiclesCombo, setVehiclesCombo] = useState<VehicleCombo[]>([]);
  const [driversCombo, setDriversCombo] = useState<DriverCombo[]>([]);
  const [suppliersCombo, setSuppliersCombo] = useState<SupplierCombo[]>([]);
  const [refrigerationUnitsCombo, setRefrigerationUnitsCombo] = useState<RefrigerationUnitCombo[]>([]);
  
  // Dados completos para o formulário
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [refrigerationUnits, setRefrigerationUnits] = useState<RefrigerationUnitAPI[]>([]);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 20;
  
  // Filtros avançados
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedRefrigerationUnit, setSelectedRefrigerationUnit] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  
  // Estados para controlar popovers dos filtros
  const [openVehicleFilter, setOpenVehicleFilter] = useState(false);
  const [openRefrigerationFilter, setOpenRefrigerationFilter] = useState(false);
  const [openDriverFilter, setOpenDriverFilter] = useState(false);
  const [openSupplierFilter, setOpenSupplierFilter] = useState(false);

  // Carregar combos para filtros
  useEffect(() => {
    const loadCombos = async () => {
      try {
        const [vehiclesRes, driversRes, suppliersRes, refrigerationRes] = await Promise.all([
          getVehiclesCombo(),
          getDriversCombo(),
          getSuppliersCombo(),
          getRefrigerationUnitsCombo(),
        ]);
        
        setVehiclesCombo(vehiclesRes);
        setDriversCombo(driversRes);
        setSuppliersCombo(suppliersRes.data || []);
        setRefrigerationUnitsCombo(refrigerationRes);
      } catch (error) {
        console.error('Erro ao carregar combos:', error);
        toast({
          title: 'Erro ao carregar dados dos filtros',
          description: 'Não foi possível carregar os dados necessários',
          variant: 'destructive',
        });
      }
    };

    loadCombos();
  }, [toast]);

  // Carregar dados completos para o formulário
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [vehiclesRes, driversRes, suppliersRes, refrigerationRes] = await Promise.all([
          getVehicles({ limit: 1000 }),
          fetchDrivers(1, 1000),
          getSuppliers(),
          getRefrigerationUnits({ page: 1, limit: 1000 }),
        ]);

        setVehicles(vehiclesRes.data?.data || []);
        setDrivers(driversRes.data?.data || []);
        setSuppliers(suppliersRes || []);
        setRefrigerationUnits(refrigerationRes.data?.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados do formulário:', error);
        toast({
          title: 'Erro ao carregar dados do formulário',
          description: 'Não foi possível carregar os dados necessários',
          variant: 'destructive',
        });
      }
    };

    loadFormData();
  }, [toast]);

  // Carregar abastecimentos
  const loadRefuelings = async () => {
    setLoading(true);
    try {
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (startDate) filters.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) filters.endDate = format(endDate, 'yyyy-MM-dd');
      if (selectedVehicle !== 'all') filters.vehicleId = selectedVehicle;
      if (selectedRefrigerationUnit !== 'all') filters.refrigerationUnitId = selectedRefrigerationUnit;
      if (selectedDriver !== 'all') filters.driverId = selectedDriver;
      if (selectedSupplier !== 'all') filters.supplierId = selectedSupplier;

      const response = await getRefuelings(filters);
      
      setRefuelingsData(response.data?.data || []);
      setTotalPages(response.data?.pagination.totalPages || 1);
      setTotalRecords(response.data?.pagination.totalRecords || 0);
      setCurrentPage(response.data?.pagination.currentPage || 1);
    } catch (error) {
      console.error('Erro ao carregar abastecimentos:', error);
      toast({
        title: 'Erro ao carregar abastecimentos',
        description: 'Não foi possível carregar os dados dos abastecimentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando página ou tab mudar
  useEffect(() => {
    loadRefuelings();
  }, [currentPage, activeTab]);

  // Recarregar automaticamente quando filtros mudarem
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1); // Volta pra página 1 e o useEffect acima carrega
    } else {
      loadRefuelings(); // Já está na página 1, então recarrega direto
    }
  }, [startDate, endDate, selectedVehicle, selectedRefrigerationUnit, selectedDriver, selectedSupplier]);

  const handleSubmit = async (data: any) => {
    console.log('[Refuelings] handleSubmit called with data:', data);
    console.log('[Refuelings] editingRefueling:', editingRefueling);
    
    try {
      if (editingRefueling) {
        console.log('[Refuelings] Updating refueling with ID:', editingRefueling.id);
        await updateRefueling(editingRefueling.id, data);
        toast({
          title: 'Abastecimento atualizado',
          description: 'Abastecimento atualizado com sucesso.',
        });
        setEditingRefueling(null);
      } else {
        console.log('[Refuelings] Creating new refueling');
        await createRefueling(data);
        toast({
          title: 'Abastecimento registrado',
          description: 'Abastecimento cadastrado com sucesso.',
        });
      }
      setOpen(false);
      loadRefuelings();
    } catch (error) {
      console.error('Erro ao salvar abastecimento:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o abastecimento',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (refueling: Refueling) => {
    setEditingRefueling(refueling);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (deletingRefueling) {
      try {
        await deleteRefueling(deletingRefueling.id);
        toast({
          title: 'Abastecimento excluído',
          description: 'Abastecimento excluído com sucesso.',
        });
        setDeletingRefueling(null);
        loadRefuelings();
      } catch (error) {
        console.error('Erro ao excluir abastecimento:', error);
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir o abastecimento',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingRefueling(null);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedVehicle('all');
    setSelectedRefrigerationUnit('all');
    setSelectedDriver('all');
    setSelectedSupplier('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = startDate || endDate || selectedVehicle !== 'all' || 
    selectedRefrigerationUnit !== 'all' || 
    selectedDriver !== 'all' || selectedSupplier !== 'all';

  // Separar abastecimentos de veículos e equipamentos de refrigeração
  const vehicleRefuelings = refuelingsData.filter(r => r.vehicleId);
  const refrigerationRefuelings = refuelingsData.filter(r => r.refrigerationUnitId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Abastecimentos</h2>
            <p className="text-sm lg:text-base text-muted-foreground">
              Controle de abastecimentos e custos com combustível
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Abastecimento
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRefueling ? 'Editar' : 'Cadastrar'} Abastecimento</DialogTitle>
            <DialogDescription>
              {editingRefueling ? 'Edite os dados do' : 'Registre um novo'} abastecimento da frota
            </DialogDescription>
          </DialogHeader>
          <RefuelingForm
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
            vehicles={vehicles as any}
            drivers={drivers as any}
            suppliers={suppliers as any}
            refrigerationUnits={refrigerationUnits as any}
            initialData={editingRefueling as any}
            onAddSupplier={async (supplier) => {
              toast({
                title: 'Funcionalidade em desenvolvimento',
                description: 'Cadastro rápido de fornecedor será implementado em breve',
              });
            }}
            onUpdateVehicleDriver={(vehicleId, driverId) => {
              toast({
                title: 'Funcionalidade em desenvolvimento',
                description: 'Vinculação de motorista será implementada em breve',
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Abas de Tipo */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'vehicles' | 'refrigeration')} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Veículos ({vehicleRefuelings.length})
          </TabsTrigger>
          <TabsTrigger value="refrigeration" className="flex items-center gap-2">
            <Snowflake className="h-4 w-4" />
            Refrigeração ({refrigerationRefuelings.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filtros Avançados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros Avançados</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                <FilterX className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4`}>
            {/* Filtro de Data Inicial */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de Data Final */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de Veículo ou Equipamento */}
            {activeTab === 'vehicles' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Veículo</label>
                <Popover open={openVehicleFilter} onOpenChange={setOpenVehicleFilter}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        selectedVehicle === 'all' && "text-muted-foreground"
                      )}
                    >
                      {selectedVehicle === 'all' ? (
                        <span>Todos</span>
                      ) : (
                        (() => {
                          const vehicle = vehiclesCombo.find(v => v.id === selectedVehicle);
                          return vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Todos';
                        })()
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar veículo..." />
                      <CommandList>
                        <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setSelectedVehicle('all');
                              setOpenVehicleFilter(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedVehicle === 'all' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Todos
                          </CommandItem>
                          {vehiclesCombo.map((vehicle) => (
                            <CommandItem
                              key={vehicle.id}
                              value={`${vehicle.plate} ${vehicle.model}`}
                              onSelect={() => {
                                setSelectedVehicle(vehicle.id);
                                setOpenVehicleFilter(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  vehicle.id === selectedVehicle ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {vehicle.plate} - {vehicle.model}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipamento</label>
                <Popover open={openRefrigerationFilter} onOpenChange={setOpenRefrigerationFilter}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        selectedRefrigerationUnit === 'all' && "text-muted-foreground"
                      )}
                    >
                      {selectedRefrigerationUnit === 'all' ? (
                        <span>Todos</span>
                      ) : (
                        (() => {
                          const unit = refrigerationUnitsCombo.find(u => u.id === selectedRefrigerationUnit);
                          return unit ? `${unit.model} - SN: ${unit.serialNumber}` : 'Todos';
                        })()
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar equipamento..." />
                      <CommandList>
                        <CommandEmpty>Nenhum equipamento encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setSelectedRefrigerationUnit('all');
                              setOpenRefrigerationFilter(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedRefrigerationUnit === 'all' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Todos
                          </CommandItem>
                          {refrigerationUnitsCombo.map((unit) => (
                            <CommandItem
                              key={unit.id}
                              value={`${unit.model} ${unit.serialNumber}`}
                              onSelect={() => {
                                setSelectedRefrigerationUnit(unit.id);
                                setOpenRefrigerationFilter(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  unit.id === selectedRefrigerationUnit ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {unit.model} - SN: {unit.serialNumber}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Filtro de Motorista */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Motorista</label>
              <Popover open={openDriverFilter} onOpenChange={setOpenDriverFilter}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      selectedDriver === 'all' && "text-muted-foreground"
                    )}
                  >
                    {selectedDriver === 'all' ? (
                      <span>Todos</span>
                    ) : (
                      (() => {
                        const driver = driversCombo.find(d => d.id === selectedDriver);
                        return driver ? driver.name : 'Todos';
                      })()
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar motorista..." />
                    <CommandList>
                      <CommandEmpty>Nenhum motorista encontrado.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setSelectedDriver('all');
                            setOpenDriverFilter(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDriver === 'all' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Todos
                        </CommandItem>
                        {driversCombo.map((driver) => (
                          <CommandItem
                            key={driver.id}
                            value={`${driver.name} ${driver.cpf}`}
                            onSelect={() => {
                              setSelectedDriver(driver.id);
                              setOpenDriverFilter(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                driver.id === selectedDriver ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{driver.name}</span>
                              <span className="text-xs text-muted-foreground">{driver.cpf}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de Fornecedor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fornecedor</label>
              <Popover open={openSupplierFilter} onOpenChange={setOpenSupplierFilter}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      selectedSupplier === 'all' && "text-muted-foreground"
                    )}
                  >
                    {selectedSupplier === 'all' ? (
                      <span>Todos</span>
                    ) : (
                      (() => {
                        const supplier = suppliersCombo.find(s => s.id === selectedSupplier);
                        return supplier ? supplier.fantasyName || supplier.name : 'Todos';
                      })()
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar fornecedor..." />
                    <CommandList>
                      <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setSelectedSupplier('all');
                            setOpenSupplierFilter(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSupplier === 'all' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Todos
                        </CommandItem>
                        {suppliersCombo.filter(s => s.type === 'gas_station').map((supplier) => (
                          <CommandItem
                            key={supplier.id}
                            value={`${supplier.fantasyName || supplier.name} ${supplier.cnpj || supplier.cpf}`}
                            onSelect={() => {
                              setSelectedSupplier(supplier.id);
                              setOpenSupplierFilter(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                supplier.id === selectedSupplier ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col gap-1">
                              <div className="font-medium">{supplier.fantasyName || supplier.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {supplier.cnpj ? `CNPJ: ${supplier.cnpj}` : `CPF: ${supplier.cpf}`}
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Abastecimentos */}
      {activeTab === 'vehicles' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Histórico de Abastecimentos - Veículos
              {hasActiveFilters && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({vehicleRefuelings.length} {vehicleRefuelings.length === 1 ? 'resultado' : 'resultados'})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : vehicleRefuelings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum abastecimento de veículo encontrado.
              </div>
            ) : (
              <div className="space-y-4">
                {vehicleRefuelings.map((refueling) => (
                  <div
                    key={refueling.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-4/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Fuel className="h-5 w-5 sm:h-6 sm:w-6 text-chart-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">
                          {refueling.vehicle ? `${refueling.vehicle.plate} - ${refueling.vehicle.model}` : 'Veículo não identificado'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {refueling.supplier ? refueling.supplier.fantasyName || refueling.supplier.name : 'Fornecedor não identificado'} • {refueling.km?.toLocaleString('pt-BR')} km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      <div className="text-left sm:text-right flex-1 sm:flex-none">
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {parseFloat(refueling.liters).toFixed(2)}L × R$ {parseFloat(refueling.pricePerLiter).toFixed(2)}
                        </p>
                        <p className="font-bold text-base md:text-lg">
                          R$ {parseFloat(refueling.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(refueling.refuelingDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {isAdmin() && (
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => handleEdit(refueling)}
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingRefueling(refueling)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} • {totalRecords} {totalRecords === 1 ? 'registro' : 'registros'}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'refrigeration' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Histórico de Abastecimentos - Refrigeração
              {hasActiveFilters && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({refrigerationRefuelings.length} {refrigerationRefuelings.length === 1 ? 'resultado' : 'resultados'})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : refrigerationRefuelings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum abastecimento de equipamento de refrigeração encontrado.
              </div>
            ) : (
              <div className="space-y-4">
                {refrigerationRefuelings.map((refueling) => (
                  <div
                    key={refueling.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-4/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Fuel className="h-5 w-5 sm:h-6 sm:w-6 text-chart-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">
                          {refueling.refrigerationUnit ? `${refueling.refrigerationUnit.model} - SN: ${refueling.refrigerationUnit.serialNumber}` : 'Equipamento não identificado'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {refueling.supplier ? refueling.supplier.fantasyName || refueling.supplier.name : 'Fornecedor não identificado'} • {refueling.usageHours}h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      <div className="text-left sm:text-right flex-1 sm:flex-none">
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {parseFloat(refueling.liters).toFixed(2)}L × R$ {parseFloat(refueling.pricePerLiter).toFixed(2)}
                        </p>
                        <p className="font-bold text-base md:text-lg">
                          R$ {parseFloat(refueling.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(refueling.refuelingDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {isAdmin() && (
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => handleEdit(refueling)}
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingRefueling(refueling)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} • {totalRecords} {totalRecords === 1 ? 'registro' : 'registros'}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingRefueling} onOpenChange={() => setDeletingRefueling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este abastecimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
