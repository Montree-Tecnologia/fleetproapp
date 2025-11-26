import { useState, useEffect } from 'react';
import { useMockData, User } from '@/hooks/useMockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createUser, getUsers, UserResponse, deleteUser as deleteUserApi, toggleUserStatus, updateUser as updateUserApi } from '@/services/usersApi';
import { getCompaniesCombo, CompanyCombo } from '@/services/companiesApi';
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
import { UserPlus, Mail, Shield, Building2, Calendar, Trash2, Pencil, Search, Eye, Lock, Users as UsersIcon, KeyRound, Power, User as UserIcon } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';

const userSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
  email: z.string().trim().email('E-mail inválido').max(255, 'E-mail muito longo'),
  role: z.enum(['admin', 'manager', 'operator']),
  company: z.string().trim().min(1, 'Selecione a empresa de vínculo').max(100, 'Nome muito longo'),
});

export default function Users() {
  const { users, addUser, updateUser, deleteUser, companies } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'operator';
    company: string;
    linkedCompanies: string[];
    hasAccessToAllCompanies: boolean;
  }>({
    name: '',
    email: '',
    role: 'manager',
    company: '',
    linkedCompanies: [],
    hasAccessToAllCompanies: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userForPasswordReset, setUserForPasswordReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const allUsers = users();
  const [allCompanies, setAllCompanies] = useState<CompanyCombo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [apiUsers, setApiUsers] = useState<UserResponse[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const perPage = 10;

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const response = await getCompaniesCombo();
        if (response.success && response.data) {
          setAllCompanies(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar empresas',
          description: 'Não foi possível carregar a lista de empresas.',
        });
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await getUsers({ page: currentPage, perPage });
        if (response.success && response.data) {
          setApiUsers(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
          setTotalRecords(response.data.pagination.totalRecords);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar usuários',
          description: 'Não foi possível carregar a lista de usuários.',
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [currentPage, perPage, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = userSchema.parse(formData);
      
      if (allUsers.some(u => u.email === validatedData.email && u.id !== editingUser?.id)) {
        setErrors({ email: 'E-mail já cadastrado' });
        return;
      }

      if (editingUser) {
        setIsSubmitting(true);
        
        const response = await updateUserApi(editingUser.id, {
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
          companyId: validatedData.company,
          linkedCompanies: formData.linkedCompanies,
          hasAccessToAllCompanies: formData.hasAccessToAllCompanies,
        });

        if (response.success) {
          toast({
            title: 'Usuário atualizado',
            description: `${validatedData.name} foi atualizado com sucesso.`,
          });
          
          handleDialogClose();
          
          // Recarregar lista de usuários
          const usersResponse = await getUsers({ page: currentPage, perPage });
          if (usersResponse.success && usersResponse.data) {
            setApiUsers(usersResponse.data.data);
            setTotalPages(usersResponse.data.pagination.totalPages);
            setTotalRecords(usersResponse.data.pagination.totalRecords);
          }
        } else {
          throw new Error(response.error?.message || 'Erro ao atualizar usuário');
        }
      } else {
        setIsSubmitting(true);
        
        const response = await createUser({
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
          companyId: validatedData.company,
          linkedCompanies: formData.linkedCompanies,
          hasAccessToAllCompanies: formData.hasAccessToAllCompanies,
        });

        if (response.success) {
          toast({
            title: 'Usuário criado',
            description: `${validatedData.name} foi adicionado com sucesso.`,
          });
          
          handleDialogClose();
          // Recarregar lista de usuários
          const response = await getUsers({ page: currentPage, perPage });
          if (response.success && response.data) {
            setApiUsers(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
            setTotalRecords(response.data.pagination.totalRecords);
          }
        } else {
          throw new Error(response.error?.message || 'Erro ao criar usuário');
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Erro ao processar usuário:', error);
        toast({
          variant: 'destructive',
          title: editingUser ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário',
          description: error instanceof Error ? error.message : 'Não foi possível processar o usuário. Tente novamente.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      linkedCompanies: user.linkedCompanies || [],
      hasAccessToAllCompanies: user.hasAccessToAllCompanies || false,
    });
    setErrors({});
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'manager',
      company: '',
      linkedCompanies: [],
      hasAccessToAllCompanies: false,
    });
    setErrors({});
  };

  const toggleCompany = (companyId: string) => {
    if (formData.linkedCompanies.includes(companyId)) {
      setFormData({
        ...formData,
        linkedCompanies: formData.linkedCompanies.filter(id => id !== companyId),
      });
    } else {
      setFormData({
        ...formData,
        linkedCompanies: [...formData.linkedCompanies, companyId],
      });
    }
  };

  const toggleAllCompanies = (checked: boolean) => {
    setFormData({
      ...formData,
      hasAccessToAllCompanies: checked,
      linkedCompanies: checked ? [] : formData.linkedCompanies,
    });
  };

  const handleToggleActive = (userId: string, userName: string, currentStatus: boolean) => {
    setUserToToggle({ id: userId, name: userName, currentStatus });
    setToggleStatusDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      const response = await toggleUserStatus(userToToggle.id);
      
      if (response.success) {
        toast({
          title: userToToggle.currentStatus ? 'Usuário desativado' : 'Usuário ativado',
          description: 'Status atualizado com sucesso.',
        });
        
        // Recarregar lista de usuários
        const usersResponse = await getUsers({ page: currentPage, perPage });
        if (usersResponse.success && usersResponse.data) {
          setApiUsers(usersResponse.data.data);
          setTotalPages(usersResponse.data.pagination.totalPages);
          setTotalRecords(usersResponse.data.pagination.totalRecords);
        }
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar status',
        description: 'Não foi possível alterar o status do usuário.',
      });
    } finally {
      setToggleStatusDialogOpen(false);
      setUserToToggle(null);
    }
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await deleteUserApi(userToDelete.id);
      
      if (response.success) {
        toast({
          title: 'Usuário excluído',
          description: `${userToDelete.name} foi removido com sucesso.`,
        });
        
        // Recarregar lista de usuários
        const usersResponse = await getUsers({ page: currentPage, perPage });
        if (usersResponse.success && usersResponse.data) {
          setApiUsers(usersResponse.data.data);
          setTotalPages(usersResponse.data.pagination.totalPages);
          setTotalRecords(usersResponse.data.pagination.totalRecords);
        }
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir usuário',
        description: 'Não foi possível excluir o usuário.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'default',
      manager: 'secondary',
      operator: 'outline',
    } as const;
    
    const labels = {
      admin: 'Administrador',
      manager: 'Gestor',
      operator: 'Operador',
    };

    return (
      <Badge variant={variants[role as keyof typeof variants]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const getCompanyName = (companyId: string) => {
    const company = allCompanies.find(c => c.id.toString() === companyId);
    return company ? company.name : companyId;
  };

  const handleResetPasswordClick = (user: User) => {
    setUserForPasswordReset(user);
    setNewPassword('');
    setResetPasswordDialogOpen(true);
  };

  const handleResetPassword = () => {
    if (!userForPasswordReset) return;

    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length > 50) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter no máximo 50 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    // Aqui você implementaria a lógica de redefinir senha
    // Por enquanto, apenas mostramos uma mensagem de sucesso
    toast({
      title: 'Senha redefinida',
      description: `Nova senha criada para ${userForPasswordReset.name}.`,
    });

    setResetPasswordDialogOpen(false);
    setUserForPasswordReset(null);
    setNewPassword('');
  };

  // Converter UserResponse da API para o formato User usado no componente
  const convertApiUserToUser = (apiUser: UserResponse): User => ({
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    company: apiUser.primaryCompanyId,
    active: apiUser.active,
    createdAt: apiUser.createdAt,
    linkedCompanies: apiUser.linkedCompanies.map(lc => lc.companyId),
    hasAccessToAllCompanies: apiUser.hasAccessToAllCompanies,
  });

  // Filtrar e converter usuários da API
  const filteredUsers = apiUsers
    .map(convertApiUserToUser)
    .filter(user => {
      const search = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        getCompanyName(user.company).toLowerCase().includes(search)
      );
    });

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Usuários</h2>
            <p className="text-sm lg:text-base text-muted-foreground">
              Gerencie usuários e permissões do sistema
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Atualize as informações do usuário.' : 'Adicione um novo usuário ao sistema.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
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
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: '' });
                    }}
                    placeholder="joao@empresa.com"
                    maxLength={255}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Perfil</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'manager' | 'operator') =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Gestor</SelectItem>
                      <SelectItem value="operator">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.role === 'admin' && 'Acesso total ao sistema'}
                    {formData.role === 'manager' && 'Acesso operacional completo'}
                    {formData.role === 'operator' && 'Acesso limitado às operações'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa (Vínculo Empregatício) *</Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value) => {
                      setFormData({ ...formData, company: value });
                      setErrors({ ...errors, company: '' });
                    }}
                    disabled={isLoadingCompanies}
                  >
                    <SelectTrigger id="company">
                      <SelectValue placeholder={isLoadingCompanies ? "Carregando..." : "Selecione a empresa de vínculo"} />
                    </SelectTrigger>
                    <SelectContent>
                      {allCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Matriz/Filial de vínculo empregatício do usuário
                  </p>
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Acesso às Empresas *</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-3 bg-primary/5 rounded-md border border-primary/20">
                      <Checkbox
                        id="all-companies"
                        checked={formData.hasAccessToAllCompanies}
                        onCheckedChange={(checked) => toggleAllCompanies(checked as boolean)}
                      />
                      <Label
                        htmlFor="all-companies"
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        Todas as Empresas
                        <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                          Acesso a todas empresas atuais e futuras
                        </span>
                      </Label>
                    </div>

                    {!formData.hasAccessToAllCompanies && (
                      <div className="space-y-2 mt-3">
                        <p className="text-sm text-muted-foreground">Ou selecione empresas específicas:</p>
                        <div className="max-h-[200px] overflow-y-auto space-y-2 p-2 border rounded-md">
                          {isLoadingCompanies ? (
                            <p className="text-sm text-muted-foreground">Carregando empresas...</p>
                          ) : allCompanies.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhuma empresa disponível</p>
                          ) : (
                            allCompanies.map((company) => (
                              <div key={company.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`company-${company.id}`}
                                  checked={formData.linkedCompanies.includes(company.id.toString())}
                                  onCheckedChange={() => toggleCompany(company.id.toString())}
                                />
                                <Label
                                  htmlFor={`company-${company.id}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {company.name}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline-destructive" onClick={handleDialogClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : (editingUser ? 'Atualizar' : 'Criar Usuário')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome, e-mail ou empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingUsers ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <UserIcon className="h-8 w-8 text-primary" />
                <div className="flex gap-2">
                  {getRoleBadge(user.role)}
                  <Badge variant={user.active ? "default" : "destructive"} className={user.active ? "bg-green-600 hover:bg-green-700" : ""}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              <CardTitle className="mt-4">{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col h-full">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{getCompanyName(user.company)}</span>
              </div>
              <div className="text-sm font-medium text-primary min-h-[20px]">
                <Shield className="h-4 w-4 inline mr-1" />
                {user.hasAccessToAllCompanies ? 'Todas as empresas' : `${user.linkedCompanies?.length || 0} empresa(s)`}
              </div>
              
              <div className="flex gap-2 pt-3 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewDetails(user)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={user.active ? 'outline' : 'default'}
                  onClick={() => handleToggleActive(user.id, user.name, user.active)}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResetPasswordClick(user)}
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteClick(user.id, user.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>

      {!isLoadingUsers && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredUsers.length} de {totalRecords} usuários
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={toggleStatusDialogOpen} onOpenChange={setToggleStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {userToToggle?.currentStatus ? 'desativar' : 'ativar'} o usuário <strong>{userToToggle?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              {userToToggle?.currentStatus ? 'Desativar' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedUser.name}
                  {!selectedUser.active && (
                    <Badge variant="outline" className="text-xs">
                      Inativo
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Detalhes completos do usuário
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Informações Básicas
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                      <p className="text-sm font-medium">{selectedUser.name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">E-mail</Label>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedUser.email}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Perfil</Label>
                      <div className="mt-1">
                        {getRoleBadge(selectedUser.role)}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <p className="text-sm font-medium">
                        {selectedUser.active ? '✓ Ativo' : '✗ Inativo'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Data de Cadastro</Label>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Vínculo Empregatício
                  </h3>
                  
                  <div className="pl-6">
                    <Label className="text-xs text-muted-foreground">Empresa de Vínculo</Label>
                    <p className="text-sm font-medium">{getCompanyName(selectedUser.company)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    Acesso às Empresas
                  </h3>
                  
                  <div className="pl-6 space-y-2">
                    {selectedUser.hasAccessToAllCompanies ? (
                      <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                        <p className="text-sm font-medium">✓ Todas as Empresas</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Acesso total a todas empresas atuais e futuras
                        </p>
                      </div>
                    ) : selectedUser.linkedCompanies && selectedUser.linkedCompanies.length > 0 ? (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Empresas Vinculadas ({selectedUser.linkedCompanies.length})
                        </Label>
                        <div className="space-y-1">
                          {selectedUser.linkedCompanies.map((companyId) => (
                            <div key={companyId} className="text-sm p-2 bg-muted/50 rounded">
                              • {getCompanyName(companyId)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma empresa vinculada
                      </p>
                    )}
                  </div>
                </div>

                {selectedUser.customPermissions && Object.keys(selectedUser.customPermissions).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Permissões Personalizadas
                    </h3>
                    
                    <div className="pl-6 text-sm text-muted-foreground">
                      Este usuário possui permissões personalizadas configuradas
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleResetPasswordClick(selectedUser);
                  }}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Redefinir Senha
                </Button>
                <Button
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleEdit(selectedUser);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Redefinir Senha
            </DialogTitle>
            <DialogDescription>
              {userForPasswordReset && (
                <>Criar nova senha para <strong>{userForPasswordReset.name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha *</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Esta senha substituirá a senha atual do usuário
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline-destructive"
              onClick={() => {
                setResetPasswordDialogOpen(false);
                setNewPassword('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleResetPassword}>
              <KeyRound className="mr-2 h-4 w-4" />
              Redefinir Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
