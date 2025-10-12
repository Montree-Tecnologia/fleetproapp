import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatrizConfigWarningProps {
  show: boolean;
}

export function MatrizConfigWarning({ show }: MatrizConfigWarningProps) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Configure os dados da sua Transportadora Matriz antes de cadastrar veículos, motoristas e outros dados.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/companies')}
          className="ml-4"
        >
          Configurar Agora
        </Button>
      </AlertDescription>
    </Alert>
  );
}
