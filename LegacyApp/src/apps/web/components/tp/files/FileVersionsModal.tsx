'use client';

import { FileVersion } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, RotateCcw, Trash2, Download, Clock } from 'lucide-react';

interface FileVersionsModalProps {
  open: boolean;
  onClose: () => void;
  versions: FileVersion[];
  currentVersionId?: string;
  onRestore: (versionId: string) => Promise<void>;
  onDelete: (versionId: string) => Promise<void>;
  onDownload: (version: FileVersion) => void;
  isLoading?: boolean;
  isRestoring?: boolean;
  isDeleting?: boolean;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileVersionsModal({
  open,
  onClose,
  versions,
  currentVersionId,
  onRestore,
  onDelete,
  onDownload,
  isLoading = false,
  isRestoring = false,
  isDeleting = false,
}: FileVersionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#356793]" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No version history available</p>
              <p className="text-sm mt-1">Upload a new version to start tracking history</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {versions.map((version) => {
                const isCurrent = version.id === currentVersionId;
                return (
                  <div
                    key={version.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          Version {version.versionNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(version.uploadedAt)} • {formatFileSize(version.size)}
                      </p>
                      {version.note && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{version.note}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(version)}
                        className="h-8 w-8 p-0"
                        title="Download this version"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {!isCurrent && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRestore(version.id)}
                            disabled={isRestoring}
                            className="h-8 w-8 p-0"
                            title="Restore this version"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(version.id)}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete this version"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
