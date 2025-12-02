import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, TrendingUp, Fuel, Activity, Snowflake } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [showWorstVehicles, setShowWorstVehicles] = useState(false);
  const [showWorstRefrigeration, setShowWorstRefrigeration] = useState(false);
  
  const { 
    getDashboardStats, 
    getDashboardStatsForRefrigeration,
    vehicles, 
    refuelings, 
    suppliers,
    refrigerationUnits 
  } = useMockData();
  
  const vehicleStats = getDashboardStats();
  const refrigerationStats = getDashboardStatsForRefrigeration();
  const allVehicles = vehicles();
  const allRefuelings = refuelings();
  const allSuppliers = suppliers();
  const allRefrigerationUnits = refrigerationUnits();

  const vehicleStatCards = [
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
  ];

  const refrigerationStatCards = [
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
  ];

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
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Ativos</span>
                      <span className="text-sm text-muted-foreground">{vehicleStats.activeVehicles}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-chart-2 h-2 rounded-full"
                        style={{ width: `${(vehicleStats.activeVehicles / vehicleStats.totalVehicles) * 100}%` }}
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
                        style={{ width: `${(vehicleStats.maintenanceVehicles / vehicleStats.totalVehicles) * 100}%` }}
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
                        style={{ width: `${(vehicleStats.defectiveVehicles / vehicleStats.totalVehicles) * 100}%` }}
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
                        style={{ width: `${(vehicleStats.inactiveVehicles / vehicleStats.totalVehicles) * 100}%` }}
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
                        style={{ width: `${(vehicleStats.soldVehicles / vehicleStats.totalVehicles) * 100}%` }}
                      />
                    </div>
                  </div>
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
                  {allVehicles
                    .map((vehicle) => {
                      const vehicleRefuelings = allRefuelings
                        .filter(r => r.vehicleId === vehicle.id)
                        .sort((a, b) => new Date(a.refuelingDate).getTime() - new Date(b.refuelingDate).getTime());
                      
                      let totalConsumption = 0;
                      let consumptionCount = 0;

                      for (let i = 1; i < vehicleRefuelings.length; i++) {
                        const kmDiff = (vehicleRefuelings[i].km || 0) - (vehicleRefuelings[i - 1].km || 0);
                        const liters = vehicleRefuelings[i].liters;
                        if (kmDiff > 0 && liters > 0) {
                          totalConsumption += kmDiff / liters;
                          consumptionCount++;
                        }
                      }

                      const avgConsumption = consumptionCount > 0 ? totalConsumption / consumptionCount : 0;
                      return { ...vehicle, avgConsumption };
                    })
                    .filter(v => v.avgConsumption > 0)
                    .sort((a, b) => showWorstVehicles ? a.avgConsumption - b.avgConsumption : b.avgConsumption - a.avgConsumption)
                    .slice(0, 5)
                    .map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{vehicle.plate}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                        </div>
                        <span className="text-sm font-bold">
                          {vehicle.avgConsumption.toFixed(2)} km/l
                        </span>
                      </div>
                    ))}
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
                {allRefuelings
                  .filter(r => r.vehicleId)
                  .sort((a, b) => new Date(b.refuelingDate).getTime() - new Date(a.refuelingDate).getTime())
                  .slice(0, 5)
                  .map((refueling) => {
                    const vehicle = allVehicles.find(v => v.id === refueling.vehicleId);
                    const supplier = allSuppliers.find(s => s.id === refueling.supplierId);
                    return (
                       <div key={refueling.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border pb-3 last:border-0">
                         <div>
                           <p className="text-sm font-medium">{vehicle?.plate} - {vehicle?.model}</p>
                           <p className="text-xs text-muted-foreground mt-1">
                             {refueling.liters}L • {supplier?.fantasyName}
                           </p>
                         </div>
                         <div className="text-left sm:text-right">
                           <p className="text-sm font-bold">
                             R$ {refueling.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                           </p>
                           <p className="text-xs text-muted-foreground">
                              {new Date(refueling.refuelingDate).toLocaleDateString('pt-BR')}
                           </p>
                         </div>
                       </div>
                    );
                  })}
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
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Ativos</span>
                      <span className="text-sm text-muted-foreground">{refrigerationStats.activeUnits}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-chart-2 h-2 rounded-full"
                        style={{ width: `${(refrigerationStats.activeUnits / refrigerationStats.totalUnits) * 100}%` }}
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
                        style={{ width: `${(refrigerationStats.maintenanceUnits / refrigerationStats.totalUnits) * 100}%` }}
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
                        style={{ width: `${(refrigerationStats.defectiveUnits / refrigerationStats.totalUnits) * 100}%` }}
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
                        style={{ width: `${(refrigerationStats.inactiveUnits / refrigerationStats.totalUnits) * 100}%` }}
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
                        style={{ width: `${(refrigerationStats.soldUnits / refrigerationStats.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>
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
                  {allRefrigerationUnits
                    .map((unit) => {
                      const unitRefuelings = allRefuelings
                        .filter(r => r.refrigerationUnitId === unit.id)
                        .sort((a, b) => new Date(a.refuelingDate).getTime() - new Date(b.refuelingDate).getTime());
                      
                      let totalConsumption = 0;
                      let consumptionCount = 0;

                      for (let i = 1; i < unitRefuelings.length; i++) {
                        const hoursDiff = (unitRefuelings[i].usageHours || 0) - (unitRefuelings[i - 1].usageHours || 0);
                        const liters = unitRefuelings[i].liters;
                        if (hoursDiff > 0 && liters > 0) {
                          totalConsumption += liters / hoursDiff;
                          consumptionCount++;
                        }
                      }

                      const avgConsumption = consumptionCount > 0 ? totalConsumption / consumptionCount : 0;
                      return { ...unit, avgConsumption };
                    })
                    .filter(u => u.avgConsumption > 0)
                    .sort((a, b) => showWorstRefrigeration ? b.avgConsumption - a.avgConsumption : a.avgConsumption - b.avgConsumption)
                    .slice(0, 5)
                    .map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{unit.serialNumber}</p>
                          <p className="text-xs text-muted-foreground">{unit.brand} {unit.model}</p>
                        </div>
                        <span className="text-sm font-bold">
                          {unit.avgConsumption.toFixed(2)} L/h
                        </span>
                      </div>
                    ))}
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
                {allRefuelings
                  .filter(r => r.refrigerationUnitId)
                  .sort((a, b) => new Date(b.refuelingDate).getTime() - new Date(a.refuelingDate).getTime())
                  .slice(0, 5)
                  .map((refueling) => {
                    const unit = allRefrigerationUnits.find(u => u.id === refueling.refrigerationUnitId);
                    const supplier = allSuppliers.find(s => s.id === refueling.supplierId);
                    return (
                      <div key={refueling.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border pb-3 last:border-0">
                         <div>
                           <p className="text-sm font-medium">SN: {unit?.serialNumber}</p>
                           <p className="text-xs text-muted-foreground mt-1">
                             {refueling.liters}L • {supplier?.fantasyName}
                           </p>
                         </div>
                         <div className="text-left sm:text-right">
                           <p className="text-sm font-bold">
                             R$ {refueling.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                           </p>
                           <p className="text-xs text-muted-foreground">
                             {new Date(refueling.refuelingDate).toLocaleDateString('pt-BR')}
                           </p>
                         </div>
                       </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
