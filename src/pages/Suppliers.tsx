import { useState } from 'react';
import { useMockData, Supplier } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Building, MapPin, Pencil, Trash2, Eye, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { SupplierForm } from '@/components/forms/SupplierForm';
import { useToast } from '@/hooks/use-toast';

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const allSuppliers = suppliers();

  const handleSubmit = (data: any) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, data);
      toast({
        title: 'Fornecedor atualizado',
        description: 'Fornecedor atualizado com sucesso.',
      });
    } else {
      addSupplier(data);
      toast({
        title: 'Fornecedor cadastrado',
        description: 'Fornecedor adicionado com sucesso.',
      });
    }
    handleDialogClose();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteClick = (supplierId: string, supplierName: string) => {
    setSupplierToDelete({ id: supplierId, name: supplierName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id);
      toast({
        title: 'Fornecedor removido',
        description: `${supplierToDelete.name} foi removido do sistema.`,
      });
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleViewDetails = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setDetailsDialogOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      gas_station: { label: 'Posto', className: 'bg-chart-4 text-white' },
      workshop: { label: 'Oficina', className: 'bg-chart-5 text-white' },
      dealer: { label: 'Concessionária', className: 'bg-chart-1 text-white' }
    };
    const variant = variants[type as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      gas_station: 'Posto de Combustível',
      workshop: 'Oficina',
      dealer: 'Concessionária'
    };
    return labels[type as keyof typeof labels];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">
            Cadastro de fornecedores e prestadores de serviço
          </p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? 'Atualize as informações do fornecedor' : 'Adicione um novo fornecedor ou prestador de serviço'}
              </DialogDescription>
            </DialogHeader>
            <SupplierForm
              onSubmit={handleSubmit}
              onCancel={handleDialogClose}
              initialData={editingSupplier}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome fantasia, razão social ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allSuppliers
          .filter(supplier => {
            const search = searchTerm.toLowerCase();
            return (
              supplier.fantasyName.toLowerCase().includes(search) ||
              supplier.name.toLowerCase().includes(search) ||
              supplier.cnpj.includes(search) ||
              supplier.city.toLowerCase().includes(search)
            );
          })
          .map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{supplier.fantasyName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{supplier.name}</p>
                  </div>
                </div>
                {getTypeBadge(supplier.type)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{supplier.city}, {supplier.state}</p>
                    <p className="text-xs text-muted-foreground">CNPJ: {supplier.cnpj}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Filiais Vinculadas:</p>
                <div className="flex flex-wrap gap-1">
                  {supplier.branches.map((branch, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {branch}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewDetails(supplier)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(supplier)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteClick(supplier.id, supplier.fantasyName)}
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
              Tem certeza que deseja excluir o fornecedor <strong>{supplierToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Fornecedor</DialogTitle>
            <DialogDescription>
              Informações completas do fornecedor
            </DialogDescription>
          </DialogHeader>

          {viewingSupplier && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome Fantasia:</span>
                    <p className="font-medium">{viewingSupplier.fantasyName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Razão Social:</span>
                    <p className="font-medium">{viewingSupplier.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CNPJ:</span>
                    <p className="font-medium font-mono">{viewingSupplier.cnpj}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <div className="mt-1">
                      {getTypeBadge(viewingSupplier.type)}
                    </div>
                  </div>
                  {viewingSupplier.brand && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Bandeira:</span>
                      <p className="font-medium">{viewingSupplier.brand}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Localização</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cidade:</span>
                    <p className="font-medium">{viewingSupplier.city}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <p className="font-medium">{viewingSupplier.state}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Filiais Vinculadas</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingSupplier.branches.map((branch, index) => (
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
                    handleEdit(viewingSupplier);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
