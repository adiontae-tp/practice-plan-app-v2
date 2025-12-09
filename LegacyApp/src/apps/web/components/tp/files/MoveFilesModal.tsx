'use client';

import { useState } from 'react';
import { Folder as FolderType } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FolderIcon, ChevronRight, Home } from 'lucide-react';

interface MoveFilesModalProps {
  open: boolean;
  onClose: () => void;
  onMove: (folderId: string | null) => Promise<void>;
  folders: FolderType[];
  currentFolderId: string | null;
  itemCount: number;
  itemType: 'file' | 'folder' | 'mixed';
}

export function MoveFilesModal({
  open,
  onClose,
  onMove,
  folders,
  currentFolderId,
  itemCount,
  itemType,
}: MoveFilesModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleMove = async () => {
    setIsMoving(true);
    try {
      await onMove(selectedFolderId);
      onClose();
    } catch (error) {
      console.error('Failed to move:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isMoving) {
      setSelectedFolderId(null);
      onClose();
    }
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const children = folders.filter((f) => f.parentId === folder.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isCurrent = currentFolderId === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => setSelectedFolderId(folder.id)}
          disabled={isCurrent}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            isSelected
              ? 'bg-blue-100 text-blue-900'
              : isCurrent
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          <FolderIcon className="w-4 h-4 text-yellow-500" />
          <span className="text-sm truncate">{folder.name}</span>
          {isCurrent && <span className="text-xs text-gray-400 ml-auto">(current)</span>}
        </button>
        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter((f) => !f.parentId);

  const itemLabel = itemType === 'file' 
    ? `${itemCount} file${itemCount > 1 ? 's' : ''}`
    : itemType === 'folder'
    ? `${itemCount} folder${itemCount > 1 ? 's' : ''}`
    : `${itemCount} item${itemCount > 1 ? 's' : ''}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move {itemLabel}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-3">Select destination folder:</p>
          <div className="border rounded-lg max-h-[300px] overflow-y-auto">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                selectedFolderId === null
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Root (No folder)</span>
            </button>
            {rootFolders.map((folder) => renderFolder(folder))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMoving}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={isMoving}
            className="bg-[#356793] hover:bg-[#2a5275]"
          >
            {isMoving ? 'Moving...' : 'Move Here'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
