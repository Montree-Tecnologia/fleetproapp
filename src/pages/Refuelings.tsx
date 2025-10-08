import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Fuel } from 'lucide-react';

export default function Refuelings() {
  const { refuelings, vehicles } = useMockData();
  const allRefuelings = refuelings();
  const allVehicles = vehicles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abastecimentos</h2>
          <p className="text-muted-foreground">
            Controle de abastecimentos e custos com combustível
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Abastecimento
        </Button>
      </div>

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
                          {refueling.station} • {refueling.city}/{refueling.state}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Motorista: {refueling.driver} • {refueling.km.toLocaleString('pt-BR')} km
                        </p>
                      </div>
                    </div>
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
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
