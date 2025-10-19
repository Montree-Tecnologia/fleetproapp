import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, TrendingUp, Fuel, Activity, Snowflake, ArrowUp, ArrowDown } from 'lucide-react';
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
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Disponibilidade',
      value: `${vehicleStats.availability}%`,
      icon: Activity,
      description: 'Taxa de disponibilidade',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-600',
      trend: 'up'
    },
    {
      title: 'Consumo Médio',
      value: `${vehicleStats.avgConsumption} km/l`,
      icon: TrendingUp,
      description: 'Média da frota',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Custo Combustível',
      value: `R$ ${vehicleStats.totalFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Fuel,
      description: 'Mês atual',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-600'
    }
  ];

  const refrigerationStatCards = [
    {
      title: 'Total de Equipamentos',
      value: refrigerationStats.totalUnits,
      icon: Snowflake,
      description: `${refrigerationStats.activeUnits} ativos`,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/10',
      iconColor: 'text-cyan-600'
    },
    {
      title: 'Disponibilidade',
      value: `${refrigerationStats.availability}%`,
      icon: Activity,
      description: 'Taxa de disponibilidade',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-600',
      trend: 'up'
    },
    {
      title: 'Consumo Médio',
      value: `${refrigerationStats.avgConsumption} l/h`,
      icon: TrendingUp,
      description: 'Média dos equipamentos',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Custo Combustível',
      value: `R$ ${refrigerationStats.totalFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Fuel,
      description: 'Mês atual',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="bg-gradient-mesh rounded-2xl p-6 lg:p-8 card-elevated">
        <h2 className="text-3xl lg:text-4xl font-bold text-gradient-fancy mb-2">
          Dashboard Operacional
        </h2>
        <p className="text-base lg:text-lg text-muted-foreground">
          Visão geral da sua operação em tempo real
        </p>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white font-semibold">
            Veículos
          </TabsTrigger>
          <TabsTrigger value="refrigeration" className="hidden sm:block data-[state=active]:bg-gradient-primary data-[state=active]:text-white font-semibold">
            Equipamentos de Refrigeração
          </TabsTrigger>
          <TabsTrigger value="refrigeration" className="sm:hidden data-[state=active]:bg-gradient-primary data-[state=active]:text-white font-semibold">
            Refrigeração
          </TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6 animate-slide-up">
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {vehicleStatCards.map((stat, index) => (
              <Card 
                key={stat.title} 
                className="card-elevated hover-lift overflow-hidden group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                    {stat.trend && (
                      <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {stat.trend === 'up' ? '+2.5%' : '-1.2%'}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status Distribution */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="card-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-subtle">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  Status da Frota
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Ativos
                      </span>
                      <span className="text-sm font-bold">{vehicleStats.activeVehicles}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(vehicleStats.activeVehicles / vehicleStats.totalVehicles) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        Em Manutenção
                      </span>
                      <span className="text-sm font-bold">{vehicleStats.maintenanceVehicles}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(vehicleStats.maintenanceVehicles / vehicleStats.totalVehicles) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        Defeituosos
                      </span>
                      <span className="text-sm font-bold">{vehicleStats.defectiveVehicles}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(vehicleStats.defectiveVehicles / vehicleStats.totalVehicles) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        Inativos
                      </span>
                      <span className="text-sm font-bold">{vehicleStats.inactiveVehicles}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-700 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(vehicleStats.inactiveVehicles / vehicleStats.totalVehicles) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-600" />
                        Vendidos
                      </span>
                      <span className="text-sm font-bold">{vehicleStats.soldVehicles}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-gray-600 to-gray-700 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(vehicleStats.soldVehicles / vehicleStats.totalVehicles) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-subtle">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  Top 5 Veículos por Consumo
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWorstVehicles(!showWorstVehicles)}
                  className="hover:bg-primary/10"
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
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                      
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
                    .map((vehicle, index) => (
                      <div 
                        key={vehicle.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{vehicle.plate}</p>
                            <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-primary">
                            {vehicle.avgConsumption.toFixed(2)} km/l
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {showWorstVehicles ? 'Baixo consumo' : 'Alto consumo'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Refuelings */}
          <Card className="card-elevated">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-subtle">
                  <Fuel className="h-5 w-5 text-primary" />
                </div>
                Últimos Abastecimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRefuelings
                  .filter(r => r.vehicleId)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((refueling) => {
                    const vehicle = allVehicles.find(v => v.id === refueling.vehicleId);
                    const supplier = allSuppliers.find(s => s.id === refueling.supplierId);
                    return (
                       <div 
                         key={refueling.id} 
                         className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                             <Truck className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                             <p className="text-sm font-semibold">{vehicle?.plate} - {vehicle?.model}</p>
                             <p className="text-xs text-muted-foreground mt-1">
                               {refueling.liters}L • {supplier?.fantasyName}
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-bold text-primary">
                             R$ {refueling.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                           </p>
                           <p className="text-xs text-muted-foreground">
                             {new Date(refueling.date).toLocaleDateString('pt-BR')}
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
        <TabsContent value="refrigeration" className="space-y-6 animate-slide-up">
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {refrigerationStatCards.map((stat, index) => (
              <Card 
                key={stat.title} 
                className="card-elevated hover-lift overflow-hidden group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                    {stat.trend && (
                      <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {stat.trend === 'up' ? '+2.5%' : '-1.2%'}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status Distribution */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="card-elevated">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-subtle">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  Status dos Equipamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Ativos
                      </span>
                      <span className="text-sm font-bold">{refrigerationStats.activeUnits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(refrigerationStats.activeUnits / refrigerationStats.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        Em Manutenção
                      </span>
                      <span className="text-sm font-bold">{refrigerationStats.maintenanceUnits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(refrigerationStats.maintenanceUnits / refrigerationStats.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        Defeituosos
                      </span>
                      <span className="text-sm font-bold">{refrigerationStats.defectiveUnits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(refrigerationStats.defectiveUnits / refrigerationStats.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        Inativos
                      </span>
                      <span className="text-sm font-bold">{refrigerationStats.inactiveUnits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-700 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(refrigerationStats.inactiveUnits / refrigerationStats.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-600" />
                        Vendidos
                      </span>
                      <span className="text-sm font-bold">{refrigerationStats.soldUnits}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-gray-600 to-gray-700 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(refrigerationStats.soldUnits / refrigerationStats.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-subtle">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  Top 5 Equipamentos por Consumo
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWorstRefrigeration(!showWorstRefrigeration)}
                  className="hover:bg-primary/10"
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
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                      
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
                    .map((unit, index) => (
                      <div 
                        key={unit.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{unit.serialNumber}</p>
                            <p className="text-xs text-muted-foreground">{unit.brand} {unit.model}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-primary">
                            {unit.avgConsumption.toFixed(2)} L/h
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {showWorstRefrigeration ? 'Alto consumo' : 'Baixo consumo'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Refuelings */}
          <Card className="card-elevated">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-subtle">
                  <Fuel className="h-5 w-5 text-primary" />
                </div>
                Últimos Abastecimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRefuelings
                  .filter(r => r.refrigerationUnitId)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((refueling) => {
                    const unit = allRefrigerationUnits.find(u => u.id === refueling.refrigerationUnitId);
                    const supplier = allSuppliers.find(s => s.id === refueling.supplierId);
                    return (
                       <div 
                         key={refueling.id} 
                         className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                             <Snowflake className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                             <p className="text-sm font-semibold">SN: {unit?.serialNumber}</p>
                             <p className="text-xs text-muted-foreground mt-1">
                               {refueling.liters}L • {supplier?.fantasyName}
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-bold text-primary">
                             R$ {refueling.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                           </p>
                           <p className="text-xs text-muted-foreground">
                             {new Date(refueling.date).toLocaleDateString('pt-BR')}
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