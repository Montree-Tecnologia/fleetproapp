import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Building2, User, Lock, AlertCircle, Sparkles, TruckIcon, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Email ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Gestão completa de veículos',
    'Controle de abastecimento',
    'Monitoramento de refrigeração',
    'Rastreamento de motoristas'
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-mesh">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-primary rounded-2xl shadow-glow mb-6 animate-scale-in">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient-fancy mb-2">
              FleetPro
            </h1>
            <p className="text-muted-foreground text-lg">
              Sistema de Gestão de Frotas
            </p>
          </div>

          {/* Login Card */}
          <Card className="card-elevated p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-professional h-12 text-base"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-professional h-12 text-base"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 btn-gradient text-base font-semibold hover-grow" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Entrar no Sistema
                  </div>
                )}
              </Button>

              {/* Test Credentials */}
              <div className="mt-6 p-5 bg-gradient-subtle rounded-xl border border-primary/10">
                <p className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Credenciais de teste
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-background/60 rounded-lg">
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">Admin:</span>
                      <span className="text-muted-foreground ml-2">admin@frota.com</span>
                    </span>
                    <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">admin123</code>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-background/60 rounded-lg">
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">Gestor:</span>
                      <span className="text-muted-foreground ml-2">gestor@frota.com</span>
                    </span>
                    <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">gestor123</code>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Right Side - Hero Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary items-center justify-center p-12">
        <div className="max-w-lg text-white space-y-8 animate-fade-in">
          <div className="space-y-4">
            <TruckIcon className="h-16 w-16 text-white/90" />
            <h2 className="text-4xl font-bold">
              Gerencie sua frota com eficiência
            </h2>
            <p className="text-xl text-white/90">
              Plataforma completa para gestão de veículos, motoristas e operações logísticas
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle className="h-5 w-5 text-white/90 flex-shrink-0" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/20">
            <p className="text-sm text-white/70">
              © 2025 FleetPro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}