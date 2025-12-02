import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMockData } from '@/hooks/useMockData';
import { changePassword } from '@/services/authApi';
import { ApiError } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Mail, Building2, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { user, logout } = useAuth();
  const { companies } = useMockData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Senha alterada com sucesso! Você será redirecionado para o login.',
        });
        
        // Fazer logout e redirecionar para login
        await logout();
        navigate('/login');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao alterar senha',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao alterar senha. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default';
    if (role === 'manager') return 'secondary';
    return 'outline';
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Administrador';
    if (role === 'manager') return 'Gestor';
    return 'Operador';
  };

  if (!user) return null;

  // Obter empresas vinculadas ao usuário
  const allCompanies = companies();
  const linkedCompanies = allCompanies.filter(c => user.linkedCompanyIds.includes(c.id));
  const primaryCompany = allCompanies.find(c => c.id === user.primaryCompanyId);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações de perfil e preferências
        </p>
      </div>

      <div className="grid gap-6">
        {/* Informações de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Perfil</CardTitle>
            <CardDescription>
              Suas informações pessoais e de acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Nome
                </div>
                <p className="text-base font-medium">{user.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="text-base font-medium">{user.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Nível de Acesso
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Empresa de Vínculo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Empresa de Vínculo</h3>
              {primaryCompany && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      Razão Social
                    </div>
                    <p className="text-base font-medium">{primaryCompany.name}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      CNPJ
                    </div>
                    <p className="text-base font-medium">{primaryCompany.cnpj}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      Cidade/Estado
                    </div>
                    <p className="text-base font-medium">{primaryCompany.city}/{primaryCompany.state}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      Tipo
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {primaryCompany.type === 'matriz' ? 'Matriz' : 'Filial'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Empresas com Acesso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Empresas com Acesso para Operações</h3>
              <div className="space-y-3">
                {linkedCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        CNPJ: {company.cnpj} • {company.city}/{company.state}
                      </p>
                    </div>
                    <Badge variant={company.type === 'matriz' ? 'default' : 'secondary'} className="text-xs">
                      {company.type === 'matriz' ? 'Matriz' : 'Filial'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Atualize sua senha de acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Digite sua senha atual"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Digite sua nova senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirme sua nova senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
