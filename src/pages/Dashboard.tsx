import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, TrendingUp, Fuel, Activity } from 'lucide-react';

export default function Dashboard() {
  const { getDashboardStats, vehicles, refuelings, suppliers } = useMockData();
  const stats = getDashboardStats();
  const allVehicles = vehicles();
  const allRefuelings = refuelings();
  const allSuppliers = suppliers();

  const statCards = [
    {
      title: 'Total de Veículos',
      value: stats.totalVehicles,
      icon: Truck,
      description: `${stats.activeVehicles} ativos`,
      color: 'text-chart-1'
    },
    {
      title: 'Disponibilidade',
      value: `${stats.availability}%`,
      icon: Activity,
      description: 'Taxa de disponibilidade',
      color: 'text-chart-2'
    },
    {
      title: 'Consumo Médio',
      value: `${stats.avgConsumption} km/L`,
      icon: TrendingUp,
      description: 'Média da frota',
      color: 'text-chart-3'
    },
    {
      title: 'Custo Combustível',
      value: `R$ ${stats.totalFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Fuel,
      description: 'Mês atual',
      color: 'text-chart-4'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Operacional</h2>
        <p className="text-muted-foreground">
          Visão geral da sua frota em tempo real
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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
            <CardTitle>Status da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ativos</span>
                  <span className="text-sm text-muted-foreground">{stats.activeVehicles}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-chart-2 h-2 rounded-full"
                    style={{ width: `${(stats.activeVehicles / stats.totalVehicles) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Em Manutenção</span>
                  <span className="text-sm text-muted-foreground">{stats.maintenanceVehicles}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-chart-3 h-2 rounded-full"
                    style={{ width: `${(stats.maintenanceVehicles / stats.totalVehicles) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inativos</span>
                  <span className="text-sm text-muted-foreground">{stats.inactiveVehicles}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-muted-foreground h-2 rounded-full"
                    style={{ width: `${(stats.inactiveVehicles / stats.totalVehicles) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Veículos por Consumo</CardTitle>
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
                    const kmDiff = vehicleRefuelings[i].km - vehicleRefuelings[i - 1].km;
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
                .sort((a, b) => a.avgConsumption - b.avgConsumption)
                .slice(0, 5)
                .map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{vehicle.plate}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                    </div>
                    <span className="text-sm font-bold">
                      {vehicle.avgConsumption.toFixed(2)} km/L
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
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((refueling) => {
                const vehicle = allVehicles.find(v => v.id === refueling.vehicleId);
                const supplier = allSuppliers.find(s => s.id === refueling.supplierId);
                return (
                  <div key={refueling.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{vehicle?.plate}</p>
                      <p className="text-xs text-muted-foreground">
                        {refueling.liters}L • {supplier?.fantasyName} • {supplier?.city}/{supplier?.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
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
    </div>
  );
}
