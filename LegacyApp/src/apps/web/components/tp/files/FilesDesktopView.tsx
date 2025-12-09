'use client';

import { File as AppFile, Folder } from '@ppa/interfaces';
import { Plus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilesTable } from './FilesTable';
import { FolderBreadcrumb } from './FolderBreadcrumb';
import { StorageUsageMeter } from './StorageUsageMeter';

export interface FilesDesktopViewProps {
  files: AppFile[];
  folders: Folder[];
  selectedIds: string[];
  currentFolderId: string | null;
  sortBy?: 'name' | 'size' | 'uploadedAt' | 'category';
  sortOrder: 'asc' | 'desc';
  totalCount: number;
  searchQuery: string;
  folderBreadcrumbs: Folder[];
  storageUsedBytes: number;
  storageLimitBytes: number;
  canUpload: boolean;
  canCreateFolders: boolean;
  onSearchChange: (query: string) => void;
  onRowClick: (file: AppFile) => void;
  onFolderClick: (folder: Folder) => void;
  onDelete: (file: AppFile) => void;
  onAdd: () => void;
  onAddFolder: () => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onToggleFavorite: (file: AppFile) => void;
  onSort: (field: 'name' | 'size' | 'uploadedAt' | 'category') => void;
  onBreadcrumbNavigate: (folderId: string | null) => void;
}

export function FilesDesktopView({
  files,
  folders,
  selectedIds,
  currentFolderId,
  sortBy,
  sortOrder,
  totalCount,
  searchQuery,
  folderBreadcrumbs,
  storageUsedBytes,
  storageLimitBytes,
  canUpload,
  canCreateFolders,
  onSearchChange,
  onRowClick,
  onFolderClick,
  onDelete,
  onAdd,
  onAddFolder,
  onToggleSelect,
  onSelectAll,
  onToggleFavorite,
  onSort,
  onBreadcrumbNavigate,
}: FilesDesktopViewProps) {
  return (
    <div className="space-y-4">
      {/* Header with breadcrumb and actions */}
      <div className="flex items-center justify-between">
        <FolderBreadcrumb
          path={folderBreadcrumbs}
          onNavigate={onBreadcrumbNavigate}
        />
        <div className="flex items-center gap-3">
          <StorageUsageMeter
            usedBytes={storageUsedBytes}
            limitBytes={storageLimitBytes}
          />
          {canCreateFolders && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddFolder}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          )}
          <Button
            size="sm"
            onClick={onAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Files Table */}
      <FilesTable
        files={files}
        folders={folders}
        selectedIds={selectedIds}
        currentFolderId={currentFolderId}
        sortBy={sortBy}
        sortOrder={sortOrder}
        totalCount={totalCount}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onRowClick={onRowClick}
        onFolderClick={onFolderClick}
        onDelete={onDelete}
        onAdd={onAdd}
        onAddFolder={onAddFolder}
        onToggleSelect={onToggleSelect}
        onSelectAll={onSelectAll}
        onToggleFavorite={onToggleFavorite}
        onSort={onSort}
        canUpload={canUpload}
        canCreateFolders={canCreateFolders}
      />
    </div>
  );
}
