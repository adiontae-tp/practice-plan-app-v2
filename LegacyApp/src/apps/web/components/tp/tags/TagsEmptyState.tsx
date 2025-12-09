'use client';

import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TagsEmptyStateProps {
  onCreateClick: () => void;
}

export function TagsEmptyState({ onCreateClick }: TagsEmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Tag className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No tags yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Create your first tag to organize activities
      </p>
      <Button
        onClick={onCreateClick}
        className="bg-[#356793] hover:bg-[#2a5275]"
        data-testid="add-tag"
      >
        + Create Tag
      </Button>
    </div>
  );
}
