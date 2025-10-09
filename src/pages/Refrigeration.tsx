import { useState } from 'react';
import { useMockData, RefrigerationUnit } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Snowflake, Thermometer, Pencil, Trash2, Eye, Link2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { RefrigerationForm } from '@/components/forms/RefrigerationForm';
import { useToast } from '@/hooks/use-toast';

export default function Refrigeration() {
  const { refrigerationUnits, vehicles, addRefrigerationUnit, updateRefrigerationUnit, deleteRefrigerationUnit } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<RefrigerationUnit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<{ id: string; name: string } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<RefrigerationUnit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const allUnits = refrigerationUnits();
  const allVehicles = vehicles();

  const handleSubmit = (data: any) => {
    if (editingUnit) {
      updateRefrigerationUnit(editingUnit.id, data);
      toast({
        title: 'Equipamento atualizado',
        description: 'Aparelho de refrigeração atualizado com sucesso.',
      });
    } else {
      addRefrigerationUnit(data);
      toast({
        title: 'Equipamento cadastrado',
        description: 'Aparelho de refrigeração cadastrado com sucesso.',
      });
    }
    handleDialogClose();
  };

  const handleEdit = (unit: RefrigerationUnit) => {
    setEditingUnit(unit);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditingUnit(null);
  };

  const handleDeleteClick = (unitId: string, unitName: string) => {
    setUnitToDelete({ id: unitId, name: unitName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (unitToDelete) {
      deleteRefrigerationUnit(unitToDelete.id);
      toast({
        title: 'Equipamento removido',
        description: `${unitToDelete.name} foi removido do sistema.`,
      });
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    }
  };

  const handleViewDetails = (unit: RefrigerationUnit) => {
    setViewingUnit(unit);
    setDetailsDialogOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      freezer: { label: 'Freezer', className: 'bg-chart-1 text-white' },
      cooled: { label: 'Resfriado', className: 'bg-chart-2 text-white' },
      climatized: { label: 'Climatizado', className: 'bg-chart-3 text-white' }
    };
    const variant = variants[type as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      freezer: 'Freezer',
      cooled: 'Resfriado',
      climatized: 'Climatizado'
    };
    return labels[type as keyof typeof labels];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Ativo', className: 'bg-success text-success-foreground' },
      defective: { label: 'Defeito', className: 'bg-destructive text-destructive-foreground' },
      maintenance: { label: 'Manutenção', className: 'bg-warning text-warning-foreground' },
      sold: { label: 'Vendido', className: 'bg-muted text-muted-foreground' }
    };
    const variant = variants[status as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleStatusChange = (unitId: string, newStatus: string, hasVehicle: boolean) => {
    // Validação: se vinculado a veículo, só permite active ou defective
    if (hasVehicle && newStatus !== 'active' && newStatus !== 'defective') {
      toast({
        title: 'Operação inválida',
        description: 'Equipamentos vinculados só podem estar ativos ou com defeito',
        variant: 'destructive',
      });
      return;
    }
    
    updateRefrigerationUnit(unitId, { status: newStatus as any });
    const statusLabels = {
      active: 'Ativo',
      defective: 'Defeito',
      maintenance: 'Manutenção',
      sold: 'Vendido'
    };
    toast({
      title: 'Status atualizado',
      description: `Status alterado para ${statusLabels[newStatus as keyof typeof statusLabels]}`,
    });
  };

  const handleVehicleLink = (unitId: string, vehicleId: string) => {
    const unit = allUnits.find(u => u.id === unitId);
    if (!unit) return;

    const actualVehicleId = vehicleId === 'none' ? undefined : vehicleId;

    // Se está vinculando a um veículo e o status não é válido, ajusta para active
    if (actualVehicleId && unit.status !== 'active' && unit.status !== 'defective') {
      updateRefrigerationUnit(unitId, { 
        vehicleId: actualVehicleId,
        status: 'active'
      });
      toast({
        title: 'Vinculação realizada',
        description: 'Equipamento vinculado e status ajustado para Ativo',
      });
    } else {
      updateRefrigerationUnit(unitId, { vehicleId: actualVehicleId });
      toast({
        title: actualVehicleId ? 'Vinculação realizada' : 'Vínculo removido',
        description: actualVehicleId ? 'Equipamento vinculado ao veículo' : 'Equipamento desvinculado',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aparelhos de Refrigeração</h2>
          <p className="text-muted-foreground">
            Controle dos equipamentos de refrigeração da frota
          </p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aparelho
          </Button>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUnit ? 'Editar Equipamento de Refrigeração' : 'Cadastrar Equipamento de Refrigeração'}</DialogTitle>
              <DialogDescription>
                {editingUnit ? 'Atualize as informações do aparelho' : 'Adicione um novo aparelho de refrigeração à frota'}
              </DialogDescription>
            </DialogHeader>
            <RefrigerationForm
              onSubmit={handleSubmit}
              onCancel={handleDialogClose}
              vehicles={allVehicles}
              initialData={editingUnit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por marca, modelo ou número de série..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {allUnits
          .filter(unit => {
            const search = searchTerm.toLowerCase();
            return (
              unit.brand.toLowerCase().includes(search) ||
              unit.model.toLowerCase().includes(search) ||
              unit.serialNumber.toLowerCase().includes(search)
            );
          })
          .map((unit) => {
          const vehicle = allVehicles.find(v => v.id === unit.vehicleId);
          return (
            <Card key={unit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                      <Snowflake className="h-6 w-6 text-chart-1" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{unit.brand} {unit.model}</CardTitle>
                      <p className="text-sm text-muted-foreground">SN: {unit.serialNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getTypeBadge(unit.type)}
                    {getStatusBadge(unit.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
                  <Thermometer className="h-5 w-5 text-chart-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Faixa de Temperatura</p>
                    <p className="text-xs text-muted-foreground">
                      {unit.minTemp}°C a {unit.maxTemp}°C
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Vincular a Veículo:</p>
                  <Select
                    value={unit.vehicleId || 'none'}
                    onValueChange={(value) => handleVehicleLink(unit.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem vínculo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem vínculo</SelectItem>
                      {allVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} - {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Alterar Status:</p>
                  <Select
                    value={unit.status}
                    onValueChange={(value) => handleStatusChange(unit.id, value, !!unit.vehicleId)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="defective">Defeito</SelectItem>
                      {!unit.vehicleId && (
                        <>
                          <SelectItem value="maintenance">Manutenção</SelectItem>
                          <SelectItem value="sold">Vendido</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewDetails(unit)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(unit)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(unit.id, `${unit.brand} ${unit.model}`)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allUnits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Snowflake className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum aparelho cadastrado</p>
            <p className="text-sm text-muted-foreground mb-4">
              Comece adicionando um aparelho de refrigeração
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Aparelho
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aparelho <strong>{unitToDelete?.name}</strong>?
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
            <DialogTitle>Detalhes do Equipamento de Refrigeração</DialogTitle>
            <DialogDescription>
              Informações completas do aparelho
            </DialogDescription>
          </DialogHeader>

          {viewingUnit && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Informações do Equipamento</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Marca:</span>
                    <p className="font-medium">{viewingUnit.brand}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Modelo:</span>
                    <p className="font-medium">{viewingUnit.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Número de Série:</span>
                    <p className="font-medium font-mono">{viewingUnit.serialNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <div className="mt-1">
                      {getTypeBadge(viewingUnit.type)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data de Instalação:</span>
                    <p className="font-medium">{formatDate(viewingUnit.installDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      {getStatusBadge(viewingUnit.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Especificações Técnicas</h3>
                <div className="p-4 bg-chart-1/5 rounded-lg border border-chart-1/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Thermometer className="h-6 w-6 text-chart-1" />
                    <div>
                      <p className="font-semibold">Faixa de Temperatura Operacional</p>
                      <p className="text-sm text-muted-foreground">Capacidade de refrigeração do equipamento</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Temperatura Mínima:</span>
                      <p className="text-xl font-bold text-chart-1">{viewingUnit.minTemp}°C</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temperatura Máxima:</span>
                      <p className="text-xl font-bold text-chart-1">{viewingUnit.maxTemp}°C</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Veículo Vinculado</h3>
                {viewingUnit.vehicleId ? (
                  (() => {
                    const vehicle = allVehicles.find(v => v.id === viewingUnit.vehicleId);
                    return vehicle ? (
                      <div className="p-4 bg-muted rounded-lg border border-border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Placa:</span>
                            <p className="font-medium">{vehicle.plate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Marca/Modelo:</span>
                            <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <p className="font-medium">{vehicle.vehicleType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ano:</span>
                            <p className="font-medium">{vehicle.manufacturingYear}/{vehicle.modelYear.toString().slice(-2)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Veículo não encontrado</p>
                    );
                  })()
                ) : (
                  <div className="p-4 bg-muted rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">Sem vínculo com veículo</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleEdit(viewingUnit);
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
