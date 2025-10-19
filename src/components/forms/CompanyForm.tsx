import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { useMockData, Company } from '@/hooks/useMockData';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const companySchema = z.object({
  type: z.enum(['matriz', 'filial']),
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório').max(2, 'Use a sigla do estado'),
  matrizId: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialData?: Company;
  onSuccess: () => void;
  onCancel?: () => void;
  companiesExternal?: Company[];
  addCompanyExternal?: (company: Omit<Company, 'id'>) => Company;
  updateCompanyExternal?: (id: string, data: Partial<Company>) => void;
}

export function CompanyForm({ initialData, onSuccess, onCancel, companiesExternal, addCompanyExternal, updateCompanyExternal }: CompanyFormProps) {
  const mock = useMockData();
  const addCompany = addCompanyExternal || mock.addCompany;
  const updateCompany = updateCompanyExternal || mock.updateCompany;
  const companiesGetter = mock.companies;
  const { toast } = useToast();
  const allCompanies = companiesExternal || companiesGetter();
  const matrizes = allCompanies.filter(c => c.type === 'matriz');
  
  // Se não há nenhuma empresa cadastrada e não está editando, deve ser matriz
  const isFirstCompany = allCompanies.length === 0 && !initialData;
  const hasMatriz = matrizes.length > 0;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData ? {
      type: initialData.type,
      name: initialData.name,
      cnpj: initialData.cnpj,
      city: initialData.city,
      state: initialData.state,
      matrizId: initialData.matrizId || '',
    } : {
      type: isFirstCompany ? 'matriz' : 'filial',
      name: '',
      cnpj: '',
      city: '',
      state: '',
      matrizId: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type,
        name: initialData.name,
        cnpj: initialData.cnpj,
        city: initialData.city,
        state: initialData.state,
        matrizId: initialData.matrizId || '',
      });
    }
  }, [initialData, form]);

  const watchType = form.watch('type');

  const onSubmit = (data: CompanyFormValues) => {
    // Validação: primeiro cadastro deve ser matriz
    if (!initialData && allCompanies.length === 0 && data.type !== 'matriz') {
      toast({
        title: 'Erro de validação',
        description: 'O primeiro cadastro deve ser obrigatoriamente uma Matriz.',
        variant: 'destructive',
      });
      return;
    }

    // Validação: não pode criar filial sem matriz
    if (data.type === 'filial' && !hasMatriz) {
      toast({
        title: 'Erro de validação',
        description: 'É necessário cadastrar uma Matriz antes de criar Filiais.',
        variant: 'destructive',
      });
      return;
    }

    if (initialData) {
      updateCompany(initialData.id, {
        type: data.type,
        name: data.name,
        cnpj: data.cnpj,
        city: data.city,
        state: data.state,
        matrizId: data.type === 'filial' ? data.matrizId : undefined,
      });
      toast({
        title: 'Empresa atualizada',
        description: `${data.name} foi atualizada com sucesso.`,
      });
    } else {
      addCompany({
        type: data.type,
        name: data.name,
        cnpj: data.cnpj,
        city: data.city,
        state: data.state,
        matrizId: data.type === 'filial' ? data.matrizId : undefined,
        active: true,
      });
      toast({
        title: 'Empresa cadastrada',
        description: `${data.name} foi adicionada com sucesso.`,
      });
    }
    onSuccess();
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isFirstCompany}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="matriz">Matriz</SelectItem>
                  <SelectItem value="filial" disabled={!hasMatriz}>
                    Filial {!hasMatriz && '(Cadastre uma matriz primeiro)'}
                  </SelectItem>
                </SelectContent>
              </Select>
              {isFirstCompany && (
                <p className="text-xs text-muted-foreground mt-1">
                  O primeiro cadastro deve ser obrigatoriamente uma Matriz
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType === 'filial' && (
          <FormField
            control={form.control}
            name="matrizId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matriz</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a matriz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {matrizes.map((matriz) => (
                      <SelectItem key={matriz.id} value={matriz.id}>
                        {matriz.name}
                      </SelectItem>
                    ))}
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
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade" {...field} />
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
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input
                    placeholder="UF"
                    {...field}
                    maxLength={2}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline-destructive" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
