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
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Supplier } from '@/hooks/useMockData';

const supplierSchema = z.object({
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido (formato: 00.000.000/0000-00)'),
  name: z.string().min(3, 'Razão social deve ter no mínimo 3 caracteres'),
  fantasyName: z.string().min(3, 'Nome fantasia deve ter no mínimo 3 caracteres'),
  type: z.enum(['gas_station', 'workshop', 'dealer', 'parts_store', 'tire_store']),
  brand: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF deve ter 2 caracteres'),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  onSubmit: (data: Omit<Supplier, 'id'>) => void;
  onCancel: () => void;
  initialData?: Supplier;
}

export function SupplierForm({ onSubmit, onCancel, initialData }: SupplierFormProps) {
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    initialData?.branches || ['Matriz']
  );

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData ? {
      cnpj: initialData.cnpj,
      name: initialData.name,
      fantasyName: initialData.fantasyName,
      type: initialData.type,
      brand: initialData.brand,
      city: initialData.city,
      state: initialData.state,
    } : {
      type: 'gas_station',
    },
  });

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const handleSubmit = (data: SupplierFormData) => {
    onSubmit({
      cnpj: data.cnpj,
      name: data.name,
      fantasyName: data.fantasyName,
      type: data.type,
      brand: data.brand,
      city: data.city,
      state: data.state.toUpperCase(),
      branches: selectedBranches,
    });
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
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="00.000.000/0000-00" 
                    {...field}
                    onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                    maxLength={18}
                  />
                </FormControl>
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
                    <SelectItem value="gas_station">Posto de Combustível</SelectItem>
                    <SelectItem value="workshop">Oficina</SelectItem>
                    <SelectItem value="dealer">Concessionária</SelectItem>
                    <SelectItem value="parts_store">Loja de Peças e Componentes</SelectItem>
                    <SelectItem value="tire_store">Loja de Pneus</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('type') === 'gas_station' && (
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Bandeira</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a bandeira" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Petrobras">Petrobras</SelectItem>
                      <SelectItem value="Shell">Shell</SelectItem>
                      <SelectItem value="Ipiranga">Ipiranga</SelectItem>
                      <SelectItem value="Ale">Ale</SelectItem>
                      <SelectItem value="Outra Bandeira">Outra Bandeira</SelectItem>
                      <SelectItem value="Sem Bandeira">Sem Bandeira</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Razão Social *</FormLabel>
                <FormControl>
                  <Input placeholder="Empresa LTDA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fantasyName"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nome Fantasia *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do estabelecimento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade *</FormLabel>
                <FormControl>
                  <Input placeholder="São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UF *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="SP" 
                    maxLength={2}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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