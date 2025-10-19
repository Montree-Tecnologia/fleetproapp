import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, ChevronsUpDown, Check, Plus, Upload, FileText, X, Truck, Snowflake } from "lucide-react";
import { useMockData } from "@/hooks/useMockData";
import { useToast } from "@/hooks/use-toast";
import { formatDateForBackend } from "@/lib/dateUtils";

const formSchema = z.object({
  entityType: z.enum(['vehicle', 'refrigeration']),
  vehicleId: z.string().optional(),
  refrigerationUnitId: z.string().optional(),
  supplierId: z.string(),
  date: z.date(),
  fuelType: z.string(),
  liters: z.string(),
  pricePerLiter: z.string(),
  km: z.string().optional(),
  usageHours: z.string().optional(),
  paymentReceipt: z.string().optional(),
  fiscalNote: z.string().optional(),
}).refine((data) => {
  if (data.entityType === 'vehicle') {
    return !!data.vehicleId && !!data.km;
  }
  if (data.entityType === 'refrigeration') {
    return !!data.refrigerationUnitId && !!data.usageHours;
  }
  return false;
}, {
  message: "Preencha todos os campos obrigatórios para o tipo de entidade selecionado",
  path: ["entityType"]
});

interface RefuelingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVehicleId?: string;
  initialRefrigerationUnitId?: string;
  onSuccess?: () => void;
  onAddSupplier?: (supplier: any) => void;
}

export function RefuelingForm({ 
  open, 
  onOpenChange, 
  initialVehicleId, 
  initialRefrigerationUnitId,
  onSuccess,
  onAddSupplier 
}: RefuelingFormProps) {
  const { vehicles, suppliers, drivers, refrigerationUnits, addRefueling } = useMockData();
  const vehiclesList = vehicles();
  const suppliersList = suppliers();
  const driversList = drivers();
  const refrigerationUnitsList = refrigerationUnits();
  const { toast } = useToast();
  const [openVehicle, setOpenVehicle] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [openRefrigeration, setOpenRefrigeration] = useState(false);
  const [openVehicleFilter, setOpenVehicleFilter] = useState(false);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState<string | null>(null);
  const [fiscalNote, setFiscalNote] = useState<string | null>(null);

  const defaultValues = {
    entityType: initialRefrigerationUnitId ? 'refrigeration' as const : 'vehicle' as const,
    vehicleId: initialVehicleId || undefined,
    refrigerationUnitId: initialRefrigerationUnitId || undefined,
    supplierId: "",
    date: new Date(),
    fuelType: "",
    liters: "",
    pricePerLiter: "",
    km: undefined,
    usageHours: undefined,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const gasStations = suppliersList.filter(s => s.type === 'gas_station');

  // Filtrar veículos que possuem equipamento de refrigeração
  const vehiclesListWithRefrigeration = vehiclesList.filter(v => 
    refrigerationUnitsList.some(r => r.vehicleId === v.id)
  );

  // Filtrar equipamentos com base no veículo selecionado
  const filteredRefrigerationUnits = selectedVehicleFilter 
    ? refrigerationUnitsList.filter(r => r.vehicleId === selectedVehicleFilter)
    : refrigerationUnitsList;

  // Filtrar apenas veículos de tração (Truck ou Bitruck)
  const tractionVehicles = vehiclesList.filter(v => 
    v.vehicleType === 'Truck' || 
    v.vehicleType === 'Bitruck' || 
    v.vehicleType === 'Rodotrem'
  );

  const watchEntityType = form.watch("entityType");
  const watchLiters = form.watch("liters");
  const watchPricePerLiter = form.watch("pricePerLiter");

  const totalValue = (() => {
    const liters = parseFloat(watchLiters?.replace(',', '.') || '0');
    const price = parseFloat(watchPricePerLiter?.replace(',', '.') || '0');
    return liters * price;
  })();

  useEffect(() => {
    if (initialRefrigerationUnitId) {
      form.setValue('entityType', 'refrigeration');
      form.setValue('refrigerationUnitId', initialRefrigerationUnitId);
      
      // Buscar o veículo relacionado ao equipamento
      const unit = refrigerationUnitsList.find(r => r.id === initialRefrigerationUnitId);
      if (unit?.vehicleId) {
        setSelectedVehicleFilter(unit.vehicleId);
      }
    } else if (initialVehicleId) {
      form.setValue('entityType', 'vehicle');
      form.setValue('vehicleId', initialVehicleId);
    }
  }, [initialVehicleId, initialRefrigerationUnitId, form, refrigerationUnits]);

  const formatCurrency = (value: string | undefined): string => {
    if (!value) return '';
    
    const numericValue = value.replace(/\D/g, '');
    const floatValue = parseFloat(numericValue) / 100;
    
    if (isNaN(floatValue)) return '';
    
    return floatValue.toFixed(2).replace('.', ',');
  };

  const formatInteger = (value: string | undefined): string => {
    if (!value) return '';
    
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    return parseInt(numericValue).toLocaleString('pt-BR');
  };

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const formatted = formatCurrency(e.target.value);
    onChange(formatted);
  };

  const handleIntegerInput = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const formatted = formatInteger(e.target.value);
    onChange(formatted);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'payment' | 'fiscal') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'payment') {
          setPaymentReceipt(base64);
          form.setValue('paymentReceipt', base64);
        } else {
          setFiscalNote(base64);
          form.setValue('fiscalNote', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'payment');
  const handleFiscalNoteUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'fiscal');

  const removePaymentReceipt = () => {
    setPaymentReceipt(null);
    form.setValue('paymentReceipt', undefined);
  };

  const removeFiscalNote = () => {
    setFiscalNote(null);
    form.setValue('fiscalNote', undefined);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const liters = parseFloat(values.liters.replace(',', '.'));
      const pricePerLiter = parseFloat(values.pricePerLiter.replace(',', '.'));
      const km = values.km ? parseInt(values.km.replace(/\D/g, '')) : undefined;
      const usageHours = values.usageHours ? parseInt(values.usageHours.replace(/\D/g, '')) : undefined;

      const refuelingData: any = {
        id: `ref-${Date.now()}`,
        supplierId: values.supplierId,
        date: formatDateForBackend(values.date),
        fuelType: values.fuelType,
        liters,
        pricePerLiter,
        totalValue: liters * pricePerLiter,
        paymentReceipt: values.paymentReceipt,
        fiscalNote: values.fiscalNote,
        companyId: "1",
        createdAt: new Date().toISOString(),
        createdBy: "user123"
      };

      if (values.entityType === 'vehicle') {
        refuelingData.entityType = 'vehicle';
        refuelingData.vehicleId = values.vehicleId;
        refuelingData.km = km;
        
        const vehicle = vehiclesList.find(v => v.id === values.vehicleId);
        if (vehicle?.driverId) {
          refuelingData.driverId = vehicle.driverId;
        }
      } else {
        refuelingData.entityType = 'refrigeration';
        refuelingData.refrigerationUnitId = values.refrigerationUnitId;
        refuelingData.usageHours = usageHours;
        
        const unit = refrigerationUnitsList.find(r => r.id === values.refrigerationUnitId);
        if (unit?.vehicleId) {
          const vehicle = vehiclesList.find(v => v.id === unit.vehicleId);
          if (vehicle?.driverId) {
            refuelingData.driverId = vehicle.driverId;
          }
        }
      }

      addRefueling(refuelingData);

      toast({
        title: "Abastecimento registrado",
        description: `Abastecimento de ${liters}L registrado com sucesso.`,
      });

      form.reset(defaultValues);
      setPaymentReceipt(null);
      setFiscalNote(null);
      setSelectedVehicleFilter('');
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar abastecimento",
        description: "Ocorreu um erro ao registrar o abastecimento. Tente novamente.",
      });
    }
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Abastecimento</DialogTitle>
            <DialogDescription>
              Preencha os dados do abastecimento realizado
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              {/* Grid responsivo principal para todos os campos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campos específicos por tipo de entidade */}
                {watchEntityType === 'vehicle' && (
                  <>
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col col-span-1 sm:col-span-2">
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
                                              const driver = driversList.find(d => d.id === vehicle.driverId);
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
                  </>
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
                                  const vehicle = vehiclesListWithRefrigeration.find(v => v.id === selectedVehicleFilter);
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
                                {vehiclesListWithRefrigeration.map((vehicle) => (
                                  <CommandItem
                                    key={vehicle.id}
                                    value={`${vehicle.plate} ${vehicle.model} ${vehicle.vehicleType} ${vehicle.ownerBranch}`}
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
                                        {vehicle.plate} - {vehicle.model} ({vehicle.vehicleType})
                                      </div>
                                      <div className="text-xs text-foreground/70 flex items-center gap-2">
                                        <span>Proprietária: {vehicle.ownerBranch}</span>
                                        <span>•</span>
                                        <span className={vehicle.status === 'active' ? 'text-green-600' : vehicle.status === 'maintenance' ? 'text-yellow-600' : 'text-foreground/70'}>
                                          Status: {vehicle.status === 'active' ? 'Ativo' : vehicle.status === 'maintenance' ? 'Manutenção' : vehicle.status === 'inactive' ? 'Inativo' : 'Vendido'}
                                        </span>
                                        {(() => {
                                          const driver = driversList.find(d => d.id === vehicle.driverId);
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
                                              const vehicle = vehiclesList.find(v => v.id === unit.vehicleId);
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
                  </>
                )}

                {/* Campos comuns para ambos os tipos */}
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
                          placeholder="Ex: 330,50"
                          {...field}
                          value={field.value ? formatCurrency(field.value) : ''}
                          onChange={(e) => handleCurrencyInput(e, field.onChange)}
                          inputMode="decimal"
                        />
                      </FormControl>
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
                            disabled
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
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Valor Total</p>
                <p className="text-2xl font-bold">
                  {totalValue.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Registrar Abastecimento</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}