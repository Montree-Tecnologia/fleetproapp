import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { usePermissions } from '@/hooks/usePermissions';
import mockupPaymentReceipt from '@/assets/mockup-payment-receipt.jpg';
import mockupFiscalNote from '@/assets/mockup-fiscal-note.jpg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Fuel, Pencil, Trash2, FilterX, CalendarIcon, FileText, Truck, Snowflake, Search, Check, ChevronsUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { RefuelingForm } from '@/components/forms/RefuelingForm';
import { useToast } from '@/hooks/use-toast';

export default function Refuelings() {
  const { refuelings, vehicles, drivers, suppliers, refrigerationUnits, addRefueling, updateRefueling, deleteRefueling } = useMockData();
  const { isAdmin } = usePermissions();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingRefueling, setEditingRefueling] = useState<any>(null);
  const [deletingRefueling, setDeletingRefueling] = useState<any>(null);
  const [viewingRefueling, setViewingRefueling] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'refrigeration'>('vehicles');
  
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
  
  const allRefuelings = refuelings();
  const allVehicles = vehicles();
  const allDrivers = drivers();
  const allSuppliers = suppliers();
  const allRefrigerationUnits = refrigerationUnits();

  // Filtrar apenas veículos de tração
  const tractionVehicleTypes = ['Truck', 'Cavalo Mecânico', 'Toco', 'VUC', '3/4', 'Bitruck'];
  const tractionVehicles = allVehicles.filter(v => 
    tractionVehicleTypes.includes(v.vehicleType) && 
    v.status !== 'sold'
  );

  const handleSubmit = (data: any) => {
    if (editingRefueling) {
      updateRefueling(editingRefueling.id, data);
      toast({
        title: 'Abastecimento atualizado',
        description: 'Abastecimento atualizado com sucesso.',
      });
      setEditingRefueling(null);
    } else {
      addRefueling(data);
      toast({
        title: 'Abastecimento registrado',
        description: 'Abastecimento cadastrado com sucesso.',
      });
    }
    setOpen(false);
  };

  const handleEdit = (refueling: any) => {
    setEditingRefueling(refueling);
    setOpen(true);
  };

  const handleDelete = () => {
    if (deletingRefueling) {
      deleteRefueling(deletingRefueling.id);
      toast({
        title: 'Abastecimento excluído',
        description: 'Abastecimento excluído com sucesso.',
      });
      setDeletingRefueling(null);
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
  };

  const hasActiveFilters = startDate || endDate || selectedVehicle !== 'all' || 
    selectedRefrigerationUnit !== 'all' || selectedDriver !== 'all' || selectedSupplier !== 'all';

  // Separar abastecimentos de veículos e equipamentos de refrigeração
  const vehicleRefuelings = allRefuelings.filter(r => r.vehicleId);
  const refrigerationRefuelings = allRefuelings.filter(r => r.refrigerationUnitId);

  const filteredVehicleRefuelings = vehicleRefuelings
    .filter((refueling) => {
      const refuelingDate = new Date(refueling.date);
      
      // Filtro de data inicial
      if (startDate && refuelingDate < startDate) return false;
      
      // Filtro de data final
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (refuelingDate > endOfDay) return false;
      }
      
      // Filtro de veículo
      if (selectedVehicle !== 'all' && refueling.vehicleId !== selectedVehicle) return false;
      
      // Filtro de motorista
      if (selectedDriver !== 'all' && refueling.driver !== selectedDriver) return false;
      
      // Filtro de fornecedor
      if (selectedSupplier !== 'all' && refueling.supplierId !== selectedSupplier) return false;
      
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredRefrigerationRefuelings = refrigerationRefuelings
    .filter((refueling) => {
      const refuelingDate = new Date(refueling.date);
      
      // Filtro de data inicial
      if (startDate && refuelingDate < startDate) return false;
      
      // Filtro de data final
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (refuelingDate > endOfDay) return false;
      }
      
      // Filtro de equipamento de refrigeração
      if (selectedRefrigerationUnit !== 'all' && refueling.refrigerationUnitId !== selectedRefrigerationUnit) return false;
      
      // Filtro de motorista
      if (selectedDriver !== 'all' && refueling.driver !== selectedDriver) return false;
      
      // Filtro de fornecedor
      if (selectedSupplier !== 'all' && refueling.supplierId !== selectedSupplier) return false;
      
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abastecimentos</h2>
          <p className="text-muted-foreground">
            Controle de abastecimentos e custos com combustível
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Abastecimento
          </Button>
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
              vehicles={tractionVehicles}
              drivers={allDrivers}
              suppliers={allSuppliers}
              refrigerationUnits={allRefrigerationUnits}
              initialData={editingRefueling}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Abas de Tipo */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'vehicles' | 'refrigeration')} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Veículos ({filteredVehicleRefuelings.length})
          </TabsTrigger>
          <TabsTrigger value="refrigeration" className="flex items-center gap-2">
            <Snowflake className="h-4 w-4" />
            Refrigeração ({filteredRefrigerationRefuelings.length})
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
          <div className={`grid grid-cols-1 md:grid-cols-2 ${activeTab === 'vehicles' ? 'lg:grid-cols-5' : 'lg:grid-cols-5'} gap-4`}>
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
                          const vehicle = tractionVehicles.find(v => v.id === selectedVehicle);
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
                          {tractionVehicles.map((vehicle) => (
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
                          const unit = allRefrigerationUnits.find(u => u.id === selectedRefrigerationUnit);
                          return unit ? `${unit.brand} ${unit.model} - SN: ${unit.serialNumber}` : 'Todos';
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
                          {allRefrigerationUnits.map((unit) => (
                            <CommandItem
                              key={unit.id}
                              value={`${unit.brand} ${unit.model} ${unit.serialNumber}`}
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
                              {unit.brand} {unit.model} - SN: {unit.serialNumber}
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
                      selectedDriver
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
                        {allDrivers.map((driver) => (
                          <CommandItem
                            key={driver.id}
                            value={`${driver.name} ${driver.cpf}`}
                            onSelect={() => {
                              setSelectedDriver(driver.name);
                              setOpenDriverFilter(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                driver.name === selectedDriver ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {driver.name}
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
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {allSuppliers.filter(s => s.type === 'gas_station').map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.fantasyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abastecimentos de Veículos */}
      {activeTab === 'vehicles' && (
          <Card>
            <CardHeader>
              <CardTitle>
                Histórico de Abastecimentos - Veículos
                {hasActiveFilters && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filteredVehicleRefuelings.length} {filteredVehicleRefuelings.length === 1 ? 'resultado' : 'resultados'})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredVehicleRefuelings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum abastecimento de veículo encontrado com os filtros aplicados.
                  </div>
                ) : (
                  filteredVehicleRefuelings.map((refueling) => {
                    const vehicle = allVehicles.find(v => v.id === refueling.vehicleId);
                    const supplier = allSuppliers.find(s => s.id === refueling.supplierId);
                    return (
                      <div
                        key={refueling.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => setViewingRefueling(refueling)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                            <Fuel className="h-6 w-6 text-chart-4" />
                          </div>
                          <div>
                            <p className="font-medium">{vehicle?.plate} - {vehicle?.model}</p>
                            <p className="text-sm text-muted-foreground">
                              {supplier?.fantasyName} • {supplier?.city}/{supplier?.state}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Motorista: {refueling.driver} • {refueling.km?.toLocaleString('pt-BR')} km • {refueling.fuelType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              R$ {refueling.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {refueling.liters}L × R$ {refueling.pricePerLiter.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(refueling.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {isAdmin() && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(refueling)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingRefueling(refueling)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
      )}

      {/* Abastecimentos de Equipamentos de Refrigeração */}
      {activeTab === 'refrigeration' && (
          <Card>
            <CardHeader>
              <CardTitle>
                Histórico de Abastecimentos - Equipamentos de Refrigeração
                {hasActiveFilters && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filteredRefrigerationRefuelings.length} {filteredRefrigerationRefuelings.length === 1 ? 'resultado' : 'resultados'})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRefrigerationRefuelings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum abastecimento de equipamento de refrigeração encontrado com os filtros aplicados.
                  </div>
                ) : (
                  filteredRefrigerationRefuelings.map((refueling) => {
                    const unit = allRefrigerationUnits.find(u => u.id === refueling.refrigerationUnitId);
                    const vehicle = unit?.vehicleId ? allVehicles.find(v => v.id === unit.vehicleId) : null;
                    const supplier = allSuppliers.find(s => s.id === refueling.supplierId);
                    return (
                      <div
                        key={refueling.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => setViewingRefueling(refueling)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Snowflake className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{unit?.brand} {unit?.model} - SN: {unit?.serialNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {supplier?.fantasyName} • {supplier?.city}/{supplier?.state}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {vehicle ? `Veículo: ${vehicle.plate}` : 'Sem veículo vinculado'} • 
                              {refueling.driver && ` Motorista: ${refueling.driver} • `}
                              {refueling.usageHours?.toLocaleString('pt-BR')}h • {refueling.fuelType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              R$ {refueling.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {refueling.liters}L × R$ {refueling.pricePerLiter.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(refueling.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {isAdmin() && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(refueling)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingRefueling(refueling)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
      )}

      <AlertDialog open={!!deletingRefueling} onOpenChange={(open) => !open && setDeletingRefueling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este abastecimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail View Dialog */}
      <Dialog open={!!viewingRefueling} onOpenChange={(open) => !open && setViewingRefueling(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Abastecimento</DialogTitle>
            <DialogDescription>
              Informações completas do abastecimento
            </DialogDescription>
          </DialogHeader>
          {viewingRefueling && (() => {
            const vehicle = allVehicles.find(v => v.id === viewingRefueling.vehicleId);
            const supplier = allSuppliers.find(s => s.id === viewingRefueling.supplierId);
            return (
              <div className="space-y-6">
                {/* Vehicle and Date Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Veículo</label>
                    <p className="text-lg font-semibold">{vehicle?.plate} - {vehicle?.model}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Data</label>
                    <p className="text-lg font-semibold">
                      {new Date(viewingRefueling.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Supplier and Driver Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Posto</label>
                    <p className="font-semibold">{supplier?.fantasyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {supplier?.city}/{supplier?.state}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Motorista</label>
                    <p className="font-semibold">{viewingRefueling.driver}</p>
                  </div>
                </div>

                {/* Fuel Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">KM</label>
                    <p className="text-lg font-semibold">
                      {viewingRefueling.km.toLocaleString('pt-BR')} km
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Combustível</label>
                    <p className="text-lg font-semibold">{viewingRefueling.fuelType}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Litros</label>
                    <p className="text-lg font-semibold">{viewingRefueling.liters}L</p>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Preço por Litro</label>
                    <p className="text-lg font-semibold">
                      R$ {viewingRefueling.pricePerLiter.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Valor Total</label>
                    <p className="text-2xl font-bold text-primary">
                      {viewingRefueling.totalValue.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Documentos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Comprovante de Pagamento
                      </label>
                      {viewingRefueling.paymentReceipt ? (
                        viewingRefueling.paymentReceipt.startsWith('data:image') ? (
                          <img
                            src={viewingRefueling.paymentReceipt}
                            alt="Comprovante"
                            className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90"
                            onClick={() => window.open(viewingRefueling.paymentReceipt, '_blank')}
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                            <FileText className="h-5 w-5" />
                            <span className="text-sm">Comprovante anexado</span>
                          </div>
                        )
                      ) : (
                        <img
                          src={mockupPaymentReceipt}
                          alt="Mockup Comprovante"
                          className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90"
                          onClick={() => window.open(mockupPaymentReceipt, '_blank')}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Nota Fiscal / Cupom
                      </label>
                      {viewingRefueling.fiscalNote ? (
                        viewingRefueling.fiscalNote.startsWith('data:image') ? (
                          <img
                            src={viewingRefueling.fiscalNote}
                            alt="Nota Fiscal"
                            className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90"
                            onClick={() => window.open(viewingRefueling.fiscalNote, '_blank')}
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                            <FileText className="h-5 w-5" />
                            <span className="text-sm">Nota fiscal anexada</span>
                          </div>
                        )
                      ) : (
                        <img
                          src={mockupFiscalNote}
                          alt="Mockup Nota Fiscal"
                          className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90"
                          onClick={() => window.open(mockupFiscalNote, '_blank')}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
