import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, TrendingUp, Fuel, Activity, Snowflake, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { fetchDashboardData, fetchRecentRefuelings } from '@/services/dashboardApi';

export default function Dashboard() {
  const [showWorstVehicles, setShowWorstVehicles] = useState(false);
  const [showWorstRefrigeration, setShowWorstRefrigeration] = useState(false);

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboardData(5),
  });

  const { data: vehicleRefuelings, isLoading: isLoadingVehicleRefuelings } = useQuery({
    queryKey: ['recentRefuelings', 'vehicle'],
    queryFn: () => fetchRecentRefuelings('vehicle', 5),
  });

  const { data: refrigerationRefuelings, isLoading: isLoadingRefrigerationRefuelings } = useQuery({
    queryKey: ['recentRefuelings', 'refrigeration'],
    queryFn: () => fetchRecentRefuelings('refrigeration', 5),
  });

  const isLoading = isLoadingDashboard || isLoadingVehicleRefuelings || isLoadingRefrigerationRefuelings;

  const vehicleStats = dashboardData?.vehiclesStats;
  const refrigerationStats = dashboardData?.refrigerationStats;
  const vehiclesConsumption = dashboardData?.vehiclesConsumption || [];
  const refrigerationConsumption = dashboardData?.refrigerationConsumption || [];

  const vehicleStatCards = vehicleStats ? [
    {
      title: 'Total de Veículos',
      value: vehicleStats.total,
      icon: Truck,
      description: `${vehicleStats.counts.active} ativos`,
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
      value: `${vehicleStats.avgConsumption.toFixed(2)} km/l`,
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
      value: refrigerationStats.total,
      icon: Snowflake,
      description: `${refrigerationStats.counts.active} ativos`,
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
      value: `${refrigerationStats.avgConsumption.toFixed(2)} l/h`,
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

  const sortedVehiclesConsumption = [...vehiclesConsumption].sort((a, b) => 
    showWorstVehicles ? a.consumption - b.consumption : b.consumption - a.consumption
  );

  const sortedRefrigerationConsumption = [...refrigerationConsumption].sort((a, b) => 
    showWorstRefrigeration ? b.consumption - a.consumption : a.consumption - b.consumption
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {vehicleStatCards.map((stat) => (
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
            ))}
          </div>

          {/* Status Distribution */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status da Frota</CardTitle>
              </CardHeader>
              <CardContent>
                {vehicleStats && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Ativos</span>
                        <span className="text-sm text-muted-foreground">{vehicleStats.counts.active}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-chart-2 h-2 rounded-full"
                          style={{ width: `${vehicleStats.total > 0 ? (vehicleStats.counts.active / vehicleStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Em Manutenção</span>
                        <span className="text-sm text-muted-foreground">{vehicleStats.counts.maintenance}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${vehicleStats.total > 0 ? (vehicleStats.counts.maintenance / vehicleStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Defeituosos</span>
                        <span className="text-sm text-muted-foreground">{vehicleStats.counts.defective}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${vehicleStats.total > 0 ? (vehicleStats.counts.defective / vehicleStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Inativos</span>
                        <span className="text-sm text-muted-foreground">{vehicleStats.counts.inactive}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${vehicleStats.total > 0 ? (vehicleStats.counts.inactive / vehicleStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Vendidos</span>
                        <span className="text-sm text-muted-foreground">{vehicleStats.counts.sold}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-gray-700 h-2 rounded-full"
                          style={{ width: `${vehicleStats.total > 0 ? (vehicleStats.counts.sold / vehicleStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                  {sortedVehiclesConsumption.length > 0 ? (
                    sortedVehiclesConsumption.map((item) => (
                      <div key={item.vehicleId} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.vehicle.plate}</p>
                          <p className="text-xs text-muted-foreground">{item.vehicle.model}</p>
                        </div>
                        <span className="text-sm font-bold">
                          {item.consumption.toFixed(2)} km/l
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
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
                {vehicleRefuelings && vehicleRefuelings.length > 0 ? (
                  vehicleRefuelings.map((refueling) => (
                    <div key={refueling.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium">
                          {refueling.vehicle?.plate} - {refueling.vehicle?.model}
                        </p>
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
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum abastecimento recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refrigeration Tab */}
        <TabsContent value="refrigeration" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {refrigerationStatCards.map((stat) => (
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
            ))}
          </div>

          {/* Status Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {refrigerationStats && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Ativos</span>
                        <span className="text-sm text-muted-foreground">{refrigerationStats.counts.active}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-chart-2 h-2 rounded-full"
                          style={{ width: `${refrigerationStats.total > 0 ? (refrigerationStats.counts.active / refrigerationStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Em Manutenção</span>
                        <span className="text-sm text-muted-foreground">{refrigerationStats.counts.maintenance}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${refrigerationStats.total > 0 ? (refrigerationStats.counts.maintenance / refrigerationStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Defeituosos</span>
                        <span className="text-sm text-muted-foreground">{refrigerationStats.counts.defective}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${refrigerationStats.total > 0 ? (refrigerationStats.counts.defective / refrigerationStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Inativos</span>
                        <span className="text-sm text-muted-foreground">{refrigerationStats.counts.inactive}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${refrigerationStats.total > 0 ? (refrigerationStats.counts.inactive / refrigerationStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Vendidos</span>
                        <span className="text-sm text-muted-foreground">{refrigerationStats.counts.sold}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-gray-700 h-2 rounded-full"
                          style={{ width: `${refrigerationStats.total > 0 ? (refrigerationStats.counts.sold / refrigerationStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                  {sortedRefrigerationConsumption.length > 0 ? (
                    sortedRefrigerationConsumption.map((item) => (
                      <div key={item.unitId} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.unit.brand}</p>
                          <p className="text-xs text-muted-foreground">{item.unit.model}</p>
                        </div>
                        <span className="text-sm font-bold">
                          {item.consumption.toFixed(2)} L/h
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
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
                {refrigerationRefuelings && refrigerationRefuelings.length > 0 ? (
                  refrigerationRefuelings.map((refueling) => (
                    <div key={refueling.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium">
                          SN: {refueling.refrigerationUnit?.serialNumber}
                        </p>
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
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum abastecimento recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
