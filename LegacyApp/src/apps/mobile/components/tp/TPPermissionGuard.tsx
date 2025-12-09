import { ReactNode } from 'react';
import { Lock } from 'lucide-react-native';
import { TPEmpty } from './TPEmpty';

export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';

interface TPPermissionGuardProps {
  children: ReactNode;
  require: PermissionLevel;
  currentLevel?: PermissionLevel;
  fallback?: ReactNode;
  showMessage?: boolean;
}

const levelMap: Record<PermissionLevel, number> = {
  none: 0,
  view: 1,
  edit: 2,
  admin: 3,
};

/**
 * TPPermissionGuard - Permission-based access control component
 * Wraps content and shows/hides based on user permissions
 *
 * @example
 * <TPPermissionGuard require="edit" currentLevel={userPermission}>
 *   <NewPlanScreen />
 * </TPPermissionGuard>
 *
 * @example
 * <TPPermissionGuard require="admin" currentLevel={userPermission} showMessage={false}>
 *   <Button onPress={handleDelete}>Delete</Button>
 * </TPPermissionGuard>
 */
export function TPPermissionGuard({
  children,
  require: requiredLevel,
  currentLevel = 'view',
  fallback,
  showMessage = true,
}: TPPermissionGuardProps) {
  const hasPermission = levelMap[currentLevel] >= levelMap[requiredLevel];

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;

    if (showMessage) {
      return (
        <TPEmpty
          icon={Lock}
          title="Access Restricted"
          message="You don't have permission to access this feature"
        />
      );
    }

    return null;
  }

  return <>{children}</>;
}
