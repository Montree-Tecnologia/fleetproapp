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
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Vehicle } from '@/hooks/useMockData';
import { Badge } from '@/components/ui/badge';

const vehicleSchema = z.object({
  plate: z.string().min(7, 'Placa inválida').max(8, 'Placa inválida'),
  chassis: z.string().min(17, 'Chassis deve ter 17 caracteres').max(17),
  renavam: z.string().min(11, 'RENAVAM deve ter 11 dígitos').max(11),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Cor é obrigatória'),
  vehicleType: z.enum(['Truck', 'Baú', 'Carreta', 'Graneleiro', 'Bitrem', 'Tritem', 'Container', 'Caçamba']),
  status: z.enum(['active', 'maintenance', 'inactive']),
  currentKm: z.number().min(0),
  fuelType: z.enum(['diesel', 'gasoline', 'ethanol']),
  purchaseDate: z.date(),
  purchaseValue: z.number().min(0),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  onSubmit: (data: Omit<Vehicle, 'id'>) => void;
  onCancel: () => void;
  initialData?: Vehicle;
}

export function VehicleForm({ onSubmit, onCancel, initialData }: VehicleFormProps) {
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    initialData?.branches || ['Matriz']
  );
  const [compositionPlates, setCompositionPlates] = useState<string[]>(
    initialData?.compositionPlates || []
  );
  const [newCompositionPlate, setNewCompositionPlate] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string | undefined>(initialData?.driverId);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData ? {
      plate: initialData.plate,
      chassis: initialData.chassis,
      renavam: initialData.renavam,
      brand: initialData.brand,
      model: initialData.model,
      year: initialData.year,
      color: initialData.color,
      vehicleType: initialData.vehicleType,
      status: initialData.status,
      currentKm: initialData.currentKm,
      fuelType: initialData.fuelType,
      purchaseDate: new Date(initialData.purchaseDate),
      purchaseValue: initialData.purchaseValue,
    } : {
      year: new Date().getFullYear(),
      currentKm: 0,
      purchaseValue: 0,
      status: 'active',
      vehicleType: 'Truck',
      fuelType: 'diesel',
      purchaseDate: new Date(),
    },
  });

  const handleSubmit = (data: VehicleFormData) => {
    onSubmit({
      plate: data.plate,
      chassis: data.chassis,
      renavam: data.renavam,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
      vehicleType: data.vehicleType,
      status: data.status,
      currentKm: data.currentKm,
      fuelType: data.fuelType,
      branches: selectedBranches,
      hasComposition: compositionPlates.length > 0,
      compositionPlates: compositionPlates.length > 0 ? compositionPlates : undefined,
      driverId: selectedDriver,
      purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd'),
      purchaseValue: data.purchaseValue,
    });
  };

  const addCompositionPlate = () => {
    if (newCompositionPlate.trim() && !compositionPlates.includes(newCompositionPlate.trim())) {
      setCompositionPlates([...compositionPlates, newCompositionPlate.trim()]);
      setNewCompositionPlate('');
    }
  };

  const removeCompositionPlate = (plate: string) => {
    setCompositionPlates(compositionPlates.filter(p => p !== plate));
  };

  const toggleBranch = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      if (selectedBranches.length > 1) {
        setSelectedBranches(selectedBranches.filter(b => b !== branch));
      }
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const availableBranches = ['Matriz', 'Filial SP', 'Filial RJ', 'Filial MG'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa *</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Veículo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Baú">Baú</SelectItem>
                    <SelectItem value="Carreta">Carreta</SelectItem>
                    <SelectItem value="Graneleiro">Graneleiro</SelectItem>
                    <SelectItem value="Bitrem">Bitrem</SelectItem>
                    <SelectItem value="Tritem">Tritem</SelectItem>
                    <SelectItem value="Container">Container</SelectItem>
                    <SelectItem value="Caçamba">Caçamba</SelectItem>
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
                  <Input placeholder="Volvo" {...field} />
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
                  <Input placeholder="FH 540" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor *</FormLabel>
                <FormControl>
                  <Input placeholder="Branco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chassis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chassis *</FormLabel>
                <FormControl>
                  <Input placeholder="9BWZZZ377VT004251" maxLength={17} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="renavam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RENAVAM *</FormLabel>
                <FormControl>
                  <Input placeholder="00123456789" maxLength={11} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KM Atual *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasoline">Gasolina</SelectItem>
                    <SelectItem value="ethanol">Etanol</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Compra *</FormLabel>
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
            name="purchaseValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor de Compra *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Filiais Vinculadas *</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableBranches.map((branch) => (
              <Badge
                key={branch}
                variant={selectedBranches.includes(branch) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleBranch(branch)}
              >
                {branch}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <FormLabel>Composições Acopladas</FormLabel>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Placa da composição"
              value={newCompositionPlate}
              onChange={(e) => setNewCompositionPlate(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompositionPlate())}
            />
            <Button type="button" onClick={addCompositionPlate} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {compositionPlates.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {compositionPlates.map((plate) => (
                <Badge key={plate} variant="secondary" className="gap-1">
                  {plate}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeCompositionPlate(plate)}
                  />
                </Badge>
              ))}
            </div>
          )}
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