'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FileCategory, FileType, Folder } from '@ppa/interfaces';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, FolderIcon } from 'lucide-react';

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[], category: FileCategory, description?: string, folderId?: string, tags?: string[]) => void;
  folders?: Folder[];
  currentFolderId?: string | null;
  uploadProgress?: number;
  isUploading?: boolean;
}

const categoryOptions: { value: FileCategory; label: string }[] = [
  { value: 'playbook', label: 'Playbook' },
  { value: 'roster', label: 'Roster' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'media', label: 'Media' },
  { value: 'other', label: 'Other' },
];

function detectFileType(mimeType: string): FileType {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('audio')) return 'audio';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
  return 'other';
}

function detectCategory(mimeType: string, fileName: string): FileCategory {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const lowerName = fileName.toLowerCase();

  if (lowerName.includes('playbook') || lowerName.includes('play')) return 'playbook';
  if (lowerName.includes('roster') || lowerName.includes('player')) return 'roster';
  if (lowerName.includes('schedule') || lowerName.includes('calendar')) return 'schedule';
  if (mimeType.includes('image') || mimeType.includes('video') || mimeType.includes('audio')) return 'media';
  if (['mp4', 'mov', 'avi', 'webm', 'jpg', 'jpeg', 'png', 'gif', 'mp3', 'wav'].includes(ext)) return 'media';
  
  return 'other';
}

export function FileUploadModal({ 
  open, 
  onClose, 
  onUpload,
  folders = [],
  currentFolderId,
  uploadProgress = 0,
  isUploading = false,
}: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<FileCategory>('other');
  const [description, setDescription] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(currentFolderId || undefined);
  const [tags, setTags] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedFiles([]);
      setCategory('other');
      setDescription('');
      setSelectedFolderId(currentFolderId || undefined);
      setTags('');
      setIsDragOver(false);
    }
  }, [open, currentFolderId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      const firstFile = files[0];
      setCategory(detectCategory(firstFile.type, firstFile.name));
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      const firstFile = files[0];
      setCategory(detectCategory(firstFile.type, firstFile.name));
    }
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length > 0) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      onUpload(selectedFiles, category, description || undefined, selectedFolderId, tagArray.length > 0 ? tagArray : undefined);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isUploading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                data-testid="file-upload-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={isUploading}
                className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
                  isDragOver 
                    ? 'border-[#356793] bg-blue-50' 
                    : 'border-gray-300 hover:border-[#356793]'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className={`w-8 h-8 mb-2 ${isDragOver ? 'text-[#356793]' : 'text-gray-400'}`} />
                {selectedFiles.length > 0 ? (
                  <span className="text-sm text-gray-900 font-medium">
                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-gray-500">
                      {isDragOver ? 'Drop files here' : 'Drag & drop or click to browse'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PDF, Images, Documents, Videos
                    </span>
                  </>
                )}
              </button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isUploading && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#356793] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {folders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder
                </label>
                <select
                  value={selectedFolderId || ''}
                  onChange={(e) => setSelectedFolderId(e.target.value || undefined)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#356793] focus:border-transparent"
                >
                  <option value="">Root (No folder)</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FileCategory)}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#356793] focus:border-transparent"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter file description..."
                disabled={isUploading}
                data-testid="file-description-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas..."
                disabled={isUploading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={selectedFiles.length === 0 || isUploading}
              className="bg-[#356793] hover:bg-[#2a5275]"
              data-testid="save-file"
            >
              {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
