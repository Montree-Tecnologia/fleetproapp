import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Building, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SupplierForm } from '@/components/forms/SupplierForm';
import { useToast } from '@/hooks/use-toast';

export default function Suppliers() {
  const { suppliers, addSupplier } = useMockData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const allSuppliers = suppliers();

  const handleSubmit = (data: any) => {
    addSupplier(data);
    toast({
      title: 'Fornecedor cadastrado',
      description: 'Fornecedor adicionado com sucesso.',
    });
    setOpen(false);
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      gas_station: { label: 'Posto', className: 'bg-chart-4 text-white' },
      workshop: { label: 'Oficina', className: 'bg-chart-5 text-white' },
      dealer: { label: 'Concessionária', className: 'bg-chart-1 text-white' }
    };
    const variant = variants[type as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">
            Cadastro de fornecedores e prestadores de serviço
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Fornecedor</DialogTitle>
              <DialogDescription>
                Adicione um novo fornecedor ou prestador de serviço
              </DialogDescription>
            </DialogHeader>
            <SupplierForm
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{supplier.fantasyName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{supplier.name}</p>
                  </div>
                </div>
                {getTypeBadge(supplier.type)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{supplier.city}, {supplier.state}</p>
                    <p className="text-xs text-muted-foreground">CNPJ: {supplier.cnpj}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Filiais Vinculadas:</p>
                <div className="flex flex-wrap gap-1">
                  {supplier.branches.map((branch, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {branch}
                    </Badge>
                  ))}
                </div>
              </div>

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
