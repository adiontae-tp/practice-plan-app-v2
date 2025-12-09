'use client';

import { X, Trash2, FolderInput, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileSelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onDownload?: () => void;
  isDeleting?: boolean;
}

export function FileSelectionBar({
  selectedCount,
  onClear,
  onDelete,
  onMove,
  onDownload,
  isDeleting = false,
}: FileSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-gray-100 text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-gray-900">
          {selectedCount} selected
        </span>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onMove}
          disabled={isDeleting}
          className="gap-1"
        >
          <FolderInput className="w-4 h-4" />
          Move
        </Button>

        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={isDeleting}
            className="gap-1"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}
