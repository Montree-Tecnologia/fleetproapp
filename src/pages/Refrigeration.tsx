import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Snowflake, Thermometer } from 'lucide-react';

export default function Refrigeration() {
  const { refrigerationUnits, vehicles } = useMockData();
  const allUnits = refrigerationUnits();
  const allVehicles = vehicles();

  const getTypeBadge = (type: string) => {
    const variants = {
      freezer: { label: 'Freezer', className: 'bg-chart-1 text-white' },
      cooled: { label: 'Resfriado', className: 'bg-chart-2 text-white' },
      climatized: { label: 'Climatizado', className: 'bg-chart-3 text-white' }
    };
    const variant = variants[type as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Aparelho
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {allUnits.map((unit) => {
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
                  {getTypeBadge(unit.type)}
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

                {vehicle && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Veículo Vinculado:</p>
                    <p className="font-medium">{vehicle.plate} - {vehicle.model}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Data de Instalação:</p>
                  <p className="font-medium">
                    {new Date(unit.installDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <Button variant="outline" className="w-full">
                  Ver Detalhes
                </Button>
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Aparelho
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
