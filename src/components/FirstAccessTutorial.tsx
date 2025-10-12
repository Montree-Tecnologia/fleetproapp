import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FirstAccessTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  companyName: string;
}

const tutorialSteps = [
  {
    title: 'Bem-vindo ao Sistema de Gestão de Frotas!',
    description: 'Vamos configurar sua empresa em apenas alguns passos.',
    icon: Building2,
  },
  {
    title: 'Configure sua Transportadora Matriz',
    description: 'Uma transportadora matriz foi criada automaticamente para você. É importante que você a edite para incluir os dados corretos da sua empresa.',
    icon: Building2,
  },
  {
    title: 'Próximos Passos',
    description: 'Após configurar a matriz, você poderá:',
    list: [
      'Cadastrar filiais',
      'Adicionar veículos',
      'Registrar motoristas',
      'Gerenciar abastecimentos',
      'Criar novos usuários',
    ],
  },
];

export function FirstAccessTutorial({ isOpen, onComplete, companyName }: FirstAccessTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon || Building2;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">{step.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step.list && (
            <div className="space-y-2">
              {step.list.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {currentStep === 1 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Sua Empresa:</span>
                <Badge variant="default">Matriz</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {companyName}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Você precisará editar esta empresa para incluir CNPJ, cidade e UF antes de prosseguir.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Voltar
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === tutorialSteps.length - 1 ? 'Começar' : 'Próximo'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
