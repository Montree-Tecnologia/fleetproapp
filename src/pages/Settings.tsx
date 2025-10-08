import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie configurações globais do sistema
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>
              Configure alertas e notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-alerts" className="flex flex-col gap-1">
                <span>Alertas por E-mail</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receber notificações de vencimentos por e-mail
                </span>
              </Label>
              <Switch id="email-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-alerts" className="flex flex-col gap-1">
                <span>Alertas de Manutenção</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Notificar sobre manutenções programadas
                </span>
              </Label>
              <Switch id="maintenance-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>
              Configurações de segurança e acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor" className="flex flex-col gap-1">
                <span>Autenticação de Dois Fatores</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Adicionar camada extra de segurança
                </span>
              </Label>
              <Switch id="two-factor" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="session-timeout" className="flex flex-col gap-1">
                <span>Timeout de Sessão</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Encerrar sessão após inatividade
                </span>
              </Label>
              <Switch id="session-timeout" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Backup e Dados</CardTitle>
            </div>
            <CardDescription>
              Gerenciamento de dados e backups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-backup" className="flex flex-col gap-1">
                <span>Backup Automático</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Realizar backup diário automaticamente
                </span>
              </Label>
              <Switch id="auto-backup" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
