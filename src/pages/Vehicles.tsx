import { useMockData, Vehicle } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Truck, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { VehicleForm } from '@/components/forms/VehicleForm';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Vehicles() {
  const { vehicles, drivers, getRefrigerationUnitByVehicle, addVehicle, updateVehicle, deleteVehicle } = useMockData();
  const allVehicles = vehicles();
  const allDrivers = drivers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const getDriverName = (driverId?: string) => {
    if (!driverId) return null;
    const driver = allDrivers.find(d => d.id === driverId);
    return driver?.name;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Ativo', className: 'bg-success text-success-foreground' },
      maintenance: { label: 'Manutenção', className: 'bg-warning text-warning-foreground' },
      inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground' }
    };
    const variant = variants[status as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete.id);
      toast.success(`Veículo ${vehicleToDelete.plate} excluído com sucesso!`);
      setVehicleToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingVehicle(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Frota</h2>
          <p className="text-muted-foreground">
            Controle completo dos veículos da sua empresa
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</DialogTitle>
            <DialogDescription>
              {editingVehicle ? 'Atualize os dados do veículo' : 'Preencha os dados do veículo para cadastrá-lo no sistema'}
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            initialData={editingVehicle || undefined}
            onSubmit={(data) => {
              if (editingVehicle) {
                updateVehicle(editingVehicle.id, data);
                toast.success('Veículo atualizado com sucesso!');
              } else {
                addVehicle(data);
                toast.success('Veículo cadastrado com sucesso!');
              }
              handleDialogClose(false);
            }}
            onCancel={() => handleDialogClose(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o veículo <strong>{vehicleToDelete?.plate}</strong>? Esta ação não pode ser desfeita.
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
                    <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(vehicle.status)}
                  {getRefrigerationUnitByVehicle(vehicle.id) && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                      Refrigerado
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium">{vehicle.vehicleType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Marca:</span>
                  <p className="font-medium">{vehicle.brand}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ano:</span>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">KM Atual:</span>
                  <p className="font-medium">{vehicle.currentKm.toLocaleString('pt-BR')}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Filiais Vinculadas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vehicle.branches.map((branch, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {branch}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {vehicle.hasComposition && vehicle.compositionPlates && vehicle.compositionPlates.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Composições:</span>
                  <p className="text-sm font-medium">
                    {vehicle.compositionPlates.length} {vehicle.compositionPlates.length === 1 ? 'reboque' : 'reboques'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total de eixos: {vehicle.axles + (vehicle.compositionAxles?.reduce((sum, axles) => sum + axles, 0) || 0)}
                  </p>
                </div>
              )}
              {getDriverName(vehicle.driverId) && (
                <div className="pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Motorista:</span>
                  <p className="text-sm font-medium">{getDriverName(vehicle.driverId)}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEdit(vehicle)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(vehicle)}
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
