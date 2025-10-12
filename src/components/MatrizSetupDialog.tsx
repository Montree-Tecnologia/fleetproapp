import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { Company } from '@/hooks/useMockData';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MatrizSetupDialogProps {
  isOpen: boolean;
  matrizData: Company | undefined;
  onSuccess: () => void;
}

export function MatrizSetupDialog({ isOpen, matrizData, onSuccess }: MatrizSetupDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Configure sua Transportadora Matriz</DialogTitle>
          <DialogDescription>
            Complete as informações da sua empresa para começar a usar o sistema
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É necessário configurar a matriz antes de cadastrar veículos, motoristas e outros dados.
          </AlertDescription>
        </Alert>

        {matrizData && (
          <CompanyForm 
            initialData={matrizData}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
