import { useState } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { Building2, MapPin, Plus, Pencil, Trash2, Search, Power, Eye } from 'lucide-react';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { useMockData, Company } from '@/hooks/useMockData';
import { useToast } from '@/hooks/use-toast';

export default function Companies() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toggleActiveDialogOpen, setToggleActiveDialogOpen] = useState(false);
  const [companyToToggle, setCompanyToToggle] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);
  const { companies, addCompany, updateCompany, deleteCompany } = useMockData();
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

  const handleToggleActive = (companyId: string, companyName: string, currentStatus: boolean) => {
    setCompanyToToggle({ id: companyId, name: companyName, currentStatus });
    setToggleActiveDialogOpen(true);
  };

  const confirmToggleActive = () => {
    if (companyToToggle) {
      updateCompany(companyToToggle.id, { active: !companyToToggle.currentStatus });
      toast({
        title: companyToToggle.currentStatus ? 'Empresa inativada' : 'Empresa ativada',
        description: 'Status atualizado com sucesso.',
      });
      setToggleActiveDialogOpen(false);
      setCompanyToToggle(null);
      
      // Atualiza a empresa sendo visualizada se estiver aberta
      if (viewingCompany && viewingCompany.id === companyToToggle.id) {
        setViewingCompany({ ...viewingCompany, active: !companyToToggle.currentStatus });
      }
    }
  };

  const handleViewDetails = (company: Company) => {
    setViewingCompany(company);
    setDetailsDialogOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const filteredCompanies = allCompanies.filter(company => {
    const search = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(search) ||
      company.cnpj.includes(search) ||
      company.city.toLowerCase().includes(search)
    );
  });

  const { displayedItems, hasMore, loadMoreRef } = useInfiniteScroll(filteredCompanies, {
    initialItemsCount: 20,
    itemsPerPage: 10
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Empresas e Filiais</h2>
            <p className="text-sm lg:text-base text-muted-foreground">
              Gerencie matriz e filiais da organização
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
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
                onCancel={() => handleDialogClose(false)}
                companiesExternal={allCompanies}
                addCompanyExternal={addCompany}
                updateCompanyExternal={updateCompany}
              />
            </DialogContent>
          </Dialog>
        </div>
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

      <AlertDialog open={toggleActiveDialogOpen} onOpenChange={setToggleActiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar {companyToToggle?.currentStatus ? 'inativação' : 'ativação'}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {companyToToggle?.currentStatus ? 'inativar' : 'ativar'} a empresa <strong>{companyToToggle?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleActive}>
              {companyToToggle?.currentStatus ? 'Inativar' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa - {viewingCompany?.name}</DialogTitle>
            <DialogDescription>
              Informações completas da empresa
            </DialogDescription>
          </DialogHeader>

          {viewingCompany && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{viewingCompany.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CNPJ:</span>
                    <p className="font-medium font-mono">{viewingCompany.cnpj}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">
                      <Badge variant={viewingCompany.type === 'matriz' ? 'default' : 'secondary'}>
                        {viewingCompany.type === 'matriz' ? 'Matriz' : 'Filial'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">
                      <Badge variant={viewingCompany.active ? "default" : "destructive"} className={viewingCompany.active ? "bg-green-600 hover:bg-green-700" : ""}>
                        {viewingCompany.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cidade:</span>
                    <p className="font-medium">{viewingCompany.city}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <p className="font-medium">{viewingCompany.state}</p>
                  </div>
                  {viewingCompany.type === 'filial' && viewingCompany.matrizId && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Matriz:</span>
                      <p className="font-medium">
                        {allCompanies.find(c => c.id === viewingCompany.matrizId)?.name || 'Não encontrada'}
                      </p>
                    </div>
                  )}
                  {viewingCompany.type === 'matriz' && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Filiais Vinculadas:</span>
                      <p className="font-medium">
                        {getCompanyBranches(viewingCompany.id)} {getCompanyBranches(viewingCompany.id) === 1 ? 'filial' : 'filiais'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleEdit(viewingCompany);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant={viewingCompany.active ? 'outline-destructive' : 'default'}
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleToggleActive(viewingCompany.id, viewingCompany.name, viewingCompany.active);
                  }}
                >
                  {viewingCompany.active ? 'Inativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
        {displayedItems.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Building2 className="h-8 w-8 text-primary" />
                <div className="flex gap-2">
                  <Badge variant={company.type === 'matriz' ? 'default' : 'secondary'}>
                    {company.type === 'matriz' ? 'Matriz' : 'Filial'}
                  </Badge>
                  <Badge variant={company.active ? "default" : "destructive"} className={company.active ? "bg-green-600 hover:bg-green-700" : ""}>
                    {company.active ? 'Ativa' : 'Inativa'}
                  </Badge>
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
                {company.type === 'filial' && company.matrizId && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    <span className="text-xs">
                      Matriz: {allCompanies.find(c => c.id === company.matrizId)?.name || 'Não encontrada'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-3 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewDetails(company)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(company)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={company.active ? 'outline' : 'default'}
                  onClick={() => handleToggleActive(company.id, company.name, company.active)}
                >
                  <Power className="h-4 w-4" />
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

      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Carregando mais empresas...</div>
        </div>
      )}
    </div>
  );
}
