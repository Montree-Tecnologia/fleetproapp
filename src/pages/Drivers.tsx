import { useState } from 'react';
import { useMockData, Driver } from '@/hooks/useMockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { UserPlus, IdCard, Calendar, FileText, Trash2, Building2, Pencil, Eye, Upload, X, Search, Power, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  branches: z.array(z.string()).min(1, 'Selecione ao menos uma filial'),
});

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<{ id: string; name: string } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [toggleActiveDialogOpen, setToggleActiveDialogOpen] = useState(false);
  const [driverToToggle, setDriverToToggle] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    cnhCategory: 'D' as const,
    cnhValidity: '',
    branches: ['Matriz'],
    cnhDocument: '' as string | undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleCNHUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, cnhDocument: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCNHDocument = () => {
    setFormData({ ...formData, cnhDocument: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = driverSchema.parse(formData);
      
      if (allDrivers.some(d => d.cpf === validatedData.cpf && d.id !== editingDriver?.id)) {
        setErrors({ cpf: 'CPF já cadastrado' });
        return;
      }

      if (editingDriver) {
        updateDriver(editingDriver.id, {
          name: validatedData.name,
          cpf: validatedData.cpf,
          birthDate: validatedData.birthDate,
          cnhCategory: validatedData.cnhCategory,
          cnhValidity: validatedData.cnhValidity,
          branches: validatedData.branches,
          cnhDocument: formData.cnhDocument,
        });

        toast({
          title: 'Motorista atualizado',
          description: `${validatedData.name} foi atualizado com sucesso.`,
        });
      } else {
        addDriver({
          name: validatedData.name,
          cpf: validatedData.cpf,
          birthDate: validatedData.birthDate,
          cnhCategory: validatedData.cnhCategory,
          cnhValidity: validatedData.cnhValidity,
          branches: validatedData.branches,
          active: true,
          cnhDocument: formData.cnhDocument,
        });

        toast({
          title: 'Motorista cadastrado',
          description: `${validatedData.name} foi adicionado com sucesso.`,
        });
      }

      handleDialogClose();
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

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      cpf: driver.cpf,
      birthDate: driver.birthDate,
      cnhCategory: driver.cnhCategory as typeof formData.cnhCategory,
      cnhValidity: driver.cnhValidity,
      branches: driver.branches,
      cnhDocument: driver.cnhDocument,
    });
    setErrors({});
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditingDriver(null);
    setFormData({
      name: '',
      cpf: '',
      birthDate: '',
      cnhCategory: 'D' as const,
      cnhValidity: '',
      branches: ['Matriz'],
      cnhDocument: undefined,
    });
    setErrors({});
  };

  const handleToggleActive = (driverId: string, driverName: string, currentStatus: boolean) => {
    setDriverToToggle({ id: driverId, name: driverName, currentStatus });
    setToggleActiveDialogOpen(true);
  };

  const confirmToggleActive = () => {
    if (driverToToggle) {
      updateDriver(driverToToggle.id, { active: !driverToToggle.currentStatus });
      toast({
        title: driverToToggle.currentStatus ? 'Motorista inativado' : 'Motorista ativado',
        description: 'Status atualizado com sucesso.',
      });
      setToggleActiveDialogOpen(false);
      setDriverToToggle(null);
      
      // Atualiza o motorista sendo visualizado se estiver aberto
      if (viewingDriver && viewingDriver.id === driverToToggle.id) {
        setViewingDriver({ ...viewingDriver, active: !driverToToggle.currentStatus });
      }
    }
  };

  const handleDeleteClick = (driverId: string, driverName: string) => {
    setDriverToDelete({ id: driverId, name: driverName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (driverToDelete) {
      deleteDriver(driverToDelete.id);
      toast({
        title: 'Motorista removido',
        description: `${driverToDelete.name} foi removido do sistema.`,
      });
      setDeleteDialogOpen(false);
      setDriverToDelete(null);
    }
  };

  const handleViewDetails = (driver: Driver) => {
    setViewingDriver(driver);
    setDetailsDialogOpen(true);
  };

  const getCNHStatus = (validity: string) => {
    const validityDate = new Date(validity);
    const today = new Date();
    const daysUntilExpiry = Math.floor((validityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'CNH Vencida', variant: 'destructive' as const, daysUntilExpiry };
    } else if (daysUntilExpiry <= 60) {
      return { status: 'CNH Vence em Breve', variant: 'outline' as const, daysUntilExpiry };
    }
    return { status: 'CNH Válida', variant: 'secondary' as const, daysUntilExpiry };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Motoristas</h2>
          <p className="text-sm lg:text-base text-muted-foreground">
            Gerencie o cadastro de motoristas da frota
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingDriver ? 'Editar Motorista' : 'Cadastrar Motorista'}</DialogTitle>
                <DialogDescription>
                  {editingDriver ? 'Atualize as informações do motorista.' : 'Adicione um novo motorista à sua frota.'}
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
                  <Label>Matriz/Filiais Vinculadas</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                    {['Matriz', 'Filial SP', 'Filial RJ', 'Filial MG'].map((branch) => (
                      <Badge
                        key={branch}
                        variant={formData.branches.includes(branch) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (formData.branches.includes(branch)) {
                            if (formData.branches.length > 1) {
                              setFormData({
                                ...formData,
                                branches: formData.branches.filter(b => b !== branch)
                              });
                            }
                          } else {
                            setFormData({
                              ...formData,
                              branches: [...formData.branches, branch]
                            });
                          }
                        }}
                      >
                        {branch}
                      </Badge>
                    ))}
                  </div>
                  {errors.branches && (
                    <p className="text-sm text-destructive">{errors.branches}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Documento CNH (Foto/PDF)</Label>
                  <div className="space-y-2">
                    {formData.cnhDocument ? (
                      <div className="relative">
                        {formData.cnhDocument.startsWith('data:image') ? (
                          <img
                            src={formData.cnhDocument}
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline-destructive" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit">{editingDriver ? 'Atualizar' : 'Cadastrar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome, CPF ou categoria de CNH..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {allDrivers
          .filter(driver => {
            const search = searchTerm.toLowerCase();
            return (
              driver.name.toLowerCase().includes(search) ||
              driver.cpf.includes(search) ||
              driver.cnhCategory.toLowerCase().includes(search)
            );
          })
          .map((driver) => {
          const cnhStatus = getCNHStatus(driver.cnhValidity);
          
          return (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {driver.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <IdCard className="h-3 w-3" />
                      {driver.cpf}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant={driver.active ? "default" : "destructive"} className={driver.active ? "bg-green-600 hover:bg-green-700" : ""}>
                      {driver.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge 
                      variant={cnhStatus.variant}
                      className={cnhStatus.daysUntilExpiry <= 60 && cnhStatus.daysUntilExpiry > 0 ? 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200' : ''}
                    >
                      {cnhStatus.status}
                    </Badge>
                  </div>
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
                  <span>{driver.branches.join(', ')}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewDetails(driver)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(driver)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant={driver.active ? 'outline-destructive' : 'default'}
                          onClick={() => handleToggleActive(driver.id, driver.name, driver.active)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{driver.active ? 'Inativar' : 'Ativar'}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(driver.id, driver.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o motorista <strong>{driverToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={toggleActiveDialogOpen} onOpenChange={setToggleActiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar {driverToToggle?.currentStatus ? 'inativação' : 'ativação'}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {driverToToggle?.currentStatus ? 'inativar' : 'ativar'} o motorista <strong>{driverToToggle?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleActive}>
              {driverToToggle?.currentStatus ? 'Inativar' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Motorista</DialogTitle>
            <DialogDescription>
              Informações completas do motorista
            </DialogDescription>
          </DialogHeader>

          {viewingDriver && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Informações Pessoais</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome Completo:</span>
                    <p className="font-medium">{viewingDriver.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CPF:</span>
                    <p className="font-medium font-mono">{viewingDriver.cpf}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data de Nascimento:</span>
                    <p className="font-medium">{formatDate(viewingDriver.birthDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Idade:</span>
                    <p className="font-medium">{calculateAge(viewingDriver.birthDate)} anos</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <Badge variant={viewingDriver.active ? "default" : "destructive"}>
                        {viewingDriver.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Habilitação (CNH)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>
                    <p className="font-medium">Categoria {viewingDriver.cnhCategory}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data de Validade:</span>
                    <p className="font-medium">{formatDate(viewingDriver.cnhValidity)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status da CNH:</span>
                    <div className="mt-1">
                      <Badge variant={getCNHStatus(viewingDriver.cnhValidity).variant}>
                        {getCNHStatus(viewingDriver.cnhValidity).status}
                      </Badge>
                    </div>
                  </div>
                  {viewingDriver.cnhDocument && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Documento CNH:</span>
                      <div className="mt-2">
                        {viewingDriver.cnhDocument.startsWith('data:image') ? (
                          <img
                            src={viewingDriver.cnhDocument}
                            alt="CNH"
                            className="w-full max-w-md h-auto object-contain rounded-lg border border-border cursor-pointer"
                            onClick={() => window.open(viewingDriver.cnhDocument, '_blank')}
                          />
                        ) : (
                          <a
                            href={viewingDriver.cnhDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors w-fit"
                          >
                            <FileText className="h-5 w-5" />
                            <span className="text-sm font-medium">Ver documento CNH</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Matriz/Filiais Vinculadas</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingDriver.branches.map((branch, index) => (
                    <Badge key={index} variant="secondary">
                      {branch}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleEdit(viewingDriver);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant={viewingDriver.active ? 'outline-destructive' : 'default'}
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleToggleActive(viewingDriver.id, viewingDriver.name, viewingDriver.active);
                  }}
                >
                  {viewingDriver.active ? 'Inativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
