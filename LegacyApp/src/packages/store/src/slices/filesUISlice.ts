import { StateCreator } from 'zustand';
import { File, FileCategory, FileType } from '@ppa/interfaces';

export type FilesViewMode = 'list' | 'grid';
export type FilesSortBy = 'name' | 'uploadedAt' | 'size' | 'category' | 'type';
export type FilesSortOrder = 'asc' | 'desc';

export interface FilesFilterState {
  types: FileType[];
  categories: FileCategory[];
  dateRange: { start: number | null; end: number | null };
  uploaders: string[];
  tags: string[];
  sizeRange: { min: number | null; max: number | null };
  favoritesOnly: boolean;
}

export interface FilesUISlice {
  filesSearchQuery: string;
  filesShowUploadSheet: boolean;
  filesShowDetailModal: boolean;
  filesShowDeleteAlert: boolean;
  filesShowVersionsModal: boolean;
  filesShowShareModal: boolean;
  filesShowMoveModal: boolean;
  filesShowNewFolderModal: boolean;
  filesShowFilterPanel: boolean;
  filesSelectedFile: File | null;
  filesSelectedIds: string[];
  filesIsLoading: boolean;
  filesViewMode: FilesViewMode;
  filesSortBy: FilesSortBy;
  filesSortOrder: FilesSortOrder;
  filesFilter: FilesFilterState;
  filesCurrentFolderId: string | null;

  setFilesSearchQuery: (query: string) => void;
  setFilesShowUploadSheet: (show: boolean) => void;
  setFilesShowDetailModal: (show: boolean) => void;
  setFilesShowDeleteAlert: (show: boolean) => void;
  setFilesShowVersionsModal: (show: boolean) => void;
  setFilesShowShareModal: (show: boolean) => void;
  setFilesShowMoveModal: (show: boolean) => void;
  setFilesShowNewFolderModal: (show: boolean) => void;
  setFilesShowFilterPanel: (show: boolean) => void;
  setFilesSelectedFile: (file: File | null) => void;
  setFilesSelectedIds: (ids: string[]) => void;
  toggleFileSelection: (id: string) => void;
  selectAllFiles: (ids: string[]) => void;
  clearFileSelection: () => void;
  setFilesIsLoading: (loading: boolean) => void;
  setFilesViewMode: (mode: FilesViewMode) => void;
  setFilesSortBy: (sortBy: FilesSortBy) => void;
  setFilesSortOrder: (order: FilesSortOrder) => void;
  setFilesFilter: (filter: Partial<FilesFilterState>) => void;
  resetFilesFilter: () => void;
  setFilesCurrentFolderId: (folderId: string | null) => void;
  resetFilesUI: () => void;
}

const initialFilterState: FilesFilterState = {
  types: [],
  categories: [],
  dateRange: { start: null, end: null },
  uploaders: [],
  tags: [],
  sizeRange: { min: null, max: null },
  favoritesOnly: false,
};

const initialState = {
  filesSearchQuery: '',
  filesShowUploadSheet: false,
  filesShowDetailModal: false,
  filesShowDeleteAlert: false,
  filesShowVersionsModal: false,
  filesShowShareModal: false,
  filesShowMoveModal: false,
  filesShowNewFolderModal: false,
  filesShowFilterPanel: false,
  filesSelectedFile: null,
  filesSelectedIds: [] as string[],
  filesIsLoading: false,
  filesViewMode: 'list' as FilesViewMode,
  filesSortBy: 'uploadedAt' as FilesSortBy,
  filesSortOrder: 'desc' as FilesSortOrder,
  filesFilter: initialFilterState,
  filesCurrentFolderId: null as string | null,
};

export const createFilesUISlice: StateCreator<FilesUISlice> = (set) => ({
  ...initialState,

  setFilesSearchQuery: (query) => set({ filesSearchQuery: query }),
  setFilesShowUploadSheet: (show) => set({ filesShowUploadSheet: show }),
  setFilesShowDetailModal: (show) => set({ filesShowDetailModal: show }),
  setFilesShowDeleteAlert: (show) => set({ filesShowDeleteAlert: show }),
  setFilesShowVersionsModal: (show) => set({ filesShowVersionsModal: show }),
  setFilesShowShareModal: (show) => set({ filesShowShareModal: show }),
  setFilesShowMoveModal: (show) => set({ filesShowMoveModal: show }),
  setFilesShowNewFolderModal: (show) => set({ filesShowNewFolderModal: show }),
  setFilesShowFilterPanel: (show) => set({ filesShowFilterPanel: show }),
  setFilesSelectedFile: (file) => set({ filesSelectedFile: file }),
  setFilesSelectedIds: (ids) => set({ filesSelectedIds: ids }),
  toggleFileSelection: (id) =>
    set((state) => ({
      filesSelectedIds: state.filesSelectedIds.includes(id)
        ? state.filesSelectedIds.filter((i) => i !== id)
        : [...state.filesSelectedIds, id],
    })),
  selectAllFiles: (ids) => set({ filesSelectedIds: ids }),
  clearFileSelection: () => set({ filesSelectedIds: [] }),
  setFilesIsLoading: (loading) => set({ filesIsLoading: loading }),
  setFilesViewMode: (mode) => set({ filesViewMode: mode }),
  setFilesSortBy: (sortBy) => set({ filesSortBy: sortBy }),
  setFilesSortOrder: (order) => set({ filesSortOrder: order }),
  setFilesFilter: (filter) =>
    set((state) => ({
      filesFilter: { ...state.filesFilter, ...filter },
    })),
  resetFilesFilter: () => set({ filesFilter: initialFilterState }),
  setFilesCurrentFolderId: (folderId) => set({ filesCurrentFolderId: folderId }),
  resetFilesUI: () => set(initialState),
});
