import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, TrendingUp, Fuel, Activity, Snowflake } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getDashboard,
  getVehiclesConsumption,
  getRefrigerationConsumption,
  type DashboardData,
  type VehicleConsumption,
  type RefrigerationConsumption,
} from '@/services/dashboardApi';

export default function Dashboard() {
  const [showWorstVehicles, setShowWorstVehicles] = useState(false);
  const [showWorstRefrigeration, setShowWorstRefrigeration] = useState(false);

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  const { data: vehiclesConsumption, isLoading: isLoadingVehiclesConsumption } = useQuery<VehicleConsumption[]>({
    queryKey: ['vehicles-consumption', showWorstVehicles ? 'worst' : 'best'],
    queryFn: () => getVehiclesConsumption(showWorstVehicles ? 'worst' : 'best'),
  });

  const { data: refrigerationConsumption, isLoading: isLoadingRefrigerationConsumption } = useQuery<RefrigerationConsumption[]>({
    queryKey: ['refrigeration-consumption', showWorstRefrigeration ? 'worst' : 'best'],
    queryFn: () => getRefrigerationConsumption(showWorstRefrigeration ? 'worst' : 'best'),
  });

  const vehicleStats = dashboardData?.vehiclesStats;
  const refrigerationStats = dashboardData?.refrigerationStats;
  const recentVehicleRefuelings = dashboardData?.recentVehicleRefuelings || [];
  const recentRefrigerationRefuelings = dashboardData?.recentRefrigerationRefuelings || [];

  const vehicleStatCards = vehicleStats ? [
    {
      title: 'Total de Veículos',
      value: vehicleStats.totalVehicles,
      icon: Truck,
      description: `${vehicleStats.activeVehicles} ativos`,
      color: 'text-chart-1'
    },
    {
      title: 'Disponibilidade',
      value: `${vehicleStats.availability}%`,
      icon: Activity,
      description: 'Taxa de disponibilidade',
      color: 'text-chart-2'
    },
    {
      title: 'Consumo Médio',
      value: `${vehicleStats.avgConsumption} km/l`,
      icon: TrendingUp,
      description: 'Média da frota',
      color: 'text-chart-3'
    },
    {
      title: 'Custo Combustível',
      value: `R$ ${vehicleStats.totalFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Fuel,
      description: 'Mês atual',
      color: 'text-chart-4'
    }
  ] : [];

  const refrigerationStatCards = refrigerationStats ? [
    {
      title: 'Total de Equipamentos',
      value: refrigerationStats.totalUnits,
      icon: Snowflake,
      description: `${refrigerationStats.activeUnits} ativos`,
      color: 'text-chart-1'
    },
    {
      title: 'Disponibilidade',
      value: `${refrigerationStats.availability}%`,
      icon: Activity,
      description: 'Taxa de disponibilidade',
      color: 'text-chart-2'
    },
    {
      title: 'Consumo Médio',
      value: `${refrigerationStats.avgConsumption} l/h`,
      icon: TrendingUp,
      description: 'Média dos equipamentos',
      color: 'text-chart-3'
    },
    {
      title: 'Custo Combustível',
      value: `R$ ${refrigerationStats.totalFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Fuel,
      description: 'Mês atual',
      color: 'text-chart-4'
    }
  ] : [];

  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );

  const StatusBarSkeleton = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-6" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );

  const ConsumptionItemSkeleton = () => (
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );

  const RefuelingItemSkeleton = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border pb-3">
      <div>
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="text-left sm:text-right">
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard Operacional</h2>
        <p className="text-sm lg:text-base text-muted-foreground">
          Visão geral da sua operação em tempo real
        </p>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="refrigeration" className="hidden sm:block">Equipamentos de Refrigeração</TabsTrigger>
          <TabsTrigger value="refrigeration" className="sm:hidden">Refrigeração</TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4 lg:space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {isLoadingDashboard ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              vehicleStatCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Status Distribution */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status da Frota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingDashboard || !vehicleStats ? (
                    <>
                      <StatusBarSkeleton />
                      <StatusBarSkeleton />
                      <StatusBarSkeleton />
                      <StatusBarSkeleton />
                      <StatusBarSkeleton />
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Ativos</span>
                          <span className="text-sm text-muted-foreground">{vehicleStats.activeVehicles}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-chart-2 h-2 rounded-full"
                            style={{ width: `${vehicleStats.totalVehicles > 0 ? (vehicleStats.activeVehicles / vehicleStats.totalVehicles) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Em Manutenção</span>
                          <span className="text-sm text-muted-foreground">{vehicleStats.maintenanceVehicles}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${vehicleStats.totalVehicles > 0 ? (vehicleStats.maintenanceVehicles / vehicleStats.totalVehicles) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Defeituosos</span>
                          <span className="text-sm text-muted-foreground">{vehicleStats.defectiveVehicles}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${vehicleStats.totalVehicles > 0 ? (vehicleStats.defectiveVehicles / vehicleStats.totalVehicles) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Inativos</span>
                          <span className="text-sm text-muted-foreground">{vehicleStats.inactiveVehicles}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${vehicleStats.totalVehicles > 0 ? (vehicleStats.inactiveVehicles / vehicleStats.totalVehicles) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Vendidos</span>
                          <span className="text-sm text-muted-foreground">{vehicleStats.soldVehicles}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-gray-700 h-2 rounded-full"
                            style={{ width: `${vehicleStats.totalVehicles > 0 ? (vehicleStats.soldVehicles / vehicleStats.totalVehicles) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Top 5 Veículos por Consumo</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWorstVehicles(!showWorstVehicles)}
                >
                  {showWorstVehicles ? 'Mais Econômicos' : 'Menos Econômicos'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingVehiclesConsumption ? (
                    <>
                      <ConsumptionItemSkeleton />
                      <ConsumptionItemSkeleton />
                      <ConsumptionItemSkeleton />
                      <ConsumptionItemSkeleton />
                      <ConsumptionItemSkeleton />
                    </>
                  ) : (
                    vehiclesConsumption?.slice(0, 5).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{vehicle.plate}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                        </div>
                        <span className="text-sm font-bold">
                          {Number(vehicle.avgConsumption).toFixed(2)} km/l
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Refuelings */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingDashboard ? (
                  <>
                    <RefuelingItemSkeleton />
                    <RefuelingItemSkeleton />
                    <RefuelingItemSkeleton />
                    <RefuelingItemSkeleton />
                    <RefuelingItemSkeleton />
                  </>
                ) : (
                  recentVehicleRefuelings.slice(0, 5).map((refueling) => (
                    <div key={refueling.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{refueling.vehicle?.plate} - {refueling.vehicle?.model}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {refueling.liters}L • {refueling.supplier?.fantasyName}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold">
                          R$ {Number(refueling.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(refueling.refuelingDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refrigeration Tab */}
        <TabsContent value="refrigeration" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoadingDashboard ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              refrigerationStatCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Status Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingDashboard || !refrigerationStats ? (
                    <>
                      <StatusBarSkeleton />
                      <StatusBarSkeleton />
                      <StatusBarSkeleton />
                      <StatusBarSkeleton />
                      <StatusBarSkeleton />
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Ativos</span>
                          <span className="text-sm text-muted-foreground">{refrigerationStats.activeUnits}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-chart-2 h-2 rounded-full"
                            style={{ width: `${refrigerationStats.totalUnits > 0 ? (refrigerationStats.activeUnits / refrigerationStats.totalUnits) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Em Manutenção</span>
                          <span className="text-sm text-muted-foreground">{refrigerationStats.maintenanceUnits}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${refrigerationStats.totalUnits > 0 ? (refrigerationStats.maintenanceUnits / refrigerationStats.totalUnits) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Defeituosos</span>
                          <span className="text-sm text-muted-foreground">{refrigerationStats.defectiveUnits}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${refrigerationStats.totalUnits > 0 ? (refrigerationStats.defectiveUnits / refrigerationStats.totalUnits) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Inativos</span>
                          <span className="text-sm text-muted-foreground">{refrigerationStats.inactiveUnits}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${refrigerationStats.totalUnits > 0 ? (refrigerationStats.inactiveUnits / refrigerationStats.totalUnits) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Vendidos</span>
                          <span className="text-sm text-muted-foreground">{refrigerationStats.soldUnits}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-gray-700 h-2 rounded-full"
                            style={{ width: `${refrigerationStats.totalUnits > 0 ? (refrigerationStats.soldUnits / refrigerationStats.totalUnits) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Top 5 Equipamentos por Consumo</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWorstRefrigeration(!showWorstRefrigeration)}
                >
                  {showWorstRefrigeration ? 'Mais Econômicos' : 'Menos Econômicos'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingRefrigerationConsumption ? (
                    <>
                      <ConsumptionItemSkeleton />
                      <ConsumptionItemSkeleton />
                      <ConsumptionItemSkeleton />
                      <ConsumptionItemSkeleton />
                      <ConsumptionItemSkeleton />
                    </>
                  ) : (
                    refrigerationConsumption?.slice(0, 5).map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{unit.serialNumber}</p>
                          <p className="text-xs text-muted-foreground">{unit.brand} {unit.model}</p>
                        </div>
                        <span className="text-sm font-bold">
                          {Number(unit.avgConsumption).toFixed(2)} L/h
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Refuelings */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingDashboard ? (
                  <>
                    <RefuelingItemSkeleton />
                    <RefuelingItemSkeleton />
                    <RefuelingItemSkeleton />
                    <RefuelingItemSkeleton />
                    <RefuelingItemSkeleton />
                  </>
                ) : (
                  recentRefrigerationRefuelings.slice(0, 5).map((refueling) => (
                    <div key={refueling.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium">SN: {refueling.refrigerationUnit?.serialNumber}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {refueling.liters}L • {refueling.supplier?.fantasyName}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold">
                          R$ {Number(refueling.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(refueling.refuelingDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
