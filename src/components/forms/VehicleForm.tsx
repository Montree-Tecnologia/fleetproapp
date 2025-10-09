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
import { useState, useMemo, useEffect } from 'react';
import { Vehicle } from '@/hooks/useMockData';
import { Badge } from '@/components/ui/badge';

// Mapeamento de marcas para modelos de veículos de tração
const TRACTION_BRAND_MODELS: Record<string, string[]> = {
  'Agrale': [
    '8500 TCA', '8500 TDX', '9200 TCA', '13000 TCA', '14000 TCA', '16000',
    '6000 TCA', '7500 TCA', '8500 TCLE', '9200 TCLE', '10000 TCA',
    'Marruá AM 100', 'Marruá AM 150', 'Marruá AM 200', 'Marruá AM 300'
  ],
  'DAF': [
    'XF 105.460', 'XF 105.510', 'XF 105.530', 'XF 530', 'XF 480',
    'CF 85.410', 'CF 85.430', 'CF 85.460', 'CF 85.480', 'CF 85.510',
    'LF 45.180', 'LF 45.220', 'LF 55.180', 'LF 55.220', 'LF 55.250',
    'XF 440', 'XF 510', 'XF 450 FT', 'XF 530 FT'
  ],
  'Ford': [
    'Cargo 815', 'Cargo 816', 'Cargo 915', 'Cargo 1119', 'Cargo 1215',
    'Cargo 1317', 'Cargo 1319', 'Cargo 1517', 'Cargo 1519', 'Cargo 1717',
    'Cargo 1719', 'Cargo 1722', 'Cargo 1729', 'Cargo 2422', 'Cargo 2428',
    'Cargo 2429', 'Cargo 2622', 'Cargo 2629', 'Cargo 2631', 'Cargo 2932',
    'Cargo 3222', 'Cargo 3229', 'Cargo 3328', 'Cargo 3329', 'Cargo 4030',
    'Cargo 4331', 'Cargo 4432', 'Cargo 4532'
  ],
  'International': [
    '4300', '4400', '7400', '9200', '9400', '9800', '9900',
    'ProStar', 'LoneStar', 'PayStar', 'WorkStar', 'TranStar',
    'DuraStar', 'TerraStar'
  ],
  'Iveco': [
    'Stralis 380', 'Stralis 410', 'Stralis 440', 'Stralis 460', 'Stralis 490',
    'Stralis 570', 'Stralis 600', 'Stralis 740', 'Stralis Hi-Way 440',
    'Stralis Hi-Way 480', 'Stralis Hi-Way 560', 'Stralis Hi-Way 600',
    'Tector 150', 'Tector 170', 'Tector 240', 'Tector 260',
    'Daily 35S14', 'Daily 35S17', 'Daily 45S17', 'Daily 55C16', 'Daily 55C17',
    'Daily 70C16', 'Daily 70C17', 'Vertis 90V16', 'Vertis 90V18',
    'Cursor 330', 'Cursor 400', 'Cursor 450'
  ],
  'MAN': [
    'TGX 29.440', 'TGX 29.480', 'TGX 28.440', 'TGX 28.480',
    'TGS 24.440', 'TGS 26.440', 'TGS 28.440', 'TGS 29.440',
    'TGL 8.150', 'TGL 8.180', 'TGL 10.180', 'TGL 12.220',
    'TGM 13.250', 'TGM 15.250', 'TGM 18.280', 'TGM 23.250',
    'TGA 18.350', 'TGA 26.350', 'TGA 28.350'
  ],
  'Mercedes-Benz': [
    'Actros 2546', 'Actros 2651', 'Actros 2655', 'Actros 3344', 'Actros 4144',
    'Atego 1016', 'Atego 1316', 'Atego 1418', 'Atego 1419', 'Atego 1518',
    'Atego 1719', 'Atego 1726', 'Atego 1729', 'Atego 2426', 'Atego 2429',
    'Atego 2730', 'Atego 2729', 'Atego 3030',
    'Axor 1933', 'Axor 2036', 'Axor 2041', 'Axor 2044', 'Axor 2533',
    'Axor 2536', 'Axor 2540', 'Axor 2544', 'Axor 2644', 'Axor 3131', 'Axor 3344',
    'Accelo 715', 'Accelo 815', 'Accelo 915', 'Accelo 1016', 'Accelo 1316',
    'L 1113', 'L 1313', 'L 1513', 'L 1518', 'L 1519', 'L 1620', 'L 1621',
    'L 1938', 'L 2013', 'L 2318', 'LS 1632', 'LS 1634', 'LS 1938'
  ],
  'Mitsubishi': [
    'L200 Triton Sport', 'L200 Triton Savana', 'L200 Triton HPE',
    'Fuso Canter 815', 'Fuso Canter 915', 'Fuso Canter 3.5',
    'Fuso Fighter FK', 'Fuso Fighter FM', 'Fuso Fighter FN',
    'Pajero Full', 'Pajero Sport', 'Pajero TR4'
  ],
  'Peugeot': [
    'Boxer 2.3 Furgão', 'Boxer 2.3 Chassi', 'Boxer 2.3 Minibus',
    'Boxer 2.8 Furgão', 'Boxer 2.8 Chassi', 'Boxer 2.8 Minibus',
    'Boxer 2.0 HDI', 'Boxer 2.2 HDI'
  ],
  'Renault': [
    'Master 2.3', 'Master 2.5', 'Master L1H1', 'Master L2H2', 'Master L3H2',
    'T 380', 'T 430', 'T 460', 'T 480', 'T 520',
    'C 380', 'C 430', 'C 460', 'C 480',
    'K 380', 'K 430', 'K 460', 'K 520',
    'D 310', 'D 340', 'D 380'
  ],
  'Scania': [
    'R 440', 'R 450', 'R 480', 'R 500', 'R 540', 'R 560', 'R 620', 'R 730',
    'G 340', 'G 360', 'G 380', 'G 400', 'G 420', 'G 440', 'G 480',
    'P 250', 'P 280', 'P 310', 'P 340', 'P 360', 'P 380', 'P 410',
    'S 500', 'S 520', 'S 540', 'S 580', 'S 650', 'S 730',
    'XT 440', 'XT 540'
  ],
  'Volvo': [
    'FH 440', 'FH 460', 'FH 480', 'FH 500', 'FH 520', 'FH 540', 'FH 580', 'FH 660',
    'FH16 600', 'FH16 660', 'FH16 700', 'FH16 750',
    'FM 330', 'FM 370', 'FM 380', 'FM 400', 'FM 420', 'FM 440', 'FM 460', 'FM 480',
    'FMX 370', 'FMX 420', 'FMX 440', 'FMX 460', 'FMX 500', 'FMX 540',
    'VM 210', 'VM 220', 'VM 260', 'VM 270', 'VM 310', 'VM 330',
    'VNL 430', 'VNL 630', 'VNL 670', 'VNL 780', 'VNL 860'
  ],
  'Volkswagen': [
    'Constellation 13.180', 'Constellation 15.180', 'Constellation 17.250', 'Constellation 17.280',
    'Constellation 19.320', 'Constellation 19.330', 'Constellation 19.360', 'Constellation 19.390',
    'Constellation 24.250', 'Constellation 24.280', 'Constellation 25.320', 'Constellation 25.360',
    'Constellation 25.390', 'Constellation 26.280', 'Constellation 31.280', 'Constellation 31.330',
    'Delivery 6.160', 'Delivery 9.170', 'Delivery 11.180', 'Delivery 13.180',
    'Worker 8.150', 'Worker 10.160', 'Worker 15.180', 'Worker 17.210',
    'Worker 24.220', 'Worker 26.260', 'Worker 31.260', 'Worker 31.320'
  ],
};

// Mapeamento de marcas para modelos de veículos de reboque (implementos rodoviários)
const TRAILER_BRAND_MODELS: Record<string, string[]> = {
  'Randon': [
    'Sider 3 Eixos', 'Sider 2 Eixos', 'Baú Frigorífico 3 Eixos', 'Baú Frigorífico 2 Eixos',
    'Graneleiro 3 Eixos', 'Graneleiro 2 Eixos', 'Porta Container 3 Eixos',
    'Prancha 3 Eixos', 'Prancha 2 Eixos', 'Caçamba Basculante 3 Eixos',
    'Tanque 3 Eixos', 'Cegonheiro 2 Andares', 'Cegonheiro 3 Andares'
  ],
  'Librelato': [
    'Sider 3 Eixos', 'Sider 2 Eixos', 'Baú Seco 3 Eixos', 'Baú Seco 2 Eixos',
    'Graneleiro 3 Eixos', 'Graneleiro 2 Eixos', 'Porta Container 3 Eixos',
    'Prancha 3 Eixos', 'Caçamba 3 Eixos', 'Tanque Combustível 3 Eixos'
  ],
  'Guerra': [
    'Baú Frigorífico 3 Eixos', 'Baú Frigorífico 2 Eixos', 'Sider 3 Eixos',
    'Graneleiro 3 Eixos', 'Porta Container 3 Eixos', 'Prancha 3 Eixos',
    'Tanque 3 Eixos', 'Caçamba Basculante 3 Eixos'
  ],
  'Noma': [
    'Sider 3 Eixos', 'Sider 2 Eixos', 'Baú Seco 3 Eixos',
    'Graneleiro 3 Eixos', 'Porta Container 3 Eixos', 'Prancha 3 Eixos'
  ],
  'Facchini': [
    'Graneleiro 3 Eixos', 'Graneleiro 2 Eixos', 'Sider 3 Eixos',
    'Baú Seco 3 Eixos', 'Caçamba Basculante 3 Eixos', 'Porta Container 3 Eixos'
  ],
  'Vanderleia': [
    'Baú Frigorífico 3 Eixos', 'Baú Frigorífico 2 Eixos', 'Sider 3 Eixos',
    'Graneleiro 3 Eixos', 'Prancha 3 Eixos'
  ],
  'Rodotec': [
    'Baú Seco 3 Eixos', 'Baú Seco 2 Eixos', 'Sider 3 Eixos',
    'Graneleiro 3 Eixos', 'Porta Container 3 Eixos'
  ],
  'Rondon': [
    'Sider 3 Eixos', 'Baú Seco 3 Eixos', 'Graneleiro 3 Eixos',
    'Caçamba 3 Eixos', 'Prancha 3 Eixos'
  ],
  'Kässbohrer': [
    'Sider 3 Eixos', 'Baú Frigorífico 3 Eixos', 'Porta Container 3 Eixos',
    'Prancha 3 Eixos', 'Tanque 3 Eixos'
  ],
  'Recrusul': [
    'Baú Frigorífico 3 Eixos', 'Sider 3 Eixos', 'Graneleiro 3 Eixos',
    'Porta Container 3 Eixos', 'Prancha 3 Eixos'
  ],
  'Schiffer': [
    'Graneleiro 3 Eixos', 'Caçamba Basculante 3 Eixos', 'Sider 3 Eixos',
    'Baú Seco 3 Eixos', 'Porta Container 3 Eixos'
  ],
  'Pastre': [
    'Baú Frigorífico 3 Eixos', 'Baú Seco 3 Eixos', 'Sider 3 Eixos',
    'Graneleiro 3 Eixos', 'Prancha 3 Eixos'
  ],
};

const vehicleSchema = z.object({
  plate: z.string().min(7, 'Placa inválida').max(8, 'Placa inválida'),
  chassis: z.string().min(17, 'Chassis deve ter 17 caracteres').max(17),
  renavam: z.string().min(11, 'RENAVAM deve ter 11 dígitos').max(11),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  manufacturingYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  modelYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Cor é obrigatória'),
  vehicleType: z.enum(['Truck', 'Baú', 'Carreta', 'Graneleiro', 'Container', 'Caçamba', 'Cavalo Mecânico', 'Baú Frigorífico', 'Toco', 'VUC', '3/4', 'Sider', 'Prancha', 'Tanque', 'Cegonheiro', 'Bitruck', 'Rodotrem']),
  status: z.enum(['active', 'maintenance', 'inactive', 'sold']),
  purchaseKm: z.number().min(0),
  fuelType: z.enum(['Diesel S10', 'Diesel S500', 'Arla 32', 'Arla 42', 'Etanol', 'Gasolina']),
  axles: z.number().min(1).max(20),
  weight: z.number().min(0).optional(),
  purchaseDate: z.date(),
  purchaseValue: z.number().min(0),
  ownerBranch: z.string().min(1, 'Matriz/Filial proprietária é obrigatória'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  onSubmit: (data: Omit<Vehicle, 'id' | 'currentKm'>) => void;
  onCancel: () => void;
  initialData?: Vehicle;
  availableVehicles?: Vehicle[];
}

export function VehicleForm({ onSubmit, onCancel, initialData, availableVehicles = [] }: VehicleFormProps) {
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
  const [newCompositionVehicleId, setNewCompositionVehicleId] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string | undefined>(initialData?.driverId);
  const [vehicleImages, setVehicleImages] = useState<string[]>(initialData?.images || []);
  const [crlvDocument, setCrlvDocument] = useState<string | undefined>(initialData?.crlvDocument);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(initialData?.brand);
  const [ownerBranch, setOwnerBranch] = useState<string>(
    initialData?.ownerBranch || 'Matriz'
  );

  const tractionVehicleTypes = ['Truck', 'Cavalo Mecânico', 'Toco', 'VUC', '3/4', 'Bitruck'];
  const trailerVehicleTypes = ['Baú', 'Carreta', 'Graneleiro', 'Container', 'Caçamba', 'Baú Frigorífico', 'Sider', 'Prancha', 'Tanque', 'Cegonheiro', 'Rodotrem'];

  // Filtra veículos de reboque ativos disponíveis para composição
  // Um reboque só pode estar vinculado a um veículo de tração por vez
  const availableTrailerVehicles = availableVehicles.filter(v => {
    if (!trailerVehicleTypes.includes(v.vehicleType)) return false;
    if (v.status !== 'active') return false;
    if (v.id === initialData?.id) return false;
    if (compositionPlates.includes(v.plate)) return false;
    
    // Verifica se o reboque já está vinculado a outro veículo de tração
    const isLinkedToOtherTraction = availableVehicles.some(vehicle => 
      vehicle.id !== initialData?.id && // Exclui o veículo atual sendo editado
      vehicle.hasComposition && 
      vehicle.compositionPlates?.includes(v.plate)
    );
    
    return !isLinkedToOtherTraction;
  });

  const getVehicleCategory = (vehicleType?: string) => {
    if (!vehicleType) return undefined;
    if (tractionVehicleTypes.includes(vehicleType)) return 'traction';
    if (trailerVehicleTypes.includes(vehicleType)) return 'trailer';
    return undefined;
  };

  const [vehicleCategory, setVehicleCategory] = useState<'traction' | 'trailer' | undefined>(
    getVehicleCategory(initialData?.vehicleType)
  );


  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData ? {
      plate: initialData.plate,
      chassis: initialData.chassis,
      renavam: initialData.renavam,
      brand: initialData.brand,
      model: initialData.model,
      manufacturingYear: initialData.year,
      modelYear: initialData.year,
      color: initialData.color,
      vehicleType: initialData.vehicleType,
      status: initialData.status,
      purchaseKm: initialData.purchaseKm,
      fuelType: initialData.fuelType,
      axles: initialData.axles,
      weight: initialData.weight,
      purchaseDate: new Date(initialData.purchaseDate),
      purchaseValue: initialData.purchaseValue,
      ownerBranch: initialData.ownerBranch || 'Matriz',
    } : {
      manufacturingYear: new Date().getFullYear(),
      modelYear: new Date().getFullYear(),
      purchaseKm: 0,
      axles: 2,
      purchaseValue: 0,
      status: 'active',
      vehicleType: 'Truck',
      fuelType: 'Diesel S10',
      purchaseDate: new Date(),
      ownerBranch: 'Matriz',
    },
  });

  // Filtra os modelos disponíveis baseado na marca selecionada e categoria do veículo
  const availableModels = useMemo(() => {
    if (!selectedBrand) return [];
    const brandModels = vehicleCategory === 'trailer' ? TRAILER_BRAND_MODELS : TRACTION_BRAND_MODELS;
    return brandModels[selectedBrand] || [];
  }, [selectedBrand, vehicleCategory]);

  // Extrai o número de eixos do nome do modelo
  const extractAxlesFromModel = (modelName: string): number | null => {
    const match = modelName.match(/(\d+)\s*Eixos?/i);
    return match ? parseInt(match[1]) : null;
  };

  // Atualiza automaticamente a quantidade de eixos baseado no modelo selecionado (apenas para reboques)
  useEffect(() => {
    if (vehicleCategory === 'trailer') {
      const selectedModel = form.watch('model');
      if (selectedModel) {
        const axles = extractAxlesFromModel(selectedModel);
        if (axles !== null) {
          form.setValue('axles', axles);
        }
      }
      // Limpa composições e motorista para veículos de reboque
      setCompositionPlates([]);
      setCompositionAxles([]);
      setSelectedDriver(undefined);
    }
  }, [form.watch('model'), vehicleCategory]);

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
      year: data.modelYear,
      color: data.color,
      vehicleType: data.vehicleType,
      status: data.status,
      purchaseKm: data.purchaseKm,
      fuelType: data.fuelType,
      axles: data.axles,
      weight: data.weight,
      branches: selectedBranches,
      ownerBranch: data.ownerBranch,
      hasComposition: compositionPlates.length > 0,
      compositionPlates: compositionPlates.length > 0 ? compositionPlates : undefined,
      compositionAxles: compositionAxles.length > 0 ? compositionAxles : undefined,
      driverId: vehicleCategory !== 'trailer' ? selectedDriver : undefined,
      purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd'),
      purchaseValue: data.purchaseValue,
      images: vehicleImages.length > 0 ? vehicleImages : undefined,
      crlvDocument: crlvDocument,
    });
  };

  const addCompositionPlate = () => {
    if (newCompositionVehicleId) {
      const selectedVehicle = availableTrailerVehicles.find(v => v.id === newCompositionVehicleId);
      if (selectedVehicle && !compositionPlates.includes(selectedVehicle.plate)) {
        setCompositionPlates([...compositionPlates, selectedVehicle.plate]);
        setCompositionAxles([...compositionAxles, selectedVehicle.axles]);
        setNewCompositionVehicleId('');
      }
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

  const availableBranches = [
    { name: 'Matriz', cnpj: '12.345.678/0001-90' },
    { name: 'Filial SP', cnpj: '12.345.678/0002-71' },
    { name: 'Filial RJ', cnpj: '12.345.678/0003-52' },
    { name: 'Filial MG', cnpj: '12.345.678/0004-33' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {!initialData && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <label className="text-sm font-medium mb-3 block">Categoria do Veículo *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setVehicleCategory('traction');
                  form.setValue('vehicleType', 'Truck');
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  vehicleCategory === 'traction'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold mb-1">Veículo de Tração</div>
                <div className="text-xs text-muted-foreground">Truck, Cavalo Mecânico, Toco, VUC, 3/4, Bitruck</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleCategory('trailer');
                  form.setValue('vehicleType', 'Baú');
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  vehicleCategory === 'trailer'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold mb-1">Veículo de Reboque</div>
                <div className="text-xs text-muted-foreground">Baú, Sider, Carreta, Graneleiro, etc.</div>
              </button>
            </div>
          </div>
        )}

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

          {vehicleCategory !== 'trailer' && (
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Veículo *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!vehicleCategory && !initialData}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={vehicleCategory ? "Selecione o tipo" : "Selecione primeiro a categoria"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleCategory === 'traction' && (
                        <>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Cavalo Mecânico">Cavalo Mecânico</SelectItem>
                          <SelectItem value="Toco">Toco</SelectItem>
                          <SelectItem value="VUC">VUC</SelectItem>
                          <SelectItem value="3/4">3/4</SelectItem>
                          <SelectItem value="Bitruck">Bitruck</SelectItem>
                        </>
                      )}
                      {initialData && !vehicleCategory && (
                        <>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Baú">Baú</SelectItem>
                          <SelectItem value="Carreta">Carreta</SelectItem>
                          <SelectItem value="Graneleiro">Graneleiro</SelectItem>
                          <SelectItem value="Container">Container</SelectItem>
                          <SelectItem value="Caçamba">Caçamba</SelectItem>
                          <SelectItem value="Cavalo Mecânico">Cavalo Mecânico</SelectItem>
                          <SelectItem value="Baú Frigorífico">Baú Frigorífico</SelectItem>
                          <SelectItem value="Toco">Toco</SelectItem>
                          <SelectItem value="VUC">VUC</SelectItem>
                          <SelectItem value="3/4">3/4</SelectItem>
                          <SelectItem value="Sider">Sider</SelectItem>
                          <SelectItem value="Prancha">Prancha</SelectItem>
                          <SelectItem value="Tanque">Tanque</SelectItem>
                          <SelectItem value="Cegonheiro">Cegonheiro</SelectItem>
                          <SelectItem value="Bitruck">Bitruck</SelectItem>
                          <SelectItem value="Rodotrem">Rodotrem</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedBrand(value);
                    // Limpa o modelo quando a marca muda
                    form.setValue('model', '');
                  }} 
                  defaultValue={field.value}
                  disabled={!vehicleCategory && !initialData}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={vehicleCategory ? "Selecione a marca" : "Selecione primeiro a categoria"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicleCategory === 'traction' && (
                      <>
                        <SelectItem value="Agrale">Agrale</SelectItem>
                        <SelectItem value="DAF">DAF</SelectItem>
                        <SelectItem value="Ford">Ford</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                        <SelectItem value="Iveco">Iveco</SelectItem>
                        <SelectItem value="MAN">MAN</SelectItem>
                        <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                        <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>
                        <SelectItem value="Peugeot">Peugeot</SelectItem>
                        <SelectItem value="Renault">Renault</SelectItem>
                        <SelectItem value="Scania">Scania</SelectItem>
                        <SelectItem value="Volvo">Volvo</SelectItem>
                        <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                      </>
                    )}
                    {vehicleCategory === 'trailer' && (
                      <>
                        <SelectItem value="Randon">Randon</SelectItem>
                        <SelectItem value="Librelato">Librelato</SelectItem>
                        <SelectItem value="Guerra">Guerra</SelectItem>
                        <SelectItem value="Noma">Noma</SelectItem>
                        <SelectItem value="Facchini">Facchini</SelectItem>
                        <SelectItem value="Vanderleia">Vanderleia</SelectItem>
                        <SelectItem value="Rodotec">Rodotec</SelectItem>
                        <SelectItem value="Rondon">Rondon</SelectItem>
                        <SelectItem value="Kässbohrer">Kässbohrer</SelectItem>
                        <SelectItem value="Recrusul">Recrusul</SelectItem>
                        <SelectItem value="Schiffer">Schiffer</SelectItem>
                        <SelectItem value="Pastre">Pastre</SelectItem>
                      </>
                    )}
                    {initialData && !vehicleCategory && (
                      <>
                        <SelectItem value="Agrale">Agrale</SelectItem>
                        <SelectItem value="DAF">DAF</SelectItem>
                        <SelectItem value="Ford">Ford</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                        <SelectItem value="Iveco">Iveco</SelectItem>
                        <SelectItem value="MAN">MAN</SelectItem>
                        <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                        <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>
                        <SelectItem value="Peugeot">Peugeot</SelectItem>
                        <SelectItem value="Renault">Renault</SelectItem>
                        <SelectItem value="Scania">Scania</SelectItem>
                        <SelectItem value="Volvo">Volvo</SelectItem>
                        <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                        <SelectItem value="Randon">Randon</SelectItem>
                        <SelectItem value="Librelato">Librelato</SelectItem>
                        <SelectItem value="Guerra">Guerra</SelectItem>
                        <SelectItem value="Noma">Noma</SelectItem>
                        <SelectItem value="Facchini">Facchini</SelectItem>
                        <SelectItem value="Vanderleia">Vanderleia</SelectItem>
                        <SelectItem value="Rodotec">Rodotec</SelectItem>
                        <SelectItem value="Rondon">Rondon</SelectItem>
                        <SelectItem value="Kässbohrer">Kässbohrer</SelectItem>
                        <SelectItem value="Recrusul">Recrusul</SelectItem>
                        <SelectItem value="Schiffer">Schiffer</SelectItem>
                        <SelectItem value="Pastre">Pastre</SelectItem>
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
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!selectedBrand}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBrand ? "Selecione o modelo" : "Selecione a marca primeiro"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />


          {vehicleCategory === 'trailer' ? (
            <>
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
                name="modelYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano do Modelo *</FormLabel>
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
                name="manufacturingYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de Fabricação *</FormLabel>
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
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="manufacturingYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de Fabricação *</FormLabel>
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
                name="modelYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano do Modelo *</FormLabel>
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
            </>
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
            name="purchaseKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KM de Compra *</FormLabel>
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
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (Toneladas)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.1"
                    placeholder="Ex: 23.5"
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


        </div>

        {vehicleCategory === 'trailer' ? (
          <>
            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
              name="ownerBranch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matriz/Filial Proprietária *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a matriz/filial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBranches.map((branch) => (
                        <SelectItem key={branch.name} value={branch.name}>
                          {branch.name} - {branch.cnpj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
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
              name="ownerBranch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matriz/Filial Proprietária *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a matriz/filial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBranches.map((branch) => (
                        <SelectItem key={branch.name} value={branch.name}>
                          {branch.name} - {branch.cnpj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}


        <div>
          <FormLabel>Filiais Vinculadas *</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableBranches.map((branch) => (
              <Badge
                key={branch.name}
                variant={selectedBranches.includes(branch.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleBranch(branch.name)}
              >
                {branch.name}
              </Badge>
            ))}
          </div>
        </div>

        {form.watch('vehicleType') === 'Cavalo Mecânico' && (
          <div>
            <FormLabel>Composições Acopladas (Veículos de Reboque)</FormLabel>
            <div className="flex gap-2 mt-2">
              <Select
                value={newCompositionVehicleId}
                onValueChange={setNewCompositionVehicleId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um veículo de reboque" />
                </SelectTrigger>
                <SelectContent>
                  {availableTrailerVehicles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum veículo de reboque disponível
                    </SelectItem>
                  ) : (
                    availableTrailerVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.model} ({vehicle.axles} eixos)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addCompositionPlate} 
                size="icon"
                disabled={!newCompositionVehicleId}
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
        )}


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