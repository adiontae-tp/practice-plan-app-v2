'use client';

import { useMemo } from 'react';
import { MWCard, MWCardList, MWCardIcon, MWSearchBar, MWPageContent } from '@ppa/mobile-web';
import {
  FileText,
  Image,
  File as FileIcon,
  Folder as FolderIcon,
  Star,
  Home,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { File as AppFile, Folder, FileType, FileCategory } from '@ppa/interfaces';

const FILE_CATEGORIES: { value: FileCategory; label: string }[] = [
  { value: 'playbook', label: 'Playbook' },
  { value: 'roster', label: 'Roster' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'media', label: 'Media' },
  { value: 'other', label: 'Other' },
];

function getFileIcon(type: FileType) {
  const iconProps = { size: 20 };
  switch (type) {
    case 'pdf':
      return <FileText {...iconProps} className="text-red-600" />;
    case 'image':
      return <Image {...iconProps} className="text-green-600" />;
    case 'video':
      return <FileText {...iconProps} className="text-purple-600" />;
    case 'document':
      return <FileIcon {...iconProps} className="text-blue-600" />;
    default:
      return <FileIcon {...iconProps} className="text-gray-500" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export interface FilesMobileViewProps {
  files: AppFile[];
  folders: Folder[];
  currentFolderId: string | null;
  searchQuery: string;
  selectedCategory: FileCategory | null;
  folderBreadcrumbs: Folder[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: FileCategory | null) => void;
  onFolderClick: (folder: Folder) => void;
  onFileClick: (file: AppFile) => void;
  onBreadcrumbNavigate: (folderId: string | null) => void;
  onUploadClick: () => void;
  onNewFolderClick: () => void;
  canUpload: boolean;
  canCreateFolders: boolean;
}

export function FilesMobileView({
  files,
  folders,
  currentFolderId,
  searchQuery,
  selectedCategory,
  folderBreadcrumbs,
  onSearchChange,
  onCategoryChange,
  onFolderClick,
  onFileClick,
  onBreadcrumbNavigate,
  onUploadClick,
  onNewFolderClick,
  canUpload,
  canCreateFolders,
}: FilesMobileViewProps) {
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch =
        !searchQuery ||
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || file.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [files, searchQuery, selectedCategory]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;
    return folders.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folders, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb navigation */}
      {currentFolderId && folderBreadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-2">
          <button
            onClick={() => onBreadcrumbNavigate(null)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Home className="w-4 h-4" />
          </button>
          {folderBreadcrumbs.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => onBreadcrumbNavigate(folder.id)}
                className={`text-sm font-medium ${
                  index === folderBreadcrumbs.length - 1
                    ? 'text-gray-900'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <MWSearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search files..."
      />

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="whitespace-nowrap"
        >
          All
        </Button>
        {FILE_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(cat.value)}
            className="whitespace-nowrap"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button onClick={onUploadClick} className="flex-1">
          Upload File
        </Button>
        {canCreateFolders && (
          <Button onClick={onNewFolderClick} variant="outline">
            New Folder
          </Button>
        )}
      </div>

      {/* Folders list */}
      {filteredFolders.length > 0 && (
        <MWCardList
          count={filteredFolders.length}
          singularLabel="Folder"
          pluralLabel="Folders"
        >
          {filteredFolders.map((folder) => (
            <MWCard key={folder.id} onPress={() => onFolderClick(folder)}>
              <div className="flex items-center gap-3">
                <MWCardIcon color="blue">
                  <FolderIcon />
                </MWCardIcon>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {folder.name}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(folder.createdAt)}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </MWCard>
          ))}
        </MWCardList>
      )}

      {/* Files list */}
      {filteredFiles.length > 0 && (
        <MWCardList
          count={filteredFiles.length}
          singularLabel="File"
          pluralLabel="Files"
        >
          {filteredFiles.map((file) => (
            <MWCard key={file.id} onPress={() => onFileClick(file)}>
              <div className="flex items-start gap-3">
                <MWCardIcon color="gray">
                  {getFileIcon(file.type)}
                </MWCardIcon>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {file.name}
                    </p>
                    {file.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                  </div>
                  {file.description && (
                    <p className="text-sm text-gray-600 truncate mt-0.5">{file.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                    {file.category && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                        {file.category}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </MWCard>
          ))}
        </MWCardList>
      )}

      {/* Empty state */}
      {filteredFolders.length === 0 && filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderIcon className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCategory ? 'No files found' : 'No files yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery || selectedCategory
              ? 'Try a different search or filter'
              : 'Upload documents and attachments'}
          </p>
        </div>
      )}
    </div>
  );
}
