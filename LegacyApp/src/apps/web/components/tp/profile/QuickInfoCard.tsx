'use client';

import { MockCoachPermission, MockCoachStatus } from '@ppa/mock';

interface QuickInfoCardProps {
  role: string;
  permission: MockCoachPermission;
  status: MockCoachStatus;
}

const permissionConfig: Record<MockCoachPermission, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
  edit: { label: 'Edit', className: 'bg-blue-100 text-blue-700' },
  view: { label: 'View', className: 'bg-gray-100 text-gray-700' },
};

const statusConfig: Record<MockCoachStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'border-green-300 text-green-700' },
  invited: { label: 'Invited', className: 'border-amber-300 text-amber-700' },
  inactive: { label: 'Inactive', className: 'border-gray-300 text-gray-500' },
};

export function QuickInfoCard({ role, permission, status }: QuickInfoCardProps) {
  const permConfig = permissionConfig[permission];
  const statConfig = statusConfig[status];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Info</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Role</span>
          <span className="text-sm font-medium text-gray-900">{role}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Permission</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${permConfig.className}`}>
            {permConfig.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${statConfig.className}`}>
            {statConfig.label}
          </span>
        </div>
      </div>
    </div>
  );
}
