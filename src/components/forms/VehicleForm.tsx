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
  fuelType: z.enum(['Diesel S10', 'Diesel S500', 'Arla 32', 'Arla 42', 'Etanol', 'Gasolina']),
  axles: z.number().min(1).max(20),
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
  const [compositionAxles, setCompositionAxles] = useState<number[]>(
    initialData?.compositionAxles || []
  );
  const [newCompositionPlate, setNewCompositionPlate] = useState('');
  const [newCompositionAxles, setNewCompositionAxles] = useState<number>(2);
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
      axles: initialData.axles,
      purchaseDate: new Date(initialData.purchaseDate),
      purchaseValue: initialData.purchaseValue,
    } : {
      year: new Date().getFullYear(),
      currentKm: 0,
      axles: 2,
      purchaseValue: 0,
      status: 'active',
      vehicleType: 'Truck',
      fuelType: 'Diesel S10',
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
      axles: data.axles,
      branches: selectedBranches,
      hasComposition: compositionPlates.length > 0,
      compositionPlates: compositionPlates.length > 0 ? compositionPlates : undefined,
      compositionAxles: compositionAxles.length > 0 ? compositionAxles : undefined,
      driverId: selectedDriver,
      purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd'),
      purchaseValue: data.purchaseValue,
    });
  };

  const addCompositionPlate = () => {
    if (newCompositionPlate.trim() && !compositionPlates.includes(newCompositionPlate.trim())) {
      setCompositionPlates([...compositionPlates, newCompositionPlate.trim()]);
      setCompositionAxles([...compositionAxles, newCompositionAxles]);
      setNewCompositionPlate('');
      setNewCompositionAxles(2);
    }
  };

  const removeCompositionPlate = (index: number) => {
    setCompositionPlates(compositionPlates.filter((_, i) => i !== index));
    setCompositionAxles(compositionAxles.filter((_, i) => i !== index));
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
                    <SelectItem value="Diesel S10">Diesel S10</SelectItem>
                    <SelectItem value="Diesel S500">Diesel S500</SelectItem>
                    <SelectItem value="Arla 32">Arla 32</SelectItem>
                    <SelectItem value="Arla 42">Arla 42</SelectItem>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Etanol">Etanol</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="axles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade de Eixos *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    max="20"
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
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
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Eixos"
              min="1"
              max="10"
              value={newCompositionAxles}
              onChange={(e) => setNewCompositionAxles(parseInt(e.target.value) || 2)}
              className="w-24"
            />
            <Button 
              type="button" 
              onClick={addCompositionPlate} 
              size="icon"
              disabled={!newCompositionPlate.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {compositionPlates.length > 0 && (
            <div className="space-y-2 mt-3">
              {compositionPlates.map((plate, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{plate}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {compositionAxles[index]} {compositionAxles[index] === 1 ? 'eixo' : 'eixos'}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCompositionPlate(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium">
                  Total de Eixos: {form.watch('axles') + compositionAxles.reduce((sum, axles) => sum + axles, 0)}
                </p>
              </div>
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