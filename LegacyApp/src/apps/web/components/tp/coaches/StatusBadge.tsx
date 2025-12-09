'use client';

type Status = 'active' | 'invited' | 'inactive';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string }> = {
  active: { label: 'Active' },
  invited: { label: 'Invited' },
  inactive: { label: 'Inactive' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center px-3 py-1 rounded border border-gray-300 text-xs font-semibold text-gray-600">
      {config.label}
    </span>
  );
}
