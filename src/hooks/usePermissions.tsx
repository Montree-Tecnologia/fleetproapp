import { useAuth } from './useAuth';

export type Permission = 
  | 'view_dashboard'
  | 'manage_vehicles'
  | 'manage_refuelings'
  | 'manage_refrigeration'
  | 'manage_suppliers'
  | 'manage_companies'
  | 'manage_users'
  | 'view_settings';

const rolePermissions: Record<string, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_vehicles',
    'manage_refuelings',
    'manage_refrigeration',
    'manage_suppliers',
    'manage_companies',
    'manage_users',
    'view_settings',
  ],
  manager: [
    'view_dashboard',
    'manage_vehicles',
    'manage_refuelings',
    'manage_refrigeration',
    'manage_suppliers',
  ],
  operator: [
    'view_dashboard',
    'manage_refuelings',
  ],
};

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager';
  const isOperator = () => user?.role === 'operator';

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    isOperator,
  };
}
