import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Snowflake, Thermometer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefrigerationForm } from '@/components/forms/RefrigerationForm';
import { useToast } from '@/hooks/use-toast';

export default function Refrigeration() {
  const { refrigerationUnits, vehicles, addRefrigerationUnit } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const allUnits = refrigerationUnits();
  const allVehicles = vehicles();

  const handleSubmit = (data: any) => {
    addRefrigerationUnit(data);
    toast({
      title: 'Equipamento cadastrado',
      description: 'Aparelho de refrigeração cadastrado com sucesso.',
    });
    setOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aparelhos de Refrigeração</h2>
          <p className="text-muted-foreground">
            Controle dos equipamentos de refrigeração da frota
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aparelho
          </Button>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Equipamento de Refrigeração</DialogTitle>
              <DialogDescription>
                Adicione um novo aparelho de refrigeração à frota
              </DialogDescription>
            </DialogHeader>
            <RefrigerationForm
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
              vehicles={allVehicles}
            />
          </DialogContent>
        </Dialog>
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
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Aparelho
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
