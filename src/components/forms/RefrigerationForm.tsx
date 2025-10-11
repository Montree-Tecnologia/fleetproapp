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
import { CalendarIcon, Upload, X, FileText, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { RefrigerationUnit, Vehicle, Supplier, Company } from '@/hooks/useMockData';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const refrigerationSchema = z.object({
  vehicleId: z.string().optional(),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  serialNumber: z.string().min(1, 'Número de série é obrigatório'),
  type: z.enum(['freezer', 'cooled', 'climatized']),
  minTemp: z.number().min(-50, 'Temperatura mínima inválida').max(50, 'Temperatura mínima inválida'),
  maxTemp: z.number().min(-50, 'Temperatura máxima inválida').max(50, 'Temperatura máxima inválida'),
  status: z.enum(['active', 'defective', 'maintenance', 'sold']),
  installDate: z.date({
    required_error: 'Data de instalação é obrigatória',
  }),
  purchaseDate: z.date().optional(),
  purchaseValue: z.number().min(0).optional(),
  supplierId: z.string().optional(),
  initialUsageHours: z.number().min(0, 'Horas de uso não podem ser negativas').max(999999, 'Valor muito alto').optional(),
  fuelType: z.string().optional(),
}).refine((data) => data.maxTemp > data.minTemp, {
  message: 'Temperatura máxima deve ser maior que a mínima',
  path: ['maxTemp'],
}).refine((data) => {
  // Se vinculado a veículo, status só pode ser active ou defective
  if (data.vehicleId && data.status !== 'active' && data.status !== 'defective') {
    return false;
  }
  return true;
}, {
  message: 'Equipamentos vinculados só podem estar ativos ou com defeito',
  path: ['status'],
});

type RefrigerationFormData = z.infer<typeof refrigerationSchema>;

interface RefrigerationFormProps {
  onSubmit: (data: Omit<RefrigerationUnit, 'id'>) => void;
  onCancel: () => void;
  vehicles: Vehicle[];
  suppliers: Supplier[];
  companies: Company[];
  initialData?: RefrigerationUnit;
}

export function RefrigerationForm({ onSubmit, onCancel, vehicles, suppliers, companies, initialData }: RefrigerationFormProps) {
  const [purchaseInvoice, setPurchaseInvoice] = useState<string | undefined>(initialData?.purchaseInvoice);
  const [openSupplier, setOpenSupplier] = useState(false);
  const [openVehicle, setOpenVehicle] = useState(false);
  
  // Filtrar apenas fornecedores ativos dos tipos refrigeration_equipment e other
  const activeSuppliers = suppliers.filter(s => s.active && (s.type === 'refrigeration_equipment' || s.type === 'other'));

  const form = useForm<RefrigerationFormData>({
    resolver: zodResolver(refrigerationSchema),
    defaultValues: initialData ? {
      vehicleId: initialData.vehicleId,
      companyId: initialData.companyId,
      brand: initialData.brand,
      model: initialData.model,
      serialNumber: initialData.serialNumber,
      type: initialData.type,
      minTemp: initialData.minTemp,
      maxTemp: initialData.maxTemp,
      status: initialData.status,
      installDate: new Date(initialData.installDate),
      purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate) : undefined,
      purchaseValue: initialData.purchaseValue,
      supplierId: initialData.supplierId,
      initialUsageHours: initialData.initialUsageHours,
      fuelType: initialData.fuelType,
    } : {
      companyId: '',
      type: 'freezer',
      minTemp: -18,
      maxTemp: -15,
      status: 'maintenance',
      installDate: new Date(),
      initialUsageHours: 0,
    },
  });

  const handlePurchaseInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPurchaseInvoice(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePurchaseInvoice = () => {
    setPurchaseInvoice(undefined);
  };

  const handleSubmit = (data: RefrigerationFormData) => {
    onSubmit({
      vehicleId: data.vehicleId,
      companyId: data.companyId,
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber,
      type: data.type,
      minTemp: data.minTemp,
      maxTemp: data.maxTemp,
      status: data.status,
      installDate: format(data.installDate, 'yyyy-MM-dd'),
      purchaseDate: data.purchaseDate ? format(data.purchaseDate, 'yyyy-MM-dd') : undefined,
      purchaseValue: data.purchaseValue,
      supplierId: data.supplierId,
      purchaseInvoice: purchaseInvoice,
      initialUsageHours: data.initialUsageHours,
      fuelType: data.fuelType,
    });
  };

  const hasVehicle = form.watch('vehicleId');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} - {company.cnpj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Veículo</FormLabel>
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
                        {field.value && field.value !== 'none'
                          ? (() => {
                              const vehicle = vehicles.find(v => v.id === field.value);
                              return vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Sem vínculo";
                            })()
                          : "Sem vínculo"}
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
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              form.setValue("vehicleId", undefined);
                              setOpenVehicle(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !field.value || field.value === 'none' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Sem vínculo
                          </CommandItem>
                          {vehicles.map((vehicle) => (
                            <CommandItem
                              key={vehicle.id}
                              value={`${vehicle.plate} ${vehicle.model} ${vehicle.brand} ${vehicle.vehicleType}`}
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
                                  {vehicle.plate} - {vehicle.model}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {vehicle.brand} | {vehicle.vehicleType}
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="freezer">Freezer</SelectItem>
                    <SelectItem value="cooled">Resfriado</SelectItem>
                    <SelectItem value="climatized">Climatizado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="defective">Defeito</SelectItem>
                    {!hasVehicle && (
                      <>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="sold">Vendido</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca *</FormLabel>
                <FormControl>
                  <Input placeholder="Carrier" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo *</FormLabel>
                <FormControl>
                  <Input placeholder="Xarios 600" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Série *</FormLabel>
                <FormControl>
                  <Input placeholder="SN123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="installDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Instalação *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
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
            name="minTemp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperatura Mínima (°C) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxTemp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperatura Máxima (°C) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Compra</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
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
            name="purchaseValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor de Compra (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="initialUsageHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horímetro - Compra</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1"
                    min="0"
                    placeholder="0"
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Tipo de Combustível</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de combustível" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Diesel S10">Diesel S10</SelectItem>
                    <SelectItem value="Diesel S500">Diesel S500</SelectItem>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Fornecedor de Compra</FormLabel>
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
                        {field.value && field.value !== 'none'
                          ? (() => {
                              const supplier = activeSuppliers.find(s => s.id === field.value);
                              return supplier ? supplier.fantasyName : "Selecione o fornecedor";
                            })()
                          : "Selecione o fornecedor"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar fornecedor..." />
                      <CommandList>
                        <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              form.setValue("supplierId", undefined);
                              setOpenSupplier(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !field.value || field.value === 'none' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Nenhum
                          </CommandItem>
                          {activeSuppliers.map((supplier) => (
                            <CommandItem
                              key={supplier.id}
                              value={`${supplier.fantasyName} ${supplier.cnpj || supplier.cpf} ${supplier.city} ${supplier.state}`}
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
                                  {supplier.fantasyName || supplier.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {supplier.cnpj ? `CNPJ: ${supplier.cnpj}` : `CPF: ${supplier.cpf}`} | {supplier.city}/{supplier.state}
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

        <div>
          <FormLabel>Nota Fiscal de Compra</FormLabel>
          <div className="mt-2 space-y-2">
            {purchaseInvoice ? (
              <div className="relative">
                {purchaseInvoice.startsWith('data:image') ? (
                  <img
                    src={purchaseInvoice}
                    alt="Nota Fiscal"
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Nota Fiscal de Compra anexada</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removePurchaseInvoice}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handlePurchaseInvoiceUpload}
                  className="hidden"
                  id="purchase-invoice-upload"
                />
                <label htmlFor="purchase-invoice-upload">
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Anexar Nota Fiscal de Compra
                    </span>
                  </Button>
                </label>
              </>
            )}
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