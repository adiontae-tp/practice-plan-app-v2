'use client';

import { FileCategory } from '@ppa/interfaces';

interface FileCategoryBadgeProps {
  category: FileCategory;
}

const categoryLabels: Record<FileCategory, string> = {
  playbook: 'Playbook',
  roster: 'Roster',
  schedule: 'Schedule',
  media: 'Media',
  other: 'Other',
};

export function FileCategoryBadge({ category }: FileCategoryBadgeProps) {
  return (
    <span className="text-sm text-gray-600">
      {categoryLabels[category]}
    </span>
  );
}
