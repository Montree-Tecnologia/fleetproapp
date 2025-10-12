import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useMockData, Company } from './useMockData';

export function useOnboarding() {
  const { user, updateUser } = useAuth();
  const { companies, addCompany, updateCompany } = useMockData();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMatrizSetup, setShowMatrizSetup] = useState(false);
  const [matrizCompany, setMatrizCompany] = useState<Company | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    // Verificar se é primeiro acesso
    const isFirstAccess = localStorage.getItem(`first_access_${user.id}`) === null;
    
    if (isFirstAccess && user.role === 'admin') {
      // Criar a matriz automática se não existir
      const allCompanies = companies();
      let matriz = allCompanies.find(c => c.type === 'matriz' && c.id === user.companyId);
      
      if (!matriz) {
        // Criar transportadora matriz padrão com ID fixo
        const newMatriz = {
          id: user.companyId,
          type: 'matriz' as const,
          name: 'Transportadora Matriz',
          cnpj: '',
          city: '',
          state: '',
          active: true,
        };
        
        // Salvar diretamente no localStorage para persistir
        const storedCompanies = localStorage.getItem('fleet_companies');
        const companiesList = storedCompanies ? JSON.parse(storedCompanies) : [];
        companiesList.push(newMatriz);
        localStorage.setItem('fleet_companies', JSON.stringify(companiesList));
        
        matriz = newMatriz;
      }

      setMatrizCompany(matriz);
      setShowTutorial(true);
    }
  }, [user, companies]);

  const completeTutorial = () => {
    setShowTutorial(false);
    
    // Verificar se a matriz precisa ser configurada
    if (matrizCompany && (!matrizCompany.cnpj || !matrizCompany.city || !matrizCompany.state)) {
      setShowMatrizSetup(true);
    } else {
      finishOnboarding();
    }
  };

  const completeMatrizSetup = () => {
    setShowMatrizSetup(false);
    finishOnboarding();
  };

  const finishOnboarding = () => {
    if (user) {
      localStorage.setItem(`first_access_${user.id}`, 'completed');
      updateUser({ isFirstAccess: false, matrizConfigured: true });
    }
  };

  // Atualizar matrizCompany quando as empresas mudarem
  useEffect(() => {
    if (user?.companyId) {
      const allCompanies = companies();
      const updatedMatriz = allCompanies.find(c => c.id === user.companyId);
      if (updatedMatriz) {
        setMatrizCompany(updatedMatriz);
        
        // Verificar se a matriz está configurada
        const isConfigured = Boolean(updatedMatriz.cnpj && updatedMatriz.city && updatedMatriz.state);
        if (isConfigured && user.matrizConfigured === false) {
          updateUser({ matrizConfigured: true });
        }
      }
    }
  }, [companies, user?.companyId, user?.matrizConfigured, updateUser]);

  return {
    showTutorial,
    showMatrizSetup,
    matrizCompany,
    completeTutorial,
    completeMatrizSetup,
    needsMatrizSetup: matrizCompany && (!matrizCompany.cnpj || !matrizCompany.city || !matrizCompany.state),
  };
}
