'use client';

import { File as AppFile, FileCategory } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Image,
  Table,
  Video,
  Music,
  Archive,
  File,
  ExternalLink,
  Download,
  Share2,
  Trash2,
  Calendar,
} from 'lucide-react';

interface FileDetailModalProps {
  open: boolean;
  file: AppFile | null;
  onClose: () => void;
  onOpen: (file: AppFile) => void;
  onDownload: (file: AppFile) => void;
  onShare: (file: AppFile) => void;
  onDelete: (file: AppFile) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const categoryIcons: Record<FileCategory, React.ComponentType<{ className?: string }>> = {
  playbook: FileText,
  roster: Table,
  schedule: Calendar, // Wait, Calendar not imported?
  // Mapping mock categories to interface categories
  // Interface: playbook, roster, schedule, media, other
  // Mock: document, image, spreadsheet, video, audio, archive, other
  // Need to update mapping
  media: Image,
  other: File,
};

const categoryLabels: Record<FileCategory, string> = {
  playbook: 'Playbook',
  roster: 'Roster',
  schedule: 'Schedule',
  media: 'Media',
  other: 'Other',
};

export function FileDetailModal({
  open,
  file,
  onClose,
  onOpen,
  onDownload,
  onShare,
  onDelete,
}: FileDetailModalProps) {
  if (!file) return null;

  const Icon = categoryIcons[file.category] || File;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>File Details</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* File Icon */}
          <div className="flex flex-col items-center py-4 border rounded-lg bg-gray-50">
            <div className="w-16 h-16 rounded-lg bg-white border flex items-center justify-center mb-3">
              <Icon className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 text-center px-4 break-all">
              {file.name}
            </p>
          </div>

          {/* File Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">File Name</span>
              <span className="text-gray-900 font-medium">{file.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-900">{categoryLabels[file.category]}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Size</span>
              <span className="text-gray-900">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Uploaded By</span>
              <span className="text-gray-900">{file.uploadedBy}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Uploaded</span>
              <span className="text-gray-900">{formatDate(file.uploadedAt)}</span>
            </div>
            {file.description && (
              <div className="py-2">
                <span className="text-gray-500 block mb-1">Description</span>
                <span className="text-gray-900">{file.description}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpen(file)}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(file)}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(file)}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(file);
              }}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
