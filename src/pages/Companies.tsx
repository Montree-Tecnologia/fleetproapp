import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin } from 'lucide-react';

export default function Companies() {
  const companies = [
    {
      id: '1',
      type: 'matriz',
      name: 'Transportadora Matriz',
      cnpj: '12.345.678/0001-90',
      city: 'São Paulo',
      state: 'SP',
      branches: 3,
    },
    {
      id: '2',
      type: 'filial',
      name: 'Filial Rio de Janeiro',
      cnpj: '12.345.678/0002-71',
      city: 'Rio de Janeiro',
      state: 'RJ',
      branches: 0,
    },
    {
      id: '3',
      type: 'filial',
      name: 'Filial Belo Horizonte',
      cnpj: '12.345.678/0003-52',
      city: 'Belo Horizonte',
      state: 'MG',
      branches: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Empresas e Filiais</h2>
        <p className="text-muted-foreground">
          Gerencie matriz e filiais da organização
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
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
                  {company.branches} {company.branches === 1 ? 'filial' : 'filiais'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
