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
import { cn } from '@/lib/utils';
import { Driver, Company } from '@/hooks/useMockData';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { getCompaniesCombo, CompanyCombo } from '@/services/companiesApi';
import { toast } from 'sonner';
import { Upload, X, FileText } from 'lucide-react';

const driverSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (formato: 000.000.000-00)'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  cnhCategory: z.enum(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE']),
  cnhValidity: z.string().min(1, 'Validade da CNH é obrigatória'),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface DriverFormProps {
  onSubmit: (data: Omit<Driver, 'id'>) => void;
  onCancel: () => void;
  initialData?: Driver;
  existingCpfs?: string[];
  companies: Company[];
}

export function DriverForm({ onSubmit, onCancel, initialData, existingCpfs = [], companies }: DriverFormProps) {
  const [selectedBranches, setSelectedBranches] = useState<number[]>(
    initialData?.branches?.map(b => parseInt(b)) || []
  );
  const [apiCompanies, setApiCompanies] = useState<CompanyCombo[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [cnhDocument, setCnhDocument] = useState<string | undefined>(initialData?.cnhDocument);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log('🔍 Buscando empresas da API /companies/combo...');
        const response = await getCompaniesCombo();
        console.log('📦 Resposta da API:', response);
        if (response.success && response.data) {
          console.log('✅ Empresas carregadas:', response.data);
          setApiCompanies(response.data);
        } else {
          console.warn('⚠️ Resposta sem dados:', response);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar empresas:', error);
        toast.error('Erro ao carregar empresas');
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Atualizar badges selecionados quando initialData mudar
  useEffect(() => {
    if (initialData?.branches) {
      setSelectedBranches(initialData.branches.map(b => parseInt(b)));
    }
    if (initialData?.cnhDocument) {
      setCnhDocument(initialData.cnhDocument);
    }
  }, [initialData]);

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      cpf: initialData.cpf,
      birthDate: initialData.birthDate,
      cnhCategory: initialData.cnhCategory as any,
      cnhValidity: initialData.cnhValidity,
    } : {
      cnhCategory: 'E',
      birthDate: '',
      cnhValidity: '',
    },
  });

  const handleCNHUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCnhDocument(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCNHDocument = () => {
    setCnhDocument(undefined);
  };

  const handleSubmit = (data: DriverFormData) => {
    // Validate CPF uniqueness
    if (!initialData && existingCpfs.includes(data.cpf)) {
      form.setError('cpf', { message: 'CPF já cadastrado' });
      return;
    }

    // Validate age
    const birthDate = new Date(data.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18 || age > 80) {
      form.setError('birthDate', { message: 'Idade deve estar entre 18 e 80 anos' });
      return;
    }

    // Validate CNH validity
    const cnhValidity = new Date(data.cnhValidity);
    if (cnhValidity < new Date()) {
      form.setError('cnhValidity', { message: 'CNH vencida' });
      return;
    }

    // Validate at least one branch is selected
    if (selectedBranches.length === 0) {
      return;
    }

    onSubmit({
      name: data.name,
      cpf: data.cpf.replace(/\D/g, ''), // Remover pontos e traços
      cnhCategory: data.cnhCategory,
      branches: selectedBranches.map(String),
      birthDate: data.birthDate,
      cnhValidity: data.cnhValidity,
      active: initialData?.active ?? true,
      cnhDocument,
    });
  };

  const toggleBranch = (branchId: number) => {
    if (selectedBranches.includes(branchId)) {
      if (selectedBranches.length > 1) {
        setSelectedBranches(selectedBranches.filter(b => b !== branchId));
      }
    } else {
      setSelectedBranches([...selectedBranches, branchId]);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder="João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF *</FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00"
                  {...field}
                  onChange={(e) => field.onChange(formatCPF(e.target.value))}
                  maxLength={14}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnhCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria CNH *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">A - Motocicletas</SelectItem>
                  <SelectItem value="B">B - Carros</SelectItem>
                  <SelectItem value="C">C - Veículos de Carga</SelectItem>
                  <SelectItem value="D">D - Veículos de Passageiros</SelectItem>
                  <SelectItem value="E">E - Combinações de Veículos</SelectItem>
                  <SelectItem value="AB">AB - A + B</SelectItem>
                  <SelectItem value="AC">AC - A + C</SelectItem>
                  <SelectItem value="AD">AD - A + D</SelectItem>
                  <SelectItem value="AE">AE - A + E</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnhValidity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validade CNH *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Matriz/Filiais Vinculadas *</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md">
            {loadingCompanies ? (
              <p className="text-sm text-muted-foreground">Carregando empresas...</p>
            ) : apiCompanies.length > 0 ? (
              apiCompanies.map((company) => (
                <Badge
                  key={company.id}
                  variant={selectedBranches.includes(company.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleBranch(company.id)}
                >
                  {company.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma empresa disponível</p>
            )}
          </div>
        </div>

        <div>
          <FormLabel>Documento CNH (Foto/PDF)</FormLabel>
          <div className="space-y-2 mt-2">
            {cnhDocument ? (
              <div className="relative">
                {cnhDocument.startsWith('data:image') ? (
                  <img
                    src={cnhDocument}
                    alt="CNH"
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Documento anexado</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeCNHDocument}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleCNHUpload}
                  className="hidden"
                  id="cnh-upload"
                />
                <label htmlFor="cnh-upload">
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Anexar CNH
                    </span>
                  </Button>
                </label>
              </>
            )}
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
    </Form>
  );
}