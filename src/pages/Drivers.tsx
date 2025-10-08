import { useState } from 'react';
import { useMockData, Driver } from '@/hooks/useMockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, IdCard, Calendar, FileText, Trash2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const driverSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
  cpf: z.string().trim().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (formato: 000.000.000-00)'),
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 80;
  }, 'Motorista deve ter entre 18 e 80 anos'),
  cnhCategory: z.enum(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'], {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }),
  cnhValidity: z.string().refine((date) => {
    const validity = new Date(date);
    const today = new Date();
    return validity > today;
  }, 'CNH deve estar válida'),
  branch: z.string().trim().min(1, 'Filial é obrigatória'),
});

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    cnhCategory: 'D' as const,
    cnhValidity: '',
    branch: 'Matriz',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allDrivers = drivers();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = driverSchema.parse(formData);
      
      if (allDrivers.some(d => d.cpf === validatedData.cpf)) {
        setErrors({ cpf: 'CPF já cadastrado' });
        return;
      }

      addDriver({
        name: validatedData.name,
        cpf: validatedData.cpf,
        birthDate: validatedData.birthDate,
        cnhCategory: validatedData.cnhCategory,
        cnhValidity: validatedData.cnhValidity,
        branch: validatedData.branch,
        active: true,
      });

      toast({
        title: 'Motorista cadastrado',
        description: `${validatedData.name} foi adicionado com sucesso.`,
      });

      setFormData({
        name: '',
        cpf: '',
        birthDate: '',
        cnhCategory: 'D',
        cnhValidity: '',
        branch: 'Matriz',
      });
      setErrors({});
      setOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleToggleActive = (driverId: string, currentStatus: boolean) => {
    updateDriver(driverId, { active: !currentStatus });
    toast({
      title: currentStatus ? 'Motorista desativado' : 'Motorista ativado',
      description: 'Status atualizado com sucesso.',
    });
  };

  const handleDelete = (driverId: string, driverName: string) => {
    deleteDriver(driverId);
    toast({
      title: 'Motorista removido',
      description: `${driverName} foi removido do sistema.`,
    });
  };

  const getCNHStatus = (validity: string) => {
    const validityDate = new Date(validity);
    const today = new Date();
    const daysUntilExpiry = Math.floor((validityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'Vencida', variant: 'destructive' as const };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'Vence em breve', variant: 'destructive' as const };
    } else if (daysUntilExpiry <= 60) {
      return { status: 'Atenção', variant: 'outline' as const };
    }
    return { status: 'Válida', variant: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Motoristas</h2>
          <p className="text-muted-foreground">
            Gerencie o cadastro de motoristas da frota
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Cadastrar Motorista</DialogTitle>
                <DialogDescription>
                  Adicione um novo motorista à sua frota.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: '' });
                    }}
                    placeholder="João da Silva"
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      setFormData({ ...formData, cpf: formatted });
                      setErrors({ ...errors, cpf: '' });
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">{errors.cpf}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      setFormData({ ...formData, birthDate: e.target.value });
                      setErrors({ ...errors, birthDate: '' });
                    }}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-destructive">{errors.birthDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnhCategory">Categoria da CNH</Label>
                  <Select
                    value={formData.cnhCategory}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, cnhCategory: value })
                    }
                  >
                    <SelectTrigger id="cnhCategory">
                      <SelectValue />
                    </SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnhValidity">Validade da CNH</Label>
                  <Input
                    id="cnhValidity"
                    type="date"
                    value={formData.cnhValidity}
                    onChange={(e) => {
                      setFormData({ ...formData, cnhValidity: e.target.value });
                      setErrors({ ...errors, cnhValidity: '' });
                    }}
                  />
                  {errors.cnhValidity && (
                    <p className="text-sm text-destructive">{errors.cnhValidity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Filial</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) =>
                      setFormData({ ...formData, branch: value })
                    }
                  >
                    <SelectTrigger id="branch">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matriz">Matriz</SelectItem>
                      <SelectItem value="Filial SP">Filial SP</SelectItem>
                      <SelectItem value="Filial RJ">Filial RJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allDrivers.map((driver) => {
          const cnhStatus = getCNHStatus(driver.cnhValidity);
          
          return (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {driver.name}
                      {!driver.active && (
                        <Badge variant="outline" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <IdCard className="h-3 w-3" />
                      {driver.cpf}
                    </CardDescription>
                  </div>
                  <Badge variant={cnhStatus.variant}>{cnhStatus.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>CNH Categoria {driver.cnhCategory}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Válida até {new Date(driver.cnhValidity).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{driver.branch}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant={driver.active ? 'outline' : 'default'}
                    className="flex-1"
                    onClick={() => handleToggleActive(driver.id, driver.active)}
                  >
                    {driver.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(driver.id, driver.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
