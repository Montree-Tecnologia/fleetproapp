import { useState } from 'react';
import { useMockData, User } from '@/hooks/useMockData';
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
import { UserPlus, Mail, Shield, Building2, Calendar, Trash2, Pencil, Search } from 'lucide-react';
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
import { PermissionsManager } from '@/components/PermissionsManager';
import { UserPermissions } from '@/hooks/useMockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

const userSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
  email: z.string().trim().email('E-mail inválido').max(255, 'E-mail muito longo'),
  role: z.enum(['admin', 'manager', 'operator']),
  company: z.string().trim().min(1, 'Empresa é obrigatória').max(100, 'Nome muito longo'),
});

export default function Users() {
  const { users, addUser, updateUser, deleteUser, companies } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'operator';
    company: string;
    linkedCompanies: string[];
    hasAccessToAllCompanies: boolean;
    customPermissions: UserPermissions;
  }>({
    name: '',
    email: '',
    role: 'manager',
    company: 'Transportadora Matriz',
    linkedCompanies: [],
    hasAccessToAllCompanies: false,
    customPermissions: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const allUsers = users();
  const allCompanies = companies();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = userSchema.parse(formData);
      
      if (allUsers.some(u => u.email === validatedData.email && u.id !== editingUser?.id)) {
        setErrors({ email: 'E-mail já cadastrado' });
        return;
      }

      if (editingUser) {
        updateUser(editingUser.id, {
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
          company: validatedData.company,
          linkedCompanies: formData.linkedCompanies,
          hasAccessToAllCompanies: formData.hasAccessToAllCompanies,
          customPermissions: formData.customPermissions,
        });

        toast({
          title: 'Usuário atualizado',
          description: `${validatedData.name} foi atualizado com sucesso.`,
        });
      } else {
        addUser({
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
          company: validatedData.company,
          linkedCompanies: formData.linkedCompanies,
          hasAccessToAllCompanies: formData.hasAccessToAllCompanies,
          active: true,
          customPermissions: formData.customPermissions,
        });

        toast({
          title: 'Usuário criado',
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      linkedCompanies: user.linkedCompanies || [],
      hasAccessToAllCompanies: user.hasAccessToAllCompanies || false,
      customPermissions: user.customPermissions || {},
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
      company: 'Transportadora Matriz',
      linkedCompanies: [],
      hasAccessToAllCompanies: false,
      customPermissions: {},
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

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    updateUser(userId, { active: !currentStatus });
    toast({
      title: currentStatus ? 'Usuário desativado' : 'Usuário ativado',
      description: 'Status atualizado com sucesso.',
    });
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    if (userId === '1' || userId === '2') {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir usuários padrão.',
        variant: 'destructive',
      });
      return;
    }
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      toast({
        title: 'Usuário removido',
        description: `${userToDelete.name} foi removido do sistema.`,
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões do sistema
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Atualize as informações do usuário.' : 'Adicione um novo usuário ao sistema e defina suas permissões.'}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="py-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="permissions">Permissões</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
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
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => {
                        setFormData({ ...formData, company: e.target.value });
                        setErrors({ ...errors, company: '' });
                      }}
                      placeholder="Nome da empresa"
                      maxLength={100}
                    />
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
                            {allCompanies.map((company) => (
                              <div key={company.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`company-${company.id}`}
                                  checked={formData.linkedCompanies.includes(company.id)}
                                  onCheckedChange={() => toggleCompany(company.id)}
                                />
                                <Label
                                  htmlFor={`company-${company.id}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {company.name}
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({company.cnpj})
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="mt-4">
                  <PermissionsManager
                    permissions={formData.customPermissions}
                    onChange={(permissions) => setFormData({ ...formData, customPermissions: permissions })}
                    role={formData.role}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit">{editingUser ? 'Atualizar' : 'Criar Usuário'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
        {allUsers
          .filter(user => {
            const search = searchTerm.toLowerCase();
            return (
              user.name.toLowerCase().includes(search) ||
              user.email.toLowerCase().includes(search) ||
              user.company.toLowerCase().includes(search)
            );
          })
          .map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {user.name}
                    {!user.active && (
                      <Badge variant="outline" className="text-xs">
                        Inativo
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </CardDescription>
                </div>
                {getRoleBadge(user.role)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{user.company}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex gap-2 pt-2">
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
                  className="flex-1"
                  onClick={() => handleToggleActive(user.id, user.active)}
                >
                  {user.active ? 'Desativar' : 'Ativar'}
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
        ))}
      </div>

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
    </div>
  );
}
