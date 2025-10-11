import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Building2, MapPin, Plus, Pencil, Trash2, Search, Power } from 'lucide-react';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { useMockData, Company } from '@/hooks/useMockData';
import { useToast } from '@/hooks/use-toast';

export default function Companies() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { companies, updateCompany, deleteCompany } = useMockData();
  const { toast } = useToast();
  const allCompanies = companies();

  const getCompanyBranches = (matrizId: string) => {
    return allCompanies.filter(c => c.type === 'filial' && c.matrizId === matrizId).length;
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    if (company.type === 'matriz' && getCompanyBranches(company.id) > 0) {
      toast({
        title: 'Não é possível excluir',
        description: 'Esta matriz possui filiais vinculadas.',
        variant: 'destructive',
      });
      return;
    }
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      deleteCompany(companyToDelete.id);
      toast({
        title: 'Empresa excluída',
        description: `${companyToDelete.name} foi removida do sistema.`,
      });
      setCompanyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCompany(null);
    }
  };

  const handleToggleActive = (companyId: string, currentStatus: boolean) => {
    updateCompany(companyId, { active: !currentStatus });
    toast({
      title: currentStatus ? 'Empresa inativada' : 'Empresa ativada',
      description: 'Status atualizado com sucesso.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Empresas e Filiais</h2>
          <p className="text-muted-foreground">
            Gerencie matriz e filiais da organização
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Cadastrar Empresa'}</DialogTitle>
              <DialogDescription>
                {editingCompany ? 'Atualize os dados da empresa' : 'Adicione uma nova matriz ou filial'}
              </DialogDescription>
            </DialogHeader>
            <CompanyForm 
              initialData={editingCompany || undefined}
              onSuccess={() => handleDialogClose(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{companyToDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allCompanies
          .filter(company => {
            const search = searchTerm.toLowerCase();
            return (
              company.name.toLowerCase().includes(search) ||
              company.cnpj.includes(search) ||
              company.city.toLowerCase().includes(search)
            );
          })
          .map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Building2 className="h-8 w-8 text-primary" />
                <div className="flex gap-2">
                  <Badge variant={company.type === 'matriz' ? 'default' : 'secondary'}>
                    {company.type === 'matriz' ? 'Matriz' : 'Filial'}
                  </Badge>
                  {!company.active && (
                    <Badge variant="outline">
                      Inativa
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="mt-4">{company.name}</CardTitle>
              <CardDescription>{company.cnpj}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col h-full">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{company.city} - {company.state}</span>
              </div>
              <div className="text-sm font-medium text-primary min-h-[20px]">
                {company.type === 'matriz' && (
                  <>
                    {getCompanyBranches(company.id)} {getCompanyBranches(company.id) === 1 ? 'filial' : 'filiais'}
                  </>
                )}
              </div>
              
              <div className="flex gap-2 pt-3 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(company)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={company.active ? 'destructive' : 'default'}
                  className="flex-1"
                  onClick={() => handleToggleActive(company.id, company.active)}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {company.active ? 'Inativar' : 'Ativar'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(company)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
