import { StateCreator } from 'zustand';
import { Folder } from '@ppa/interfaces';

export type CreateFolderInput = Omit<Folder, 'id' | 'ref' | 'col' | 'updatedAt'>;
export type UpdateFolderInput = Partial<Pick<Folder, 'name' | 'parentId'>>;

export interface FolderSlice {
  folders: Folder[];
  currentFolderId: string | null;
  folderPath: Folder[];

  foldersLoading: boolean;
  folderCreating: boolean;
  folderUpdating: boolean;
  folderDeleting: boolean;
  foldersError: string | null;

  setFolders: (folders: Folder[]) => void;
  setCurrentFolderId: (folderId: string | null) => void;
  setFoldersError: (error: string | null) => void;
  clearFoldersError: () => void;

  navigateToFolder: (folderId: string | null) => void;
  navigateUp: () => void;
  computeFolderPath: () => void;

  getFolderById: (folderId: string) => Folder | undefined;
  getChildFolders: (parentId: string | null) => Folder[];
  getFolderBreadcrumbs: (folderId: string | null) => Folder[];

  createFolder: (teamId: string, data: CreateFolderInput) => Promise<Folder>;
  updateFolder: (teamId: string, folderId: string, updates: UpdateFolderInput) => Promise<void>;
  deleteFolder: (teamId: string, folderId: string) => Promise<void>;
  moveFolder: (teamId: string, folderId: string, newParentId: string | null) => Promise<void>;
}

export const createFolderSlice: StateCreator<FolderSlice> = (set, get) => ({
  folders: [],
  currentFolderId: null,
  folderPath: [],

  foldersLoading: false,
  folderCreating: false,
  folderUpdating: false,
  folderDeleting: false,
  foldersError: null,

  // Deduplicate by ID to prevent duplicates from optimistic updates + listeners
  setFolders: (folders) => {
    const seen = new Set<string>();
    const deduplicated = folders.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
    set({ folders: deduplicated });
    get().computeFolderPath();
  },
  
  setCurrentFolderId: (folderId) => {
    set({ currentFolderId: folderId });
    get().computeFolderPath();
  },
  
  setFoldersError: (error) => set({ foldersError: error }),
  clearFoldersError: () => set({ foldersError: null }),

  navigateToFolder: (folderId) => {
    set({ currentFolderId: folderId });
    get().computeFolderPath();
  },

  navigateUp: () => {
    const currentId = get().currentFolderId;
    if (!currentId) return;
    
    const currentFolder = get().folders.find((f) => f.id === currentId);
    set({ currentFolderId: currentFolder?.parentId || null });
    get().computeFolderPath();
  },

  computeFolderPath: () => {
    const currentId = get().currentFolderId;
    const folders = get().folders;
    const path: Folder[] = [];
    
    let folderId: string | null | undefined = currentId;
    while (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        path.unshift(folder);
        folderId = folder.parentId;
      } else {
        break;
      }
    }
    
    set({ folderPath: path });
  },

  getFolderById: (folderId) => {
    return get().folders.find((f) => f.id === folderId);
  },

  getChildFolders: (parentId) => {
    return get().folders.filter((f) => f.parentId === parentId);
  },

  getFolderBreadcrumbs: (folderId) => {
    const folders = get().folders;
    const breadcrumbs: Folder[] = [];
    
    let currentId: string | null | undefined = folderId;
    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    
    return breadcrumbs;
  },

  createFolder: async (teamId: string, data: CreateFolderInput) => {
    set({ folderCreating: true, foldersError: null });
    try {
      const { createFolder: createFolderService } = await import('@ppa/firebase');
      const newFolder = await createFolderService(teamId, data);
      // Deduplicate to prevent doubles from optimistic update + listener
      set((state) => {
        const exists = state.folders.some((f) => f.id === newFolder.id);
        return {
          folders: exists ? state.folders : [...state.folders, newFolder],
          folderCreating: false,
        };
      });
      return newFolder;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create folder';
      set({ foldersError: message, folderCreating: false });
      throw error;
    }
  },

  updateFolder: async (teamId: string, folderId: string, updates: UpdateFolderInput) => {
    set({ folderUpdating: true, foldersError: null });
    try {
      const { updateFolder: updateFolderService } = await import('@ppa/firebase');
      await updateFolderService(teamId, folderId, updates);
      set((state) => ({
        folders: state.folders.map((f) => (f.id === folderId ? { ...f, ...updates, updatedAt: Date.now() } : f)),
        folderUpdating: false,
      }));
      get().computeFolderPath();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update folder';
      set({ foldersError: message, folderUpdating: false });
      throw error;
    }
  },

  deleteFolder: async (teamId: string, folderId: string) => {
    set({ folderDeleting: true, foldersError: null });
    try {
      const { deleteFolder: deleteFolderService } = await import('@ppa/firebase');
      await deleteFolderService(teamId, folderId);
      
      const currentId = get().currentFolderId;
      const deletedFolder = get().folders.find((f) => f.id === folderId);
      
      set((state) => ({
        folders: state.folders.filter((f) => f.id !== folderId),
        currentFolderId: currentId === folderId ? deletedFolder?.parentId || null : currentId,
        folderDeleting: false,
      }));
      get().computeFolderPath();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete folder';
      set({ foldersError: message, folderDeleting: false });
      throw error;
    }
  },

  moveFolder: async (teamId: string, folderId: string, newParentId: string | null) => {
    const originalFolder = get().folders.find((f) => f.id === folderId);
    if (!originalFolder) return;
    
    if (folderId === newParentId) {
      set({ foldersError: 'Cannot move folder into itself' });
      return;
    }
    
    const isDescendant = (parentId: string | null, targetId: string): boolean => {
      if (!parentId) return false;
      if (parentId === targetId) return true;
      const parent = get().folders.find((f) => f.id === parentId);
      return parent ? isDescendant(parent.parentId, targetId) : false;
    };
    
    if (newParentId && isDescendant(newParentId, folderId)) {
      set({ foldersError: 'Cannot move folder into its descendant' });
      return;
    }
    
    set({ folderUpdating: true, foldersError: null });
    set((state) => ({
      folders: state.folders.map((f) => (f.id === folderId ? { ...f, parentId: newParentId } : f)),
    }));
    
    try {
      const { updateFolder: updateFolderService } = await import('@ppa/firebase');
      await updateFolderService(teamId, folderId, { parentId: newParentId });
      set({ folderUpdating: false });
      get().computeFolderPath();
    } catch (error) {
      set((state) => ({
        folders: state.folders.map((f) => (f.id === folderId ? { ...f, parentId: originalFolder.parentId } : f)),
        folderUpdating: false,
      }));
      get().computeFolderPath();
      throw error;
    }
  },
});
