'use client';

import { Folder } from '@ppa/interfaces';
import { ChevronRight, Home, FolderIcon } from 'lucide-react';

interface FolderBreadcrumbProps {
  path: Folder[];
  onNavigate: (folderId: string | null) => void;
}

export function FolderBreadcrumb({ path, onNavigate }: FolderBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto py-2">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 shrink-0"
      >
        <Home className="w-4 h-4" />
        <span>Files</span>
      </button>
      
      {path.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => onNavigate(folder.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              index === path.length - 1
                ? 'text-gray-900 font-medium bg-gray-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FolderIcon className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{folder.name}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
