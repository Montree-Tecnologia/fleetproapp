import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, MapPin, Plus } from 'lucide-react';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { useMockData } from '@/hooks/useMockData';

export default function Companies() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { companies } = useMockData();
  const allCompanies = companies();

  const getCompanyBranches = (matrizId: string) => {
    return allCompanies.filter(c => c.type === 'filial' && c.matrizId === matrizId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Empresas e Filiais</h2>
          <p className="text-muted-foreground">
            Gerencie matriz e filiais da organização
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Empresa</DialogTitle>
              <DialogDescription>
                Adicione uma nova matriz ou filial
              </DialogDescription>
            </DialogHeader>
            <CompanyForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Building2 className="h-8 w-8 text-primary" />
                <Badge variant={company.type === 'matriz' ? 'default' : 'secondary'}>
                  {company.type === 'matriz' ? 'Matriz' : 'Filial'}
                </Badge>
              </div>
              <CardTitle className="mt-4">{company.name}</CardTitle>
              <CardDescription>{company.cnpj}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{company.city} - {company.state}</span>
              </div>
              {company.type === 'matriz' && (
                <div className="text-sm font-medium text-primary">
                  {getCompanyBranches(company.id)} {getCompanyBranches(company.id) === 1 ? 'filial' : 'filiais'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
