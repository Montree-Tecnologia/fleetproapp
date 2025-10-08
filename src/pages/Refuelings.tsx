import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Fuel } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefuelingForm } from '@/components/forms/RefuelingForm';
import { useToast } from '@/hooks/use-toast';

export default function Refuelings() {
  const { refuelings, vehicles, drivers, addRefueling } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const allRefuelings = refuelings();
  const allVehicles = vehicles();
  const allDrivers = drivers();

  const handleSubmit = (data: any) => {
    addRefueling(data);
    toast({
      title: 'Abastecimento registrado',
      description: 'Abastecimento cadastrado com sucesso.',
    });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abastecimentos</h2>
          <p className="text-muted-foreground">
            Controle de abastecimentos e custos com combustível
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Abastecimento
          </Button>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Abastecimento</DialogTitle>
              <DialogDescription>
                Registre um novo abastecimento da frota
              </DialogDescription>
            </DialogHeader>
            <RefuelingForm
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
              vehicles={allVehicles}
              drivers={allDrivers}
            />
          </DialogContent>
        </Dialog>
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
                          Motorista: {refueling.driver} • {refueling.km.toLocaleString('pt-BR')} km • {refueling.fuelType}
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
