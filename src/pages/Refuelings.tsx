import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Fuel, Pencil, Trash2 } from 'lucide-react';
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
import { RefuelingForm } from '@/components/forms/RefuelingForm';
import { useToast } from '@/hooks/use-toast';

export default function Refuelings() {
  const { refuelings, vehicles, drivers, suppliers, addRefueling, updateRefueling, deleteRefueling } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingRefueling, setEditingRefueling] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refuelingToDelete, setRefuelingToDelete] = useState<string | null>(null);
  const allRefuelings = refuelings();
  const allVehicles = vehicles();
  const allDrivers = drivers();
  const allSuppliers = suppliers();

  const handleSubmit = (data: any) => {
    if (editingRefueling) {
      updateRefueling(editingRefueling.id, data);
      toast({
        title: 'Abastecimento atualizado',
        description: 'Abastecimento atualizado com sucesso.',
      });
    } else {
      addRefueling(data);
      toast({
        title: 'Abastecimento registrado',
        description: 'Abastecimento cadastrado com sucesso.',
      });
    }
    setOpen(false);
    setEditingRefueling(null);
  };

  const handleEdit = (refueling: any) => {
    setEditingRefueling(refueling);
    setOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setRefuelingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (refuelingToDelete) {
      deleteRefueling(refuelingToDelete);
      toast({
        title: 'Abastecimento excluído',
        description: 'Abastecimento excluído com sucesso.',
      });
      setRefuelingToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setEditingRefueling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abastecimentos</h2>
          <p className="text-muted-foreground">
            Controle de abastecimentos e custos com combustível
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Abastecimento
          </Button>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRefueling ? 'Editar' : 'Cadastrar'} Abastecimento</DialogTitle>
              <DialogDescription>
                {editingRefueling ? 'Edite os dados do' : 'Registre um novo'} abastecimento da frota
              </DialogDescription>
            </DialogHeader>
            <RefuelingForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setOpen(false);
                setEditingRefueling(null);
              }}
              vehicles={allVehicles}
              drivers={allDrivers}
              suppliers={allSuppliers}
              initialData={editingRefueling}
            />
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este abastecimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Abastecimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allRefuelings
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((refueling) => {
                const vehicle = allVehicles.find(v => v.id === refueling.vehicleId);
                const supplier = allSuppliers.find(s => s.id === refueling.supplierId);
                return (
                  <div
                    key={refueling.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                        <Fuel className="h-6 w-6 text-chart-4" />
                      </div>
                      <div>
                        <p className="font-medium">{vehicle?.plate} - {vehicle?.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {supplier?.fantasyName} • {supplier?.city}/{supplier?.state}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Motorista: {refueling.driver} • {refueling.km.toLocaleString('pt-BR')} km • {refueling.fuelType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          R$ {refueling.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {refueling.liters}L × R$ {refueling.pricePerLiter.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(refueling.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(refueling)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(refueling.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
