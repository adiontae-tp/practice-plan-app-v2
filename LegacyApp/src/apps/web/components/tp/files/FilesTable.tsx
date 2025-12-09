'use client';

import { File as AppFile, Folder } from '@ppa/interfaces';
import { X, Search, Plus, FolderPlus, FolderIcon, Star, ChevronUp, ChevronDown, ChevronRight, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileCategoryBadge } from './FileCategoryBadge';

type SortField = 'name' | 'uploadedAt' | 'size' | 'category';
type SortOrder = 'asc' | 'desc';

interface FilesTableProps {
  files: AppFile[];
  folders: Folder[];
  totalCount: number;
  searchQuery: string;
  selectedIds: string[];
  currentFolderId: string | null;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  onSearchChange: (query: string) => void;
  onRowClick: (file: AppFile) => void;
  onFolderClick: (folder: Folder) => void;
  onDelete: (file: AppFile) => void;
  onAdd: () => void;
  onAddFolder?: () => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onToggleFavorite?: (file: AppFile) => void;
  onSort?: (field: SortField) => void;
  canUpload?: boolean;
  canCreateFolders?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  });
}

export function FilesTable({
  files,
  folders,
  totalCount,
  searchQuery,
  selectedIds,
  currentFolderId,
  sortBy = 'uploadedAt',
  sortOrder = 'desc',
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
  canUpload = true,
  canCreateFolders = true,
}: FilesTableProps) {
  const currentFolders = folders.filter((f) => f.parentId === currentFolderId);
  const currentFiles = files.filter((f) => f.folderId === currentFolderId);
  const allIds = [...currentFolders.map(f => `folder-${f.id}`), ...currentFiles.map(f => f.id)];
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;
  const isEmpty = currentFolders.length === 0 && currentFiles.length === 0;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  const handleHeaderClick = (field: SortField) => {
    onSort?.(field);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Files</h2>
          <span className="text-sm text-gray-500">({totalCount})</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files..."
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            {onAddFolder && canCreateFolders && (
              <Button
                onClick={onAddFolder}
                variant="outline"
                data-testid="add-folder"
                className="flex-1 sm:flex-none"
              >
                <FolderPlus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">New Folder</span>
                <span className="sm:hidden">Folder</span>
              </Button>
            )}
            {canUpload && (
              <Button
                onClick={onAdd}
                className="bg-[#356793] hover:bg-[#2a5275] flex-1 sm:flex-none"
                data-testid="add-file"
              >
                <Plus className="w-4 h-4 mr-1" />
                Upload
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden">
        {isEmpty ? (
          <div className="px-4 py-12 text-center text-gray-500">
            {searchQuery ? `No files found matching "${searchQuery}"` : 'No files yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Folders */}
            {currentFolders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => onFolderClick(folder)}
                className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FolderIcon className="w-5 h-5 text-yellow-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(folder.createdAt)}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            ))}
            {/* Files */}
            {currentFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => onRowClick(file)}
                className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {onToggleFavorite && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(file);
                      }}
                      className={`p-1 rounded shrink-0 ${
                        file.isFavorite ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-4 h-4" fill={file.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FileCategoryBadge category={file.category} />
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file);
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    data-testid="delete-file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="bg-gradient-to-r from-[#356793] to-[#2d5578]">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected; }}
                onChange={onSelectAll}
                className="rounded border-white/50"
              />
            </th>
            <th className="w-10 px-2 py-3"></th>
            <th 
              className="px-4 py-3 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10"
              onClick={() => handleHeaderClick('name')}
            >
              Name <SortIcon field="name" />
            </th>
            <th 
              className="w-28 px-4 py-3 text-center text-sm font-bold text-white cursor-pointer hover:bg-white/10"
              onClick={() => handleHeaderClick('category')}
            >
              Category <SortIcon field="category" />
            </th>
            <th className="w-36 px-4 py-3 text-left text-sm font-bold text-white">Uploaded By</th>
            <th 
              className="w-28 px-4 py-3 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/10"
              onClick={() => handleHeaderClick('uploadedAt')}
            >
              Date <SortIcon field="uploadedAt" />
            </th>
            <th 
              className="w-24 px-4 py-3 text-center text-sm font-bold text-white cursor-pointer hover:bg-white/10"
              onClick={() => handleHeaderClick('size')}
            >
              Size <SortIcon field="size" />
            </th>
            <th className="w-20 px-4 py-3 text-center text-sm font-bold text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentFolders.length === 0 && currentFiles.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                {searchQuery ? `No files found matching "${searchQuery}"` : 'No files yet'}
              </td>
            </tr>
          ) : (
            <>
              {currentFolders.map((folder) => {
                const folderId = `folder-${folder.id}`;
                const isSelected = selectedIds.includes(folderId);
                return (
                  <tr
                    key={folder.id}
                    onClick={() => onFolderClick(folder)}
                    className={`border-b border-gray-200 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-100' : 'hover:bg-blue-50'
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(folderId)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <FolderIcon className="w-5 h-5 text-yellow-500" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {folder.name}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-400">—</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{folder.createdBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(folder.createdAt)}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-400">—</td>
                    <td className="px-4 py-3 text-center"></td>
                  </tr>
                );
              })}
              {currentFiles.map((file) => {
                const isSelected = selectedIds.includes(file.id);
                return (
                  <tr
                    key={file.id}
                    onClick={() => onRowClick(file)}
                    className={`border-b border-gray-200 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-100' : 'hover:bg-blue-50'
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(file.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(file)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            file.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        >
                          <Star className="w-4 h-4" fill={file.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">
                      {file.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FileCategoryBadge category={file.category} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{file.uploadedBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(file.uploadedAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatFileSize(file.size)}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(file);
                        }}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        data-testid="delete-file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
