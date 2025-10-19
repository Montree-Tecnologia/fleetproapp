import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPermissions, ModulePermission } from '@/hooks/useMockData';
import { Separator } from '@/components/ui/separator';

interface PermissionsManagerProps {
  permissions: UserPermissions;
  onChange: (permissions: UserPermissions) => void;
  role: 'admin' | 'manager' | 'operator';
}

type ModuleConfig = {
  key: keyof Omit<UserPermissions, 'dashboard'>;
  label: string;
  hasActions: true;
};

type DashboardConfig = {
  key: 'dashboard';
  label: string;
  hasActions: false;
};

const modules: (ModuleConfig | DashboardConfig)[] = [
  { key: 'dashboard', label: 'Dashboard', hasActions: false },
  { key: 'vehicles', label: 'Gestão de Frota', hasActions: true },
  { key: 'drivers', label: 'Motoristas', hasActions: true },
  { key: 'refuelings', label: 'Abastecimentos', hasActions: true },
  { key: 'refrigeration', label: 'Refrigeração', hasActions: true },
  { key: 'suppliers', label: 'Fornecedores', hasActions: true },
  { key: 'companies', label: 'Empresas', hasActions: true },
  { key: 'users', label: 'Usuários', hasActions: true },
];

export function PermissionsManager({ permissions, onChange, role }: PermissionsManagerProps) {
  const handleDashboardChange = (checked: boolean) => {
    onChange({
      ...permissions,
      dashboard: { view: checked },
    });
  };

  const handleModuleChange = (
    moduleKey: keyof Omit<UserPermissions, 'dashboard'>,
    action: keyof ModulePermission,
    checked: boolean
  ) => {
    const currentModule = permissions[moduleKey] || { view: false, edit: false, delete: false };
    
    let updatedModule = {
      ...currentModule,
      [action]: checked,
    };

    // Se desmarcar "view", desmarcar também "edit" e "delete"
    if (action === 'view' && !checked) {
      updatedModule = { view: false, edit: false, delete: false };
    }
    
    // Se marcar "edit" ou "delete", marcar automaticamente "view"
    if ((action === 'edit' || action === 'delete') && checked) {
      updatedModule.view = true;
    }

    onChange({
      ...permissions,
      [moduleKey]: updatedModule,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Permissões Customizadas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure permissões específicas para este usuário. 
          {role === 'admin' && ' (Administradores têm acesso total por padrão)'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {modules.map((module, index) => (
          <div key={module.key}>
            {index > 0 && <Separator className="my-4" />}
            <div className="space-y-3">
              <Label className="text-base font-medium">{module.label}</Label>
              
              {!module.hasActions ? (
                // Dashboard - apenas visualizar
                <div className="flex items-center space-x-2 ml-4">
                  <Checkbox
                    id={`${module.key}-view`}
                    checked={permissions.dashboard?.view ?? false}
                    onCheckedChange={(checked) => handleDashboardChange(checked as boolean)}
                    disabled={role === 'admin'}
                  />
                  <Label
                    htmlFor={`${module.key}-view`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    Visualizar
                  </Label>
                </div>
              ) : (
                // Outros módulos - visualizar, editar, excluir
                <div className="grid grid-cols-3 gap-4 ml-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${module.key}-view`}
                      checked={(permissions[module.key] as ModulePermission)?.view ?? false}
                      onCheckedChange={(checked) =>
                        handleModuleChange(module.key, 'view', checked as boolean)
                      }
                      disabled={role === 'admin'}
                    />
                    <Label
                      htmlFor={`${module.key}-view`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Visualizar
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${module.key}-edit`}
                      checked={(permissions[module.key] as ModulePermission)?.edit ?? false}
                      onCheckedChange={(checked) =>
                        handleModuleChange(module.key, 'edit', checked as boolean)
                      }
                      disabled={role === 'admin'}
                    />
                    <Label
                      htmlFor={`${module.key}-edit`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Editar
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${module.key}-delete`}
                      checked={(permissions[module.key] as ModulePermission)?.delete ?? false}
                      onCheckedChange={(checked) =>
                        handleModuleChange(module.key, 'delete', checked as boolean)
                      }
                      disabled={role === 'admin'}
                    />
                    <Label
                      htmlFor={`${module.key}-delete`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      Excluir
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {role === 'admin' && (
          <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-md">
            ℹ️ Administradores possuem acesso total a todos os módulos automaticamente.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
