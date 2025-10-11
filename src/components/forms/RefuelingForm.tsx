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
import { CalendarIcon, FileText, Upload, X, Check, ChevronsUpDown, Truck, Snowflake } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
}

export function RefuelingForm({ onSubmit, onCancel, vehicles, drivers, suppliers, refrigerationUnits, initialData }: RefuelingFormProps) {
  const gasStations = suppliers.filter(s => s.type === 'gas_station' && s.active);
  const [paymentReceipt, setPaymentReceipt] = useState<string | undefined>(initialData?.paymentReceipt);
  const [fiscalNote, setFiscalNote] = useState<string | undefined>(initialData?.fiscalNote);
  const [openVehicle, setOpenVehicle] = useState(false);
  const [openRefrigeration, setOpenRefrigeration] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  
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
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>Proprietária: {vehicle.ownerBranch}</span>
                                    <span>•</span>
                                    <span className={vehicle.status === 'active' ? 'text-green-600' : vehicle.status === 'maintenance' ? 'text-yellow-600' : 'text-muted-foreground'}>
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
                                const unit = activeRefrigerationUnits.find(u => u.id === field.value);
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
                            {activeRefrigerationUnits.map((unit) => (
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
                                  <div className="text-xs text-muted-foreground">
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
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    type="number" 
                    step="0.01"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                <FormLabel>Posto *</FormLabel>
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
                    type="number" 
                    step="0.01"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}