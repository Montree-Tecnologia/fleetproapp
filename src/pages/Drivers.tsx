import { useState, useEffect } from 'react';
import { useMockData, Driver } from '@/hooks/useMockData';
import { createDriver, fetchDrivers, deleteDriver as deleteDriverApi, DriverResponse } from '@/services/driversApi';
import { DriverForm } from '@/components/forms/DriverForm';
import { ApiError } from '@/lib/api';
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
import { UserPlus, IdCard, Calendar, FileText, Trash2, Building2, Pencil, Eye, Upload, X, Search, Power, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  const { drivers, addDriver, updateDriver, companies } = useMockData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [apiDrivers, setApiDrivers] = useState<DriverResponse[]>([]);

  // Load drivers from API
  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchDrivers(currentPage, perPage);
      if (response.success && response.data) {
        setApiDrivers(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalDrivers(response.data.pagination.totalRecords);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Erro ao carregar motoristas',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [currentPage, perPage, toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setErrors({});
      
      const validatedData = driverSchema.parse(formData);
      
      if (allDrivers.some(d => d.cpf === validatedData.cpf && d.id !== editingDriver?.id)) {
        setErrors({ cpf: 'CPF já cadastrado' });
        return;
      }

      if (editingDriver) {
        // Modo edição - continua usando mock
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
        // Modo criação - chama a API
        const allCompanies = companies();
        
        // Mapear nomes das branches para IDs numéricos
        const branchIds = validatedData.branches
          .map(branchName => {
            const company = allCompanies.find(c => c.name === branchName);
            return company ? parseInt(company.id) : null;
          })
          .filter((id): id is number => id !== null);

        if (branchIds.length === 0) {
          setErrors({ branches: 'Nenhuma filial válida selecionada' });
          return;
        }

        // Extrair apenas o base64 do documento (remover o prefixo data:image/...;base64,)
        let cnhDocumentBase64 = '';
        if (formData.cnhDocument) {
          const base64Match = formData.cnhDocument.match(/^data:.*;base64,(.+)$/);
          cnhDocumentBase64 = base64Match ? base64Match[1] : formData.cnhDocument;
        }

        const response = await createDriver({
          name: validatedData.name,
          cpf: validatedData.cpf,
          birthDate: validatedData.birthDate,
          cnhCategory: validatedData.cnhCategory,
          cnhValidity: validatedData.cnhValidity,
          cnhDocumentBase64,
          branches: branchIds,
        });

        if (response.success && response.data) {
          // Adicionar o motorista aos dados locais com os dados retornados pela API
          const newDriver: Driver = {
            id: response.data.driver.id,
            name: response.data.driver.name,
            cpf: response.data.driver.cpf,
            birthDate: response.data.driver.birthDate,
            cnhCategory: response.data.driver.cnhCategory,
            cnhValidity: response.data.driver.cnhValidity,
            branches: validatedData.branches, // Manter os nomes das branches
            active: true,
            cnhDocument: formData.cnhDocument,
          };

          addDriver(newDriver);

          toast({
            title: 'Motorista cadastrado',
            description: response.message || `${validatedData.name} foi adicionado com sucesso.`,
          });
        }
      }

      handleDialogClose();
    } catch (error) {
      if (error instanceof ApiError) {
        // Tratar erros de validação da API
        if (error.validationErrors) {
          const fieldErrors: Record<string, string> = {};
          error.validationErrors.forEach((err) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
          
          toast({
            title: 'Erro de validação',
            description: 'Verifique os campos destacados',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro ao cadastrar motorista',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        toast({
          title: 'Erro de validação',
          description: 'Verifique os campos destacados',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro inesperado',
          description: 'Ocorreu um erro ao cadastrar o motorista',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
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

  const confirmDelete = async () => {
    if (driverToDelete) {
      try {
        setIsSubmitting(true);
        const response = await deleteDriverApi(driverToDelete.id);
        
        if (response.success) {
          toast({
            title: 'Motorista removido',
            description: `${driverToDelete.name} foi removido do sistema.`,
          });
          setDeleteDialogOpen(false);
          setDriverToDelete(null);
          
          // Recarrega a lista de motoristas
          loadDrivers();
        } else {
          throw new Error(response.error?.message || 'Erro ao excluir motorista');
        }
      } catch (error) {
        console.error('Erro ao excluir motorista:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao excluir',
          description: error instanceof Error ? error.message : 'Não foi possível excluir o motorista. Tente novamente.',
        });
      } finally {
        setIsSubmitting(false);
      }
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

  // Convert API drivers to local format
  const convertedApiDrivers: Driver[] = apiDrivers.map(apiDriver => ({
    id: apiDriver.id,
    name: apiDriver.name,
    cpf: apiDriver.cpf,
    birthDate: apiDriver.birthDate,
    cnhCategory: apiDriver.cnhCategory,
    cnhValidity: apiDriver.cnhValidity,
    branches: apiDriver.branches.map(branch => branch.company.name),
    active: apiDriver.active,
    cnhDocument: apiDriver.cnhDocumentUrl || undefined,
  }));

  const filteredDrivers = convertedApiDrivers.filter(driver => {
    const search = searchTerm.toLowerCase();
    return (
      driver.name.toLowerCase().includes(search) ||
      driver.cpf.includes(search) ||
      driver.cnhCategory.toLowerCase().includes(search)
    );
  });

  const displayedDrivers = filteredDrivers;

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
            <DialogHeader>
              <DialogTitle>{editingDriver ? 'Editar Motorista' : 'Cadastrar Motorista'}</DialogTitle>
              <DialogDescription>
                {editingDriver ? 'Atualize as informações do motorista.' : 'Adicione um novo motorista à sua frota.'}
              </DialogDescription>
            </DialogHeader>

            <DriverForm
              onSubmit={async (driverData) => {
                setIsSubmitting(true);
                try {
                  if (editingDriver) {
                    // Modo edição - continua usando mock
                    updateDriver(editingDriver.id, driverData);
                    toast({
                      title: 'Motorista atualizado',
                      description: `${driverData.name} foi atualizado com sucesso.`,
                    });
                  } else {
                    // Modo criação - chama a API
                    const branchIds = driverData.branches.map(b => parseInt(b));

                    // Extrair apenas o base64 do documento (remover o prefixo data:image/...;base64,)
                    let cnhDocumentBase64 = '';
                    if (driverData.cnhDocument) {
                      const base64Match = driverData.cnhDocument.match(/^data:.*;base64,(.+)$/);
                      cnhDocumentBase64 = base64Match ? base64Match[1] : driverData.cnhDocument;
                    }

                    const response = await createDriver({
                      name: driverData.name,
                      cpf: driverData.cpf,
                      birthDate: driverData.birthDate,
                      cnhCategory: driverData.cnhCategory,
                      cnhValidity: driverData.cnhValidity,
                      cnhDocumentBase64,
                      branches: branchIds,
                    });

                    if (response.success && response.data) {
                      toast({
                        title: 'Motorista cadastrado',
                        description: response.message || `${driverData.name} foi adicionado com sucesso.`,
                      });
                      
                      // Recarregar a lista de motoristas
                      const driversResponse = await fetchDrivers(currentPage, perPage);
                      if (driversResponse.success && driversResponse.data) {
                        setApiDrivers(driversResponse.data.data);
                        setTotalPages(driversResponse.data.pagination.totalPages);
                        setTotalDrivers(driversResponse.data.pagination.totalRecords);
                      }
                    }
                  }
                  handleDialogClose();
                } catch (error) {
                  if (error instanceof ApiError) {
                    toast({
                      title: 'Erro ao salvar motorista',
                      description: error.message,
                      variant: 'destructive',
                    });
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              onCancel={handleDialogClose}
              initialData={editingDriver || undefined}
              existingCpfs={allDrivers.map(d => d.cpf)}
              companies={companies()}
            />
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : displayedDrivers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum motorista encontrado</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayedDrivers.map((driver) => {
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

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

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
