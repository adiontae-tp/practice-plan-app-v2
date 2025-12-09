'use client';

import { FileStack, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplatesEmptyStateProps {
  onAdd: () => void;
}

export function TemplatesEmptyState({ onAdd }: TemplatesEmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <FileStack className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Create reusable practice templates to quickly set up new practice plans with your favorite period combinations.
      </p>
      <Button onClick={onAdd} className="bg-[#356793] hover:bg-[#2a5275]">
        <Plus className="w-4 h-4 mr-1" />
        Create Your First Template
      </Button>
    </div>
  );
}
