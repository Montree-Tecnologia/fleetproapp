import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A nova senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A nova senha deve conter pelo menos um número'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePassword() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof PasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Limpa o erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Valida os dados
      passwordSchema.parse(formData);

      // Aqui você verificaria a senha atual e atualizaria a senha
      // Por enquanto, vamos simular a verificação
      
      // Simula verificação da senha atual (em produção, isso seria feito no backend)
      if (formData.currentPassword !== 'senha123') {
        setErrors({ currentPassword: 'Senha atual incorreta' });
        toast({
          variant: 'destructive',
          title: 'Senha incorreta',
          description: 'A senha atual está incorreta.',
        });
        setIsSubmitting(false);
        return;
      }

      // Simula atualização da senha
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.',
      });
      
      // Limpa o formulário
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof PasswordFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof PasswordFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          variant: 'destructive',
          title: 'Erro no formulário',
          description: 'Por favor, corrija os erros no formulário.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao alterar senha.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Alterar Senha</h2>
        <p className="text-muted-foreground">
          Defina uma nova senha para sua conta
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Nova Senha
            </CardTitle>
            <CardDescription>
              A senha deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Senha Atual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleChange('currentPassword')}
                    className={errors.currentPassword ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword}</p>
                )}
              </div>

              {/* Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange('newPassword')}
                    className={errors.newPassword ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline-destructive"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações do Usuário */}
        {user && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Usuário:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Perfil:</strong> {user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gestor' : 'Operador'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
