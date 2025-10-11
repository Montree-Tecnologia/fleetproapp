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
import { Supplier, Company } from '@/hooks/useMockData';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const supplierSchema = z.object({
  documentType: z.enum(['cnpj', 'cpf']).optional(),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  fantasyName: z.string().optional(),
  type: z.enum(['gas_station', 'workshop', 'dealer', 'parts_store', 'tire_store', 'refrigeration_equipment', 'other']),
  brand: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF deve ter 2 caracteres'),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
}).refine((data) => {
  // Valida CNPJ ou CPF dependendo do tipo
  if (data.type === 'other') {
    if (data.documentType === 'cpf') {
      return data.cpf && /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf);
    } else {
      return data.cnpj && /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj);
    }
  } else {
    return data.cnpj && /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj);
  }
}, {
  message: 'Documento inválido',
  path: ['cnpj'],
}).refine((data) => {
  // Valida nome fantasia apenas para tipos que não sejam "other" com CPF
  if (data.type === 'other' && data.documentType === 'cpf') {
    return true; // Nome fantasia não é obrigatório
  } else {
    return data.fantasyName && data.fantasyName.length >= 3;
  }
}, {
  message: 'Nome fantasia deve ter no mínimo 3 caracteres',
  path: ['fantasyName'],
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  onSubmit: (data: Omit<Supplier, 'id'>) => void;
  onCancel: () => void;
  initialData?: Supplier;
  companies: Company[];
}

export function SupplierForm({ onSubmit, onCancel, initialData, companies }: SupplierFormProps) {
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    initialData?.branches || ['Matriz']
  );
  const [documentType, setDocumentType] = useState<'cnpj' | 'cpf'>(
    initialData?.cpf ? 'cpf' : 'cnpj'
  );

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData ? {
      documentType: initialData.cpf ? 'cpf' : 'cnpj',
      cnpj: initialData.cnpj,
      cpf: initialData.cpf,
      name: initialData.name,
      fantasyName: initialData.fantasyName,
      type: initialData.type,
      brand: initialData.brand,
      city: initialData.city,
      state: initialData.state,
      phone: initialData.phone,
      contactPerson: initialData.contactPerson,
    } : {
      documentType: 'cnpj',
      type: 'gas_station',
    },
  });

  const watchType = form.watch('type');
  const isOtherType = watchType === 'other';

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

  const handleSubmit = (data: SupplierFormData) => {
    onSubmit({
      cnpj: data.documentType === 'cnpj' ? data.cnpj : undefined,
      cpf: data.documentType === 'cpf' ? data.cpf : undefined,
      name: data.name,
      fantasyName: (data.type === 'other' && data.documentType === 'cpf') ? undefined : data.fantasyName,
      type: data.type,
      brand: data.brand,
      city: data.city,
      state: data.state.toUpperCase(),
      phone: data.phone,
      contactPerson: data.contactPerson,
      branches: selectedBranches,
      active: initialData?.active ?? true,
    });
  };

  const toggleBranch = (branchId: string) => {
    if (selectedBranches.includes(branchId)) {
      if (selectedBranches.length > 1) {
        setSelectedBranches(selectedBranches.filter(b => b !== branchId));
      }
    } else {
      setSelectedBranches([...selectedBranches, branchId]);
    }
  };

  // Filtrar apenas empresas ativas
  const availableBranches = companies.filter(c => c.active);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="gas_station">Posto de Combustível</SelectItem>
                    <SelectItem value="workshop">Oficina</SelectItem>
                    <SelectItem value="dealer">Concessionária</SelectItem>
                    <SelectItem value="parts_store">Peças e Componentes</SelectItem>
                    <SelectItem value="tire_store">Pneus</SelectItem>
                    <SelectItem value="refrigeration_equipment">Equipamentos de Refrigeração</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isOtherType && (
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Tipo de Documento *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setDocumentType(value as 'cnpj' | 'cpf');
                      }}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cnpj" id="cnpj" />
                        <label htmlFor="cnpj" className="text-sm font-medium cursor-pointer">
                          CNPJ
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cpf" id="cpf" />
                        <label htmlFor="cpf" className="text-sm font-medium cursor-pointer">
                          CPF
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(!isOtherType || documentType === 'cnpj') && (
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem className="col-span-2">
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
          )}

          {isOtherType && documentType === 'cpf' && (
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem className="col-span-2">
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
          )}

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
                    <SelectContent className="bg-background z-50">
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

          {(!isOtherType || documentType === 'cnpj') && (
            <>
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
            </>
          )}

          {isOtherType && documentType === 'cpf' && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 98765-4321" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pessoa de Contato</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome do responsável" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Matriz/Filiais Vinculadas *</FormLabel>
          <div className="flex flex-col gap-2 mt-2">
            {availableBranches.map((branch) => (
              <Badge
                key={branch.id}
                variant={selectedBranches.includes(branch.id) ? "default" : "outline"}
                className="cursor-pointer justify-start py-2 px-3"
                onClick={() => toggleBranch(branch.id)}
              >
                <span className="font-medium">{branch.name}</span>
                <span className="ml-2 text-xs opacity-70">- {branch.cnpj}</span>
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