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
import { CalendarIcon, FileText, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Refueling, Vehicle, Driver, Supplier } from '@/hooks/useMockData';
import { useState } from 'react';

const refuelingSchema = z.object({
  vehicleId: z.string().min(1, 'Veículo é obrigatório'),
  date: z.date({
    required_error: 'Data é obrigatória',
  }),
  km: z.number().min(0, 'KM deve ser positivo'),
  liters: z.number().min(0.1, 'Litros deve ser maior que 0'),
  pricePerLiter: z.number().min(0.01, 'Preço por litro deve ser maior que 0'),
  fuelType: z.enum(['Diesel S10', 'Diesel S500', 'Arla 32', 'Gasolina', 'Etanol', 'GNV', 'Biometano']),
  supplierId: z.string().min(1, 'Posto é obrigatório'),
  driver: z.string().min(1, 'Motorista é obrigatório'),
});

type RefuelingFormData = z.infer<typeof refuelingSchema>;

interface RefuelingFormProps {
  onSubmit: (data: Omit<Refueling, 'id'>) => void;
  onCancel: () => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  suppliers: Supplier[];
  initialData?: Refueling;
}

export function RefuelingForm({ onSubmit, onCancel, vehicles, drivers, suppliers, initialData }: RefuelingFormProps) {
  const gasStations = suppliers.filter(s => s.type === 'gas_station' && s.active);
  const [paymentReceipt, setPaymentReceipt] = useState<string | undefined>(initialData?.paymentReceipt);
  const [fiscalNote, setFiscalNote] = useState<string | undefined>(initialData?.fiscalNote);
  
  // Filtrar apenas veículos de tração
  const tractionVehicleTypes = ['Truck', 'Cavalo Mecânico', 'Toco', 'VUC', '3/4', 'Bitruck'];
  const tractionVehicles = vehicles.filter(v => 
    tractionVehicleTypes.includes(v.vehicleType) && 
    v.status !== 'sold'
  );
  
  const form = useForm<RefuelingFormData>({
    resolver: zodResolver(refuelingSchema),
    defaultValues: initialData ? {
      vehicleId: initialData.vehicleId,
      date: new Date(initialData.date),
      km: initialData.km,
      liters: initialData.liters,
      pricePerLiter: initialData.pricePerLiter,
      fuelType: initialData.fuelType as any,
      supplierId: initialData.supplierId,
      driver: initialData.driver,
    } : {
      date: new Date(),
      km: 0,
      liters: 0,
      pricePerLiter: 0,
      fuelType: 'Diesel S10',
    },
  });

  const watchLiters = form.watch('liters');
  const watchPricePerLiter = form.watch('pricePerLiter');
  const totalValue = watchLiters * watchPricePerLiter;

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
    const vehicle = vehicles.find(v => v.id === data.vehicleId);
    
    if (vehicle && data.km < vehicle.currentKm) {
      form.setError('km', { 
        message: `KM deve ser maior ou igual ao KM atual do veículo (${vehicle.currentKm.toLocaleString('pt-BR')})` 
      });
      return;
    }

    const totalValue = data.liters * data.pricePerLiter;

    onSubmit({
      vehicleId: data.vehicleId,
      date: format(data.date, 'yyyy-MM-dd'),
      km: data.km,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter,
      totalValue: totalValue,
      fuelType: data.fuelType,
      supplierId: data.supplierId,
      driver: data.driver,
      paymentReceipt,
      fiscalNote,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veículo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tractionVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.model}
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
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posto *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o posto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gasStations.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.fantasyName} - {supplier.city}/{supplier.state}
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
            name="driver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motorista *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motorista" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.name}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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