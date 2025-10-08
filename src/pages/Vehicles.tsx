import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Truck } from 'lucide-react';

export default function Vehicles() {
  const { vehicles, drivers, getRefrigerationUnitByVehicle } = useMockData();
  const allVehicles = vehicles();
  const allDrivers = drivers();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Frota</h2>
          <p className="text-muted-foreground">
            Controle completo dos veículos da sua empresa
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

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
                </div>
              )}
              {getDriverName(vehicle.driverId) && (
                <div className="pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Motorista:</span>
                  <p className="text-sm font-medium">{getDriverName(vehicle.driverId)}</p>
                </div>
              )}
              <Button variant="outline" className="w-full">
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
