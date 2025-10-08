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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { RefrigerationUnit, Vehicle } from '@/hooks/useMockData';

const refrigerationSchema = z.object({
  vehicleId: z.string().min(1, 'Veículo é obrigatório'),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  serialNumber: z.string().min(1, 'Número de série é obrigatório'),
  type: z.enum(['freezer', 'cooled', 'climatized']),
  minTemp: z.number().min(-50, 'Temperatura mínima inválida').max(50, 'Temperatura mínima inválida'),
  maxTemp: z.number().min(-50, 'Temperatura máxima inválida').max(50, 'Temperatura máxima inválida'),
  installDate: z.date({
    required_error: 'Data de instalação é obrigatória',
  }),
}).refine((data) => data.maxTemp > data.minTemp, {
  message: 'Temperatura máxima deve ser maior que a mínima',
  path: ['maxTemp'],
});

type RefrigerationFormData = z.infer<typeof refrigerationSchema>;

interface RefrigerationFormProps {
  onSubmit: (data: Omit<RefrigerationUnit, 'id'>) => void;
  onCancel: () => void;
  vehicles: Vehicle[];
  initialData?: RefrigerationUnit;
}

export function RefrigerationForm({ onSubmit, onCancel, vehicles, initialData }: RefrigerationFormProps) {
  const form = useForm<RefrigerationFormData>({
    resolver: zodResolver(refrigerationSchema),
    defaultValues: initialData ? {
      vehicleId: initialData.vehicleId,
      brand: initialData.brand,
      model: initialData.model,
      serialNumber: initialData.serialNumber,
      type: initialData.type,
      minTemp: initialData.minTemp,
      maxTemp: initialData.maxTemp,
      installDate: new Date(initialData.installDate),
    } : {
      type: 'freezer',
      minTemp: -18,
      maxTemp: -15,
      installDate: new Date(),
    },
  });

  const handleSubmit = (data: RefrigerationFormData) => {
    onSubmit({
      vehicleId: data.vehicleId,
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber,
      type: data.type,
      minTemp: data.minTemp,
      maxTemp: data.maxTemp,
      installDate: format(data.installDate, 'yyyy-MM-dd'),
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
                    {vehicles.map((vehicle) => (
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