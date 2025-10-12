import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarIcon, FileText, Upload, X, Check, ChevronsUpDown, Truck, Snowflake, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDecimal, formatInteger, handleCurrencyInput, handleDecimalInput, handleIntegerInput } from '@/lib/formatters';
import { Refueling, Vehicle, Driver, Supplier, RefrigerationUnit } from '@/hooks/useMockData';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';

const refuelingSchema = z.object({
  entityType: z.enum(['vehicle', 'refrigeration']),
  vehicleId: z.string().optional(),
  refrigerationUnitId: z.string().optional(),
  date: z.date({
    required_error: 'Data é obrigatória',
  }),
  km: z.number().min(0, 'KM deve ser positivo').optional(),
  usageHours: z.number().min(0, 'Horas de uso devem ser positivas').optional(),
  liters: z.number().min(0.1, 'Litros deve ser maior que 0'),
  pricePerLiter: z.number().min(0.01, 'Preço por litro deve ser maior que 0'),
  fuelType: z.enum(['Diesel S10', 'Diesel S500', 'Arla 32', 'Gasolina', 'Etanol', 'GNV', 'Biometano', 'Outro']),
  supplierId: z.string().min(1, 'Posto é obrigatório'),
  driver: z.string().optional(),
}).refine((data) => {
  // Se for veículo, precisa ter vehicleId e km
  if (data.entityType === 'vehicle' && !data.vehicleId) {
    return false;
  }
  // Se for refrigeração, precisa ter refrigerationUnitId e usageHours
  if (data.entityType === 'refrigeration' && !data.refrigerationUnitId) {
    return false;
  }
  return true;
}, {
  message: 'Selecione um veículo ou equipamento de refrigeração',
  path: ['vehicleId'],
});

type RefuelingFormData = z.infer<typeof refuelingSchema>;

interface RefuelingFormProps {
  onSubmit: (data: Omit<Refueling, 'id'>) => void;
  onCancel: () => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  suppliers: Supplier[];
  refrigerationUnits: RefrigerationUnit[];
  initialData?: Refueling;
  onAddSupplier?: (supplier: Omit<Supplier, 'id'>) => void;
}

export function RefuelingForm({ onSubmit, onCancel, vehicles, drivers, suppliers, refrigerationUnits, initialData, onAddSupplier }: RefuelingFormProps) {
  const { toast } = useToast();
  const gasStations = suppliers.filter(s => s.type === 'gas_station' && s.active);
  const [paymentReceipt, setPaymentReceipt] = useState<string | undefined>(initialData?.paymentReceipt);
  const [fiscalNote, setFiscalNote] = useState<string | undefined>(initialData?.fiscalNote);
  const [openVehicle, setOpenVehicle] = useState(false);
  const [openRefrigeration, setOpenRefrigeration] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [openVehicleFilter, setOpenVehicleFilter] = useState(false);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('');
  const [openQuickSupplier, setOpenQuickSupplier] = useState(false);
  const [quickSupplierData, setQuickSupplierData] = useState({
    cnpj: '',
    fantasyName: '',
    city: '',
    state: '',
  });
  
  // Filtrar apenas veículos de tração
  const tractionVehicleTypes = ['Truck', 'Cavalo Mecânico', 'Toco', 'VUC', '3/4', 'Bitruck'];
  const tractionVehicles = vehicles.filter(v => 
    tractionVehicleTypes.includes(v.vehicleType) && 
    v.status !== 'sold'
  );
  
  // Filtrar equipamentos de refrigeração ativos com tipo de combustível
  const activeRefrigerationUnits = refrigerationUnits.filter(r => 
    r.status !== 'sold' && r.fuelType
  );

  // Veículos que possuem equipamentos de refrigeração vinculados
  const vehiclesWithRefrigeration = tractionVehicles.filter(v => 
    refrigerationUnits.some(r => r.vehicleId === v.id && r.status !== 'sold')
  );

  // Filtrar equipamentos de refrigeração baseado no veículo selecionado
  const filteredRefrigerationUnits = selectedVehicleFilter
    ? activeRefrigerationUnits.filter(r => r.vehicleId === selectedVehicleFilter)
    : activeRefrigerationUnits;
  
  const form = useForm<RefuelingFormData>({
    resolver: zodResolver(refuelingSchema),
    defaultValues: initialData ? {
      entityType: initialData.vehicleId ? 'vehicle' : 'refrigeration',
      vehicleId: initialData.vehicleId,
      refrigerationUnitId: initialData.refrigerationUnitId,
      date: new Date(initialData.date),
      km: initialData.km,
      usageHours: initialData.usageHours,
      liters: initialData.liters,
      pricePerLiter: initialData.pricePerLiter,
      fuelType: initialData.fuelType as any,
      supplierId: initialData.supplierId,
      driver: initialData.driver,
    } : {
      entityType: 'vehicle',
      date: new Date(),
      km: 0,
      usageHours: 0,
      liters: 0,
      pricePerLiter: 0,
      fuelType: 'Diesel S10',
    },
  });

  const watchLiters = form.watch('liters');
  const watchPricePerLiter = form.watch('pricePerLiter');
  const watchEntityType = form.watch('entityType');
  const watchVehicleId = form.watch('vehicleId');
  const watchRefrigerationUnitId = form.watch('refrigerationUnitId');
  const totalValue = watchLiters * watchPricePerLiter;

  // Buscar tipo de combustível do veículo ou equipamento selecionado
  const getEntityFuelType = () => {
    if (watchEntityType === 'vehicle' && watchVehicleId) {
      const vehicle = vehicles.find(v => v.id === watchVehicleId);
      return vehicle?.fuelType;
    } else if (watchEntityType === 'refrigeration' && watchRefrigerationUnitId) {
      const unit = refrigerationUnits.find(u => u.id === watchRefrigerationUnitId);
      return unit?.fuelType;
    }
    return null;
  };

  const entityFuelType = getEntityFuelType();

  // Buscar motorista vinculado ao veículo
  const getDriverInfo = () => {
    if (watchEntityType === 'vehicle' && watchVehicleId) {
      const vehicle = vehicles.find(v => v.id === watchVehicleId);
      if (vehicle?.driverId) {
        return drivers.find(d => d.id === vehicle.driverId);
      }
    } else if (watchEntityType === 'refrigeration' && watchRefrigerationUnitId) {
      const unit = refrigerationUnits.find(u => u.id === watchRefrigerationUnitId);
      if (unit?.vehicleId) {
        const vehicle = vehicles.find(v => v.id === unit.vehicleId);
        if (vehicle?.driverId) {
          return drivers.find(d => d.id === vehicle.driverId);
        }
      }
    }
    return null;
  };

  // Buscar veículo vinculado ao equipamento de refrigeração
  const getVehicleInfo = () => {
    if (watchEntityType === 'refrigeration' && watchRefrigerationUnitId) {
      const unit = refrigerationUnits.find(u => u.id === watchRefrigerationUnitId);
      if (unit?.vehicleId) {
        return vehicles.find(v => v.id === unit.vehicleId);
      }
    }
    return null;
  };

  const driverInfo = getDriverInfo();
  const vehicleInfo = getVehicleInfo();

  const handlePaymentReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFiscalNoteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiscalNote(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePaymentReceipt = () => {
    setPaymentReceipt(undefined);
  };

  const removeFiscalNote = () => {
    setFiscalNote(undefined);
  };

  const handleSubmit = (data: RefuelingFormData) => {
    if (data.entityType === 'vehicle') {
      const vehicle = vehicles.find(v => v.id === data.vehicleId);
      
      if (vehicle && data.km && data.km < vehicle.currentKm) {
        form.setError('km', { 
          message: `KM deve ser maior ou igual ao KM atual do veículo (${vehicle.currentKm.toLocaleString('pt-BR')})` 
        });
        return;
      }
    }

    const totalValue = data.liters * data.pricePerLiter;

    // Buscar nome do motorista automaticamente
    const driver = getDriverInfo();
    const driverName = driver?.name || '';

    onSubmit({
      vehicleId: data.vehicleId,
      refrigerationUnitId: data.refrigerationUnitId,
      date: format(data.date, 'yyyy-MM-dd'),
      km: data.km,
      usageHours: data.usageHours,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter,
      totalValue: totalValue,
      fuelType: data.fuelType,
      supplierId: data.supplierId,
      driver: driverName,
      paymentReceipt,
      fiscalNote,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Abastecimento *</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    field.onChange('vehicle');
                    form.setValue('refrigerationUnitId', undefined);
                    form.setValue('usageHours', undefined);
                  }}
                  className={`p-4 border-2 rounded-lg transition-all text-center ${
                    field.value === 'vehicle'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Truck className="h-8 w-8" />
                  </div>
                  <div className="font-semibold mb-1">Veículo</div>
                  <div className="text-xs text-muted-foreground">Caminhões e veículos de tração</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    field.onChange('refrigeration');
                    form.setValue('vehicleId', undefined);
                    form.setValue('km', undefined);
                  }}
                  className={`p-4 border-2 rounded-lg transition-all text-center ${
                    field.value === 'refrigeration'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Snowflake className="h-8 w-8" />
                  </div>
                  <div className="font-semibold mb-1">Equipamento de Refrigeração</div>
                  <div className="text-xs text-muted-foreground">Equipamentos de refrigeração da frota</div>
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          {watchEntityType === 'vehicle' && (
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Veículo *</FormLabel>
                  <Popover open={openVehicle} onOpenChange={setOpenVehicle}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? (() => {
                                const vehicle = tractionVehicles.find(v => v.id === field.value);
                                return vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Selecione o veículo";
                              })()
                            : "Selecione o veículo"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar veículo..." />
                        <CommandList>
                          <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                          <CommandGroup>
                            {tractionVehicles.map((vehicle) => (
                               <CommandItem
                                key={vehicle.id}
                                value={`${vehicle.plate} ${vehicle.model} ${vehicle.vehicleType} ${vehicle.ownerBranch}`}
                                onSelect={() => {
                                  form.setValue("vehicleId", vehicle.id);
                                  setOpenVehicle(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    vehicle.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col gap-1">
                                  <div className="font-semibold">
                                    {vehicle.plate} - {vehicle.model} ({vehicle.vehicleType})
                                  </div>
                                  <div className="text-xs text-foreground/70 flex items-center gap-2">
                                    <span>Proprietária: {vehicle.ownerBranch}</span>
                                    <span>•</span>
                                    <span className={vehicle.status === 'active' ? 'text-green-600' : vehicle.status === 'maintenance' ? 'text-yellow-600' : 'text-foreground/70'}>
                                      Status: {vehicle.status === 'active' ? 'Ativo' : vehicle.status === 'maintenance' ? 'Manutenção' : vehicle.status === 'inactive' ? 'Inativo' : 'Vendido'}
                                    </span>
                                    {vehicle.driverId && (() => {
                                      const driver = drivers.find(d => d.id === vehicle.driverId);
                                      return driver ? (
                                        <>
                                          <span>•</span>
                                          <span>Motorista: {driver.name}</span>
                                        </>
                                      ) : null;
                                    })()}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchEntityType === 'refrigeration' && (
            <>
              <FormItem className="flex flex-col">
                <FormLabel>Filtrar por Veículo</FormLabel>
                <Popover open={openVehicleFilter} onOpenChange={setOpenVehicleFilter}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !selectedVehicleFilter && "text-muted-foreground"
                      )}
                    >
                      {selectedVehicleFilter
                        ? (() => {
                            const vehicle = vehiclesWithRefrigeration.find(v => v.id === selectedVehicleFilter);
                            return vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Filtrar por veículo";
                          })()
                        : "Todos os equipamentos"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar veículo..." />
                      <CommandList>
                        <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="todos"
                            onSelect={() => {
                              setSelectedVehicleFilter('');
                              setOpenVehicleFilter(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !selectedVehicleFilter ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Todos os equipamentos
                          </CommandItem>
                          {vehiclesWithRefrigeration.map((vehicle) => (
                            <CommandItem
                              key={vehicle.id}
                              value={`${vehicle.plate} ${vehicle.model}`}
                              onSelect={() => {
                                setSelectedVehicleFilter(vehicle.id);
                                setOpenVehicleFilter(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  vehicle.id === selectedVehicleFilter ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold">
                                  {vehicle.plate} - {vehicle.model}
                                </div>
                                <div className="text-xs text-foreground/70">
                                  {vehicle.vehicleType}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>

              <FormField
                control={form.control}
                name="refrigerationUnitId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Equipamento de Refrigeração *</FormLabel>
                    <Popover open={openRefrigeration} onOpenChange={setOpenRefrigeration}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? (() => {
                                  const unit = filteredRefrigerationUnits.find(u => u.id === field.value);
                                  return unit ? `${unit.brand} ${unit.model} - SN: ${unit.serialNumber}` : "Selecione o equipamento";
                                })()
                              : "Selecione o equipamento"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar equipamento..." />
                          <CommandList>
                            <CommandEmpty>Nenhum equipamento encontrado.</CommandEmpty>
                            <CommandGroup>
                              {filteredRefrigerationUnits.map((unit) => (
                                <CommandItem
                                  key={unit.id}
                                  value={`${unit.brand} ${unit.model} ${unit.serialNumber}`}
                                  onSelect={() => {
                                    form.setValue("refrigerationUnitId", unit.id);
                                    setOpenRefrigeration(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      unit.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col gap-1">
                                    <div className="font-semibold">
                                      {unit.brand} {unit.model}
                                    </div>
                                    <div className="text-xs text-foreground/70">
                                      SN: {unit.serialNumber} | Combustível: {unit.fuelType}
                                      {unit.vehicleId && (() => {
                                        const vehicle = vehicles.find(v => v.id === unit.vehicleId);
                                        return vehicle ? ` | Veículo: ${vehicle.plate}` : '';
                                      })()}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchEntityType === 'vehicle' && (
            <FormField
              control={form.control}
              name="km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KM Atual *</FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      placeholder="Ex: 150.000"
                      {...field}
                      value={field.value ? formatInteger(field.value) : ''}
                      onChange={(e) => handleIntegerInput(e, field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchEntityType === 'refrigeration' && (
            <FormField
              control={form.control}
              name="usageHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horímetro - Atual *</FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      placeholder="Ex: 5.000"
                      {...field}
                      value={field.value ? formatInteger(field.value) : ''}
                      onChange={(e) => handleIntegerInput(e, field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Combustível *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Diesel S10">Diesel S10</SelectItem>
                    <SelectItem value="Diesel S500">Diesel S500</SelectItem>
                    <SelectItem value="Arla 32">Arla 32</SelectItem>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Etanol">Etanol</SelectItem>
                    <SelectItem value="GNV">GNV</SelectItem>
                    <SelectItem value="Biometano">Biometano</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Litros *</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    placeholder="Ex: 500,50"
                    {...field}
                    value={field.value ? formatDecimal(field.value) : ''}
                    onChange={(e) => handleDecimalInput(e, field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex items-center justify-between">
                  <FormLabel>Posto *</FormLabel>
                  {onAddSupplier && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setOpenQuickSupplier(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Novo Posto
                    </Button>
                  )}
                </div>
                <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? (() => {
                              const supplier = gasStations.find(s => s.id === field.value);
                              return supplier ? supplier.fantasyName : "Selecione o posto";
                            })()
                          : "Selecione o posto"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar posto..." />
                      <CommandList>
                        <CommandEmpty>Nenhum posto encontrado.</CommandEmpty>
                        <CommandGroup>
                          {gasStations.map((supplier) => (
                            <CommandItem
                              key={supplier.id}
                              value={`${supplier.fantasyName} ${supplier.cnpj} ${supplier.city} ${supplier.state}`}
                              onSelect={() => {
                                form.setValue("supplierId", supplier.id);
                                setOpenSupplier(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  supplier.id === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold">
                                  {supplier.fantasyName}
                                </div>
                                <div className="text-xs text-foreground/70">
                                  CNPJ: {supplier.cnpj} | {supplier.city}/{supplier.state}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricePerLiter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço por Litro (R$) *</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    placeholder="Ex: 6,50"
                    {...field}
                    value={field.value ? formatCurrency(field.value) : ''}
                    onChange={(e) => handleCurrencyInput(e, field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Informações do Tipo de Combustível */}
        {entityFuelType && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
              Tipo de Combustível do {watchEntityType === 'vehicle' ? 'Veículo' : 'Equipamento'}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">{entityFuelType}</p>
          </div>
        )}

        {/* Informações do Veículo (para equipamentos de refrigeração) */}
        {watchEntityType === 'refrigeration' && vehicleInfo && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Veículo Vinculado</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Placa:</span> {vehicleInfo.plate}
              </p>
              <p className="text-sm">
                <span className="font-medium">Modelo:</span> {vehicleInfo.model}
              </p>
              <p className="text-sm">
                <span className="font-medium">Tipo:</span> {vehicleInfo.vehicleType}
              </p>
            </div>
          </div>
        )}

        {/* Informações do Motorista */}
        {driverInfo && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Motorista Vinculado</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Nome:</span> {driverInfo.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">CPF:</span> {driverInfo.cpf}
              </p>
              <p className="text-sm">
                <span className="font-medium">CNH Categoria:</span> {driverInfo.cnhCategory}
              </p>
            </div>
          </div>
        )}

        {(watchVehicleId || watchRefrigerationUnitId) && !driverInfo && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              ⚠️ Nenhum motorista vinculado ao {watchEntityType === 'vehicle' ? 'veículo' : 'veículo do equipamento'}.
            </p>
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Valor Total</p>
          <p className="text-2xl font-bold">
            {totalValue.toLocaleString('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Comprovante de Pagamento</label>
            <div className="space-y-2">
              {paymentReceipt ? (
                <div className="relative">
                  {paymentReceipt.startsWith('data:image') ? (
                    <img
                      src={paymentReceipt}
                      alt="Comprovante"
                      className="w-full h-40 object-cover rounded-lg border border-border"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm">Comprovante anexado</span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removePaymentReceipt}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handlePaymentReceiptUpload}
                    className="hidden"
                    id="payment-receipt-upload"
                  />
                  <label htmlFor="payment-receipt-upload">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Anexar Comprovante
                      </span>
                    </Button>
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nota Fiscal / Cupom</label>
            <div className="space-y-2">
              {fiscalNote ? (
                <div className="relative">
                  {fiscalNote.startsWith('data:image') ? (
                    <img
                      src={fiscalNote}
                      alt="Nota Fiscal"
                      className="w-full h-40 object-cover rounded-lg border border-border"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm">Nota fiscal anexada</span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removeFiscalNote}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFiscalNoteUpload}
                    className="hidden"
                    id="fiscal-note-upload"
                  />
                  <label htmlFor="fiscal-note-upload">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Anexar Nota Fiscal
                      </span>
                    </Button>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline-destructive" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>

      {/* Dialog de Cadastro Rápido de Posto */}
      <Dialog open={openQuickSupplier} onOpenChange={setOpenQuickSupplier}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastro Rápido de Posto</DialogTitle>
            <DialogDescription>
              Preencha os dados básicos do posto para cadastrá-lo rapidamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">CNPJ *</label>
              <Input
                placeholder="00.000.000/0000-00"
                value={quickSupplierData.cnpj}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 14) {
                    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                    setQuickSupplierData({ ...quickSupplierData, cnpj: value });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Fantasia *</label>
              <Input
                placeholder="Ex: Posto Shell Centro"
                value={quickSupplierData.fantasyName}
                onChange={(e) => setQuickSupplierData({ ...quickSupplierData, fantasyName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade *</label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={quickSupplierData.city}
                  onChange={(e) => setQuickSupplierData({ ...quickSupplierData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">UF *</label>
                <Input
                  placeholder="Ex: SP"
                  maxLength={2}
                  value={quickSupplierData.state}
                  onChange={(e) => setQuickSupplierData({ ...quickSupplierData, state: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenQuickSupplier(false);
                  setQuickSupplierData({ cnpj: '', fantasyName: '', city: '', state: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  // Validação básica
                  if (!quickSupplierData.cnpj || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(quickSupplierData.cnpj)) {
                    toast({
                      title: 'CNPJ inválido',
                      description: 'Por favor, preencha um CNPJ válido',
                      variant: 'destructive',
                    });
                    return;
                  }
                  if (!quickSupplierData.fantasyName || quickSupplierData.fantasyName.length < 3) {
                    toast({
                      title: 'Nome fantasia inválido',
                      description: 'Nome fantasia deve ter no mínimo 3 caracteres',
                      variant: 'destructive',
                    });
                    return;
                  }
                  if (!quickSupplierData.city || quickSupplierData.city.length < 3) {
                    toast({
                      title: 'Cidade inválida',
                      description: 'Por favor, preencha a cidade',
                      variant: 'destructive',
                    });
                    return;
                  }
                  if (!quickSupplierData.state || quickSupplierData.state.length !== 2) {
                    toast({
                      title: 'UF inválida',
                      description: 'UF deve ter 2 caracteres',
                      variant: 'destructive',
                    });
                    return;
                  }

                  // Criar o fornecedor
                  if (onAddSupplier) {
                    onAddSupplier({
                      cnpj: quickSupplierData.cnpj,
                      name: quickSupplierData.fantasyName,
                      fantasyName: quickSupplierData.fantasyName,
                      type: 'gas_station',
                      city: quickSupplierData.city,
                      state: quickSupplierData.state,
                      branches: ['Matriz'],
                      active: true,
                    });
                    
                    toast({
                      title: 'Posto cadastrado',
                      description: 'Posto de combustível cadastrado com sucesso',
                    });

                    setOpenQuickSupplier(false);
                    setQuickSupplierData({ cnpj: '', fantasyName: '', city: '', state: '' });
                  }
                }}
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}