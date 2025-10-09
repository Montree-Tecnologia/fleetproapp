import { useMockData, Vehicle } from '@/hooks/useMockData';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Truck, Pencil, Trash2, Eye, FileText, Search, DollarSign } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { VehicleSaleForm, VehicleSale } from '@/components/forms/VehicleSaleForm';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Vehicles() {
  const { vehicles, drivers, refuelings, getRefrigerationUnitByVehicle, addVehicle, updateVehicle, deleteVehicle, sellVehicle, reverseSale } = useMockData();
  const { isAdmin } = usePermissions();
  const allVehicles = vehicles();
  const allDrivers = drivers();
  const allRefuelings = refuelings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [vehicleToSell, setVehicleToSell] = useState<Vehicle | null>(null);
  const [reverseSaleDialogOpen, setReverseSaleDialogOpen] = useState(false);
  const [vehicleToReverseSale, setVehicleToReverseSale] = useState<Vehicle | null>(null);

  const getDriverName = (driverId?: string) => {
    if (!driverId) return null;
    const driver = allDrivers.find(d => d.id === driverId);
    return driver?.name;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Ativo', variant: 'default' as const },
      maintenance: { label: 'Manutenção', className: 'bg-warning text-warning-foreground' },
      inactive: { label: 'Inativo', variant: 'destructive' as const },
      sold: { label: 'Vendido', className: 'bg-gray-500 text-white' }
    };
    const config = variants[status as keyof typeof variants];
    return 'variant' in config ? (
      <Badge variant={config.variant}>{config.label}</Badge>
    ) : (
      <Badge className={config.className}>{config.label}</Badge>
    );
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setViewingVehicle(vehicle);
    setDetailsDialogOpen(true);
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

  const handleSellVehicle = (vehicle: Vehicle) => {
    setVehicleToSell(vehicle);
    setSaleDialogOpen(true);
  };

  const handleConfirmSale = (saleData: VehicleSale) => {
    if (vehicleToSell) {
      sellVehicle(vehicleToSell.id, saleData);
      toast.success(`Veículo ${vehicleToSell.plate} vendido com sucesso!`);
      setVehicleToSell(null);
      setSaleDialogOpen(false);
    }
  };

  const handleReverseSale = (vehicle: Vehicle) => {
    setVehicleToReverseSale(vehicle);
    setReverseSaleDialogOpen(true);
  };

  const confirmReverseSale = () => {
    if (vehicleToReverseSale) {
      reverseSale(vehicleToReverseSale.id);
      toast.success(`Venda do veículo ${vehicleToReverseSale.plate} revertida com sucesso!`);
      setVehicleToReverseSale(null);
      setReverseSaleDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingVehicle(null);
    }
  };

  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    updateVehicle(vehicleId, { status: newStatus as 'active' | 'maintenance' | 'inactive' });
    const statusLabels = {
      active: 'Ativo',
      maintenance: 'Manutenção',
      inactive: 'Inativo'
    };
    toast.success(`Status alterado para ${statusLabels[newStatus as keyof typeof statusLabels]}`);
  };

  const handleDriverChange = (vehicleId: string, driverId: string) => {
    const actualDriverId = driverId === 'none' ? undefined : driverId;
    updateVehicle(vehicleId, { driverId: actualDriverId });
    
    if (actualDriverId) {
      const driver = allDrivers.find(d => d.id === actualDriverId);
      toast.success(`Motorista ${driver?.name} vinculado ao veículo`);
    } else {
      toast.success('Vínculo com motorista removido');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculateAverageConsumption = (vehicleId: string): number | null => {
    const vehicleRefuelings = allRefuelings
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => a.km - b.km);

    if (vehicleRefuelings.length < 2) return null;

    const totalKmTraveled = vehicleRefuelings[vehicleRefuelings.length - 1].km - vehicleRefuelings[0].km;
    const totalLiters = vehicleRefuelings.reduce((sum, r) => sum + r.liters, 0);

    if (totalLiters === 0) return null;

    return totalKmTraveled / totalLiters;
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por placa, modelo, chassi ou motorista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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

      <AlertDialog open={reverseSaleDialogOpen} onOpenChange={setReverseSaleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar reversão de venda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reverter a venda do veículo <strong>{vehicleToReverseSale?.plate}</strong>? 
              O veículo voltará ao status "{vehicleToReverseSale?.previousStatus === 'active' ? 'Ativo' : vehicleToReverseSale?.previousStatus === 'maintenance' ? 'Manutenção' : 'Inativo'}" e as informações da venda serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReverseSale} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Reverter Venda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Veículo - {viewingVehicle?.plate}</DialogTitle>
            <DialogDescription>
              Informações completas do veículo
            </DialogDescription>
          </DialogHeader>
          
          {viewingVehicle && (
            <div className="space-y-6">
              {viewingVehicle.images && viewingVehicle.images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Imagens do Veículo</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {viewingVehicle.images.map((image, index) => (
                      <div 
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image}
                          alt={`${viewingVehicle.plate} - ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border hover:border-primary transition-colors"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Placa:</span>
                    <p className="font-medium">{viewingVehicle.plate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">{viewingVehicle.vehicleType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Marca:</span>
                    <p className="font-medium">{viewingVehicle.brand}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Modelo:</span>
                    <p className="font-medium">{viewingVehicle.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ano:</span>
                    <p className="font-medium">{viewingVehicle.year}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cor:</span>
                    <p className="font-medium">{viewingVehicle.color}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">{getStatusBadge(viewingVehicle.status)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">KM Atual:</span>
                    <p className="font-medium">{viewingVehicle.currentKm.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Consumo Médio:</span>
                    <p className="font-medium">
                      {(() => {
                        const avgConsumption = calculateAverageConsumption(viewingVehicle.id);
                        return avgConsumption 
                          ? `${avgConsumption.toFixed(2)} km/l` 
                          : 'Dados insuficientes';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Documentação</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Chassis:</span>
                    <p className="font-medium font-mono">{viewingVehicle.chassis}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RENAVAM:</span>
                    <p className="font-medium font-mono">{viewingVehicle.renavam}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">KM de Compra:</span>
                    <p className="font-medium">{viewingVehicle.purchaseKm.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data de Compra:</span>
                    <p className="font-medium">{formatDate(viewingVehicle.purchaseDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor de Compra:</span>
                    <p className="font-medium">{formatCurrency(viewingVehicle.purchaseValue)}</p>
                  </div>
                  {viewingVehicle.crlvDocument && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Documento CRLV:</span>
                      <div className="mt-2 grid grid-cols-4 gap-3">
                        {viewingVehicle.crlvDocument.startsWith('data:image') || viewingVehicle.crlvDocument.includes('unsplash') ? (
                          <div className="relative group cursor-pointer">
                            <img
                              src={viewingVehicle.crlvDocument}
                              alt="CRLV"
                              className="w-full h-32 object-cover rounded-lg border border-border hover:border-primary transition-colors"
                              onClick={() => window.open(viewingVehicle.crlvDocument, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <a
                            href={viewingVehicle.crlvDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                          >
                            <FileText className="h-5 w-5" />
                            <span className="text-sm font-medium">Ver CRLV</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Características Técnicas</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo de Combustível:</span>
                    <p className="font-medium">{viewingVehicle.fuelType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantidade de Eixos:</span>
                    <p className="font-medium">{viewingVehicle.axles}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Propriedade e Filiais</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground text-sm">Matriz/Filial Proprietária:</span>
                    <div className="mt-1">
                      <Badge className="bg-primary text-primary-foreground">
                        {viewingVehicle.ownerBranch}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Filiais Vinculadas:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingVehicle.branches.map((branch, index) => (
                        <Badge key={index} variant="secondary">
                          {branch}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {viewingVehicle.driverId && getDriverName(viewingVehicle.driverId) && (
                <div>
                  <h3 className="font-semibold mb-3">Motorista Vinculado</h3>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-lg font-semibold">{getDriverName(viewingVehicle.driverId)}</p>
                  </div>
                </div>
              )}

              {viewingVehicle.hasComposition && viewingVehicle.compositionPlates && viewingVehicle.compositionPlates.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Composições Acopladas</h3>
                  <div className="space-y-2">
                    {viewingVehicle.compositionPlates.map((plate, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Badge variant="secondary">{plate}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {viewingVehicle.compositionAxles?.[index]} {viewingVehicle.compositionAxles?.[index] === 1 ? 'eixo' : 'eixos'}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm font-medium">
                        Total de eixos (veículo + composições): {viewingVehicle.axles + (viewingVehicle.compositionAxles?.reduce((sum, axles) => sum + axles, 0) || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {getRefrigerationUnitByVehicle(viewingVehicle.id) && (
                <div>
                  <h3 className="font-semibold mb-3">Unidade de Refrigeração</h3>
                  {(() => {
                    const unit = getRefrigerationUnitByVehicle(viewingVehicle.id);
                    return unit ? (
                      <div className="grid grid-cols-2 gap-4 text-sm bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
                        <div>
                          <span className="text-muted-foreground">Marca:</span>
                          <p className="font-medium">{unit.brand}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Modelo:</span>
                          <p className="font-medium">{unit.model}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Número de Série:</span>
                          <p className="font-medium font-mono">{unit.serialNumber}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <p className="font-medium capitalize">{unit.type === 'freezer' ? 'Freezer' : unit.type === 'cooled' ? 'Resfriado' : 'Climatizado'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Temperatura Mínima:</span>
                          <p className="font-medium">{unit.minTemp}°C</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Temperatura Máxima:</span>
                          <p className="font-medium">{unit.maxTemp}°C</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Data de Instalação:</span>
                          <p className="font-medium">{formatDate(unit.installDate)}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {viewingVehicle.status === 'sold' && viewingVehicle.saleInfo && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-lg">Informações da Venda</h3>
                  <div className="space-y-4 bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Comprador:</span>
                        <p className="font-semibold text-base">{viewingVehicle.saleInfo.buyerName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPF/CNPJ:</span>
                        <p className="font-medium">{viewingVehicle.saleInfo.buyerCpfCnpj}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data da Venda:</span>
                        <p className="font-medium">{formatDate(viewingVehicle.saleInfo.saleDate)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quilometragem na Venda:</span>
                        <p className="font-medium">{viewingVehicle.saleInfo.km.toLocaleString('pt-BR')} km</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Preço de Venda:</span>
                        <p className="font-bold text-2xl text-green-600">{formatCurrency(viewingVehicle.saleInfo.salePrice)}</p>
                      </div>
                    </div>

                    {(viewingVehicle.saleInfo.paymentReceipt || viewingVehicle.saleInfo.transferDocument) && (
                      <div className="pt-4 border-t border-green-500/20">
                        <h4 className="font-semibold mb-3">Documentos da Venda</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {viewingVehicle.saleInfo.paymentReceipt && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-muted-foreground">Comprovante de Recebimento</span>
                              {viewingVehicle.saleInfo.paymentReceipt.startsWith('data:image') ? (
                                <img
                                  src={viewingVehicle.saleInfo.paymentReceipt}
                                  alt="Comprovante"
                                  className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(viewingVehicle.saleInfo!.paymentReceipt, '_blank')}
                                />
                              ) : (
                                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                                  <FileText className="h-5 w-5" />
                                  <span className="text-sm">Comprovante anexado</span>
                                </div>
                              )}
                            </div>
                          )}
                          {viewingVehicle.saleInfo.transferDocument && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-muted-foreground">CRV Assinado</span>
                              {viewingVehicle.saleInfo.transferDocument.startsWith('data:image') ? (
                                <img
                                  src={viewingVehicle.saleInfo.transferDocument}
                                  alt="CRV"
                                  className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(viewingVehicle.saleInfo!.transferDocument, '_blank')}
                                />
                              ) : (
                                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                                  <FileText className="h-5 w-5" />
                                  <span className="text-sm">CRV anexado</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Visualização da Imagem</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Imagem ampliada"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Venda de Veículo - {vehicleToSell?.plate}</DialogTitle>
            <DialogDescription>
              Preencha os dados da venda do veículo
            </DialogDescription>
          </DialogHeader>
          {vehicleToSell && (
            <VehicleSaleForm
              onSubmit={handleConfirmSale}
              onCancel={() => setSaleDialogOpen(false)}
              currentKm={vehicleToSell.currentKm}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allVehicles
          .filter(vehicle => {
            const search = searchTerm.toLowerCase();
            return (
              vehicle.plate.toLowerCase().includes(search) ||
              vehicle.model.toLowerCase().includes(search) ||
              vehicle.chassis.toLowerCase().includes(search) ||
              (getDriverName(vehicle.driverId)?.toLowerCase() || '').includes(search)
            );
          })
          .map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.plate}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                  )}
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
                <div className="flex gap-4">
                  <div>
                    <span className="text-muted-foreground">KM Atual:</span>
                    <p className="font-medium">{vehicle.currentKm.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">KM Rodados:</span>
                    <p className="font-medium">{(vehicle.currentKm - vehicle.purchaseKm).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Consumo Médio:</span>
                  <p className="font-medium">
                    {(() => {
                      const avgConsumption = calculateAverageConsumption(vehicle.id);
                      return avgConsumption 
                        ? `${avgConsumption.toFixed(2)} km/l` 
                        : 'N/A';
                    })()}
                  </p>
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
              
              <div className="pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Composições:</span>
                {vehicle.hasComposition && vehicle.compositionPlates && vehicle.compositionPlates.length > 0 ? (
                  <>
                    <p className="text-sm font-medium">
                      {vehicle.compositionPlates.length} {vehicle.compositionPlates.length === 1 ? 'reboque' : 'reboques'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total de eixos: {vehicle.axles + (vehicle.compositionAxles?.reduce((sum, axles) => sum + axles, 0) || 0)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">Sem Composições</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total de eixos: {vehicle.axles}
                    </p>
                  </>
                )}
              </div>
              
              <div className="pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground mb-2 block">Vincular Motorista:</span>
                <Select
                  value={vehicle.driverId || 'none'}
                  onValueChange={(value) => handleDriverChange(vehicle.id, value)}
                  disabled={vehicle.status === 'sold'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sem motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem motorista</SelectItem>
                    {allDrivers.filter(d => d.active).map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground mb-2 block">Alterar Status:</span>
                <Select
                  value={vehicle.status}
                  onValueChange={(value) => handleStatusChange(vehicle.id, value)}
                  disabled={vehicle.status === 'sold'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewDetails(vehicle)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
                {vehicle.status !== 'sold' ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {isAdmin() && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSellVehicle(vehicle)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(vehicle)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : isAdmin() ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReverseSale(vehicle)}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Reverter Venda
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
