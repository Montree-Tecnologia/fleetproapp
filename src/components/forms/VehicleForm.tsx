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
import { CalendarIcon, Plus, X, Upload, Image as ImageIcon, FileText } from 'lucide-react';
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
  const [newCompositionAxles, setNewCompositionAxles] = useState<number | ''>('');
  const [selectedDriver, setSelectedDriver] = useState<string | undefined>(initialData?.driverId);
  const [vehicleImages, setVehicleImages] = useState<string[]>(initialData?.images || []);
  const [crlvDocument, setCrlvDocument] = useState<string | undefined>(initialData?.crlvDocument);


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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVehicleImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setVehicleImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCRLVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCrlvDocument(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCRLVDocument = () => {
    setCrlvDocument(undefined);
  };


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
      images: vehicleImages.length > 0 ? vehicleImages : undefined,
      crlvDocument: crlvDocument,
    });
  };

  const addCompositionPlate = () => {
    if (newCompositionPlate.trim() && !compositionPlates.includes(newCompositionPlate.trim())) {
      const axles = newCompositionAxles === '' ? 2 : newCompositionAxles;
      setCompositionPlates([...compositionPlates, newCompositionPlate.trim()]);
      setCompositionAxles([...compositionAxles, axles]);
      setNewCompositionPlate('');
      setNewCompositionAxles('');
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
              <FormItem>
                <FormLabel>Data de Compra *</FormLabel>
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
              placeholder="Quantidade de Eixos"
              min="1"
              max="10"
              value={newCompositionAxles}
              onChange={(e) => setNewCompositionAxles(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-48"
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

        <div>
          <FormLabel>Imagens do Veículo</FormLabel>
          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="vehicle-images"
              />
              <label htmlFor="vehicle-images">
                <Button type="button" variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Imagens
                  </span>
                </Button>
              </label>
              {vehicleImages.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {vehicleImages.length} {vehicleImages.length === 1 ? 'imagem' : 'imagens'}
                </span>
              )}
            </div>
            
            {vehicleImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {vehicleImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Veículo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <FormLabel>Documento CRLV</FormLabel>
          <div className="mt-2 space-y-2">
            {crlvDocument ? (
              <div className="relative">
                {crlvDocument.startsWith('data:image') ? (
                  <img
                    src={crlvDocument}
                    alt="CRLV"
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Documento CRLV anexado</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeCRLVDocument}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleCRLVUpload}
                  className="hidden"
                  id="crlv-upload"
                />
                <label htmlFor="crlv-upload">
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Anexar CRLV
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