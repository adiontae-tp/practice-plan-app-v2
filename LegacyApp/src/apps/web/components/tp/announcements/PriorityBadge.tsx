'use client';

import { AnnouncementPriority } from '@ppa/interfaces';

interface PriorityBadgeProps {
  priority: AnnouncementPriority;
}

const priorityConfig: Record<AnnouncementPriority, { label: string; className: string }> = {
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-700',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-100 text-amber-700',
  },
  low: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-600',
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
