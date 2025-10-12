import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { useMockData, Company } from '@/hooks/useMockData';

interface MatrizConfigWarningProps {
  show: boolean;
  matrizId: string;
}

export function MatrizConfigWarning({ show, matrizId }: MatrizConfigWarningProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { companies } = useMockData();
  
  const matriz = companies().find(c => c.id === matrizId);

  if (!show || dismissed || !matriz) return null;

  const handleSuccess = () => {
    setDialogOpen(false);
    // O alerta desaparecerá automaticamente quando needsMatrizSetup for false
  };

  return (
    <>
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Configure os dados da sua Transportadora Matriz antes de cadastrar veículos, motoristas e outros dados.
          </span>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              Configurar Agora
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure sua Transportadora Matriz</DialogTitle>
            <DialogDescription>
              Complete as informações da sua empresa para começar a usar o sistema
            </DialogDescription>
          </DialogHeader>

          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              É necessário preencher CNPJ, Cidade e Estado para continuar.
            </AlertDescription>
          </Alert>

          <CompanyForm 
            initialData={matriz}
            onSuccess={handleSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
