import { StateCreator } from 'zustand';
import { File } from '@ppa/interfaces';
import {
  uploadFile as uploadFileService,
  updateFile as updateFileService,
  deleteFile as deleteFileService,
} from '@ppa/firebase';

export type CreateFileInput = Omit<File, 'id' | 'ref' | 'col' | 'url' | 'currentVersionId' | 'versionCount'>;
export type UpdateFileInput = Partial<Omit<File, 'id' | 'ref' | 'col' | 'url' | 'uploadedAt' | 'uploadedBy' | 'currentVersionId' | 'versionCount'>>;

export interface FileSlice {
  files: File[];
  file: File | null;
  favoriteFiles: File[];
  recentFiles: File[];

  filesLoading: boolean;
  fileUploading: boolean;
  fileUpdating: boolean;
  fileDeleting: boolean;
  filesError: string | null;
  uploadProgress: number;

  storageUsedBytes: number;
  storageLimitBytes: number;

  setFiles: (files: File[]) => void;
  setFile: (file: File | null) => void;
  setUploadProgress: (progress: number) => void;
  setStorageUsed: (bytes: number) => void;
  setStorageLimit: (bytes: number) => void;

  setFilesError: (error: string | null) => void;
  clearFilesError: () => void;

  uploadFile: (teamId: string, fileBlob: Blob, metadata: CreateFileInput) => Promise<File>;
  updateFile: (teamId: string, fileId: string, updates: UpdateFileInput) => Promise<void>;
  deleteFile: (teamId: string, fileId: string, fileUrl?: string) => Promise<void>;

  toggleFavorite: (teamId: string, fileId: string) => Promise<void>;
  updateLastAccessed: (teamId: string, fileId: string) => Promise<void>;
  moveFile: (teamId: string, fileId: string, folderId: string | null) => Promise<void>;
  bulkDeleteFiles: (teamId: string, fileIds: string[]) => Promise<void>;
  bulkMoveFiles: (teamId: string, fileIds: string[], folderId: string | null) => Promise<void>;

  computeFavorites: () => void;
  computeRecentFiles: () => void;
}

export const createFileSlice: StateCreator<FileSlice> = (set, get) => ({
  files: [],
  file: null,
  favoriteFiles: [],
  recentFiles: [],

  filesLoading: false,
  fileUploading: false,
  fileUpdating: false,
  fileDeleting: false,
  filesError: null,
  uploadProgress: 0,

  storageUsedBytes: 0,
  storageLimitBytes: 0,

  // Deduplicate by ID to prevent duplicates from optimistic updates + listeners
  setFiles: (files) => {
    const seen = new Set<string>();
    const deduplicated = files.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
    set({ files: deduplicated });
    get().computeFavorites();
    get().computeRecentFiles();
  },
  setFile: (file) => set({ file }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setStorageUsed: (bytes) => set({ storageUsedBytes: bytes }),
  setStorageLimit: (bytes) => set({ storageLimitBytes: bytes }),

  setFilesError: (error) => set({ filesError: error }),
  clearFilesError: () => set({ filesError: null }),

  uploadFile: async (teamId: string, fileBlob: Blob, metadata: CreateFileInput) => {
    set({ fileUploading: true, filesError: null, uploadProgress: 0 });
    try {
      const newFile = await uploadFileService(teamId, fileBlob, metadata, (progress) => {
        set({ uploadProgress: progress });
      });
      // Deduplicate to prevent doubles from optimistic update + listener
      set((state) => {
        const exists = state.files.some((f) => f.id === newFile.id);
        return {
          files: exists ? state.files : [newFile, ...state.files],
          fileUploading: false,
          uploadProgress: 100,
          storageUsedBytes: exists ? state.storageUsedBytes : state.storageUsedBytes + newFile.size,
        };
      });
      get().computeRecentFiles();
      return newFile;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload file';
      set({ filesError: message, fileUploading: false, uploadProgress: 0 });
      throw error;
    }
  },

  updateFile: async (teamId: string, fileId: string, updates: UpdateFileInput) => {
    set({ fileUpdating: true, filesError: null });
    try {
      await updateFileService(teamId, fileId, updates);
      set((state) => ({
        files: state.files.map((f) => (f.id === fileId ? { ...f, ...updates } : f)),
        file: state.file?.id === fileId ? { ...state.file, ...updates } : state.file,
        fileUpdating: false,
      }));
      if (updates.isFavorite !== undefined) {
        get().computeFavorites();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update file';
      set({ filesError: message, fileUpdating: false });
      throw error;
    }
  },

  deleteFile: async (teamId: string, fileId: string, fileUrl?: string) => {
    set({ fileDeleting: true, filesError: null });
    try {
      const fileToDelete = get().files.find((f) => f.id === fileId);
      await deleteFileService(teamId, fileId, fileUrl);
      set((state) => ({
        files: state.files.filter((f) => f.id !== fileId),
        file: state.file?.id === fileId ? null : state.file,
        fileDeleting: false,
        storageUsedBytes: fileToDelete ? state.storageUsedBytes - fileToDelete.size : state.storageUsedBytes,
      }));
      get().computeFavorites();
      get().computeRecentFiles();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete file';
      set({ filesError: message, fileDeleting: false });
      throw error;
    }
  },

  toggleFavorite: async (teamId: string, fileId: string) => {
    const file = get().files.find((f) => f.id === fileId);
    if (!file) return;
    
    const newValue = !file.isFavorite;
    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, isFavorite: newValue } : f)),
    }));
    get().computeFavorites();
    
    try {
      await updateFileService(teamId, fileId, { isFavorite: newValue });
    } catch (error) {
      set((state) => ({
        files: state.files.map((f) => (f.id === fileId ? { ...f, isFavorite: !newValue } : f)),
      }));
      get().computeFavorites();
      throw error;
    }
  },

  updateLastAccessed: async (teamId: string, fileId: string) => {
    const now = Date.now();
    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, lastAccessedAt: now } : f)),
    }));
    get().computeRecentFiles();
    
    try {
      await updateFileService(teamId, fileId, { lastAccessedAt: now });
    } catch (error) {
      console.error('Failed to update last accessed:', error);
    }
  },

  moveFile: async (teamId: string, fileId: string, folderId: string | null) => {
    const originalFile = get().files.find((f) => f.id === fileId);
    if (!originalFile) return;
    
    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, folderId } : f)),
    }));
    
    try {
      await updateFileService(teamId, fileId, { folderId });
    } catch (error) {
      set((state) => ({
        files: state.files.map((f) => (f.id === fileId ? { ...f, folderId: originalFile.folderId } : f)),
      }));
      throw error;
    }
  },

  bulkDeleteFiles: async (teamId: string, fileIds: string[]) => {
    set({ fileDeleting: true, filesError: null });
    const errors: string[] = [];
    const deletedIds: string[] = [];
    let bytesFreed = 0;
    
    for (const fileId of fileIds) {
      try {
        const file = get().files.find((f) => f.id === fileId);
        await deleteFileService(teamId, fileId, file?.url);
        deletedIds.push(fileId);
        if (file) bytesFreed += file.size;
      } catch (error) {
        errors.push(fileId);
      }
    }
    
    set((state) => ({
      files: state.files.filter((f) => !deletedIds.includes(f.id)),
      file: state.file && deletedIds.includes(state.file.id) ? null : state.file,
      fileDeleting: false,
      storageUsedBytes: state.storageUsedBytes - bytesFreed,
      filesError: errors.length > 0 ? `Failed to delete ${errors.length} file(s)` : null,
    }));
    get().computeFavorites();
    get().computeRecentFiles();
  },

  bulkMoveFiles: async (teamId: string, fileIds: string[], folderId: string | null) => {
    set({ fileUpdating: true, filesError: null });
    const originalFolders = new Map<string, string | null | undefined>();
    const errors: string[] = [];
    
    fileIds.forEach((id) => {
      const file = get().files.find((f) => f.id === id);
      if (file) originalFolders.set(id, file.folderId);
    });
    
    set((state) => ({
      files: state.files.map((f) => (fileIds.includes(f.id) ? { ...f, folderId } : f)),
    }));
    
    for (const fileId of fileIds) {
      try {
        await updateFileService(teamId, fileId, { folderId });
      } catch (error) {
        errors.push(fileId);
      }
    }
    
    if (errors.length > 0) {
      set((state) => ({
        files: state.files.map((f) => {
          if (errors.includes(f.id)) {
            return { ...f, folderId: originalFolders.get(f.id) ?? f.folderId };
          }
          return f;
        }),
        filesError: `Failed to move ${errors.length} file(s)`,
      }));
    }
    
    set({ fileUpdating: false });
  },

  computeFavorites: () => {
    const files = get().files;
    const favorites = files.filter((f) => f.isFavorite).sort((a, b) => b.uploadedAt - a.uploadedAt);
    set({ favoriteFiles: favorites });
  },

  computeRecentFiles: () => {
    const files = get().files;
    const recent = [...files]
      .filter((f) => f.lastAccessedAt)
      .sort((a, b) => (b.lastAccessedAt || 0) - (a.lastAccessedAt || 0))
      .slice(0, 10);
    set({ recentFiles: recent });
  },
});
