'use client';

type Permission = 'admin' | 'edit' | 'view';

interface PermissionBadgeProps {
  permission: Permission;
}

const permissionConfig: Record<Permission, { label: string }> = {
  admin: { label: 'Admin' },
  edit: { label: 'Edit' },
  view: { label: 'View' },
};

export function PermissionBadge({ permission }: PermissionBadgeProps) {
  const config = permissionConfig[permission];

  return (
    <span className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700">
      {config.label}
    </span>
  );
}
