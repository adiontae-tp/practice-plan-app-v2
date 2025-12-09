import { StateCreator } from 'zustand';
import { FileVersion } from '@ppa/interfaces';

export interface FileVersionSlice {
  versions: FileVersion[];
  versionsLoading: boolean;
  versionUploading: boolean;
  versionRestoring: boolean;
  versionDeleting: boolean;
  versionsError: string | null;

  setVersions: (versions: FileVersion[]) => void;
  setVersionsError: (error: string | null) => void;
  clearVersionsError: () => void;

  loadVersions: (teamId: string, fileId: string) => Promise<void>;
  uploadVersion: (teamId: string, fileId: string, fileBlob: Blob, note?: string) => Promise<FileVersion>;
  restoreVersion: (teamId: string, fileId: string, versionId: string) => Promise<void>;
  deleteVersion: (teamId: string, fileId: string, versionId: string) => Promise<void>;
}

export const createFileVersionSlice: StateCreator<FileVersionSlice> = (set, get) => ({
  versions: [],
  versionsLoading: false,
  versionUploading: false,
  versionRestoring: false,
  versionDeleting: false,
  versionsError: null,

  setVersions: (versions) => set({ versions }),
  setVersionsError: (error) => set({ versionsError: error }),
  clearVersionsError: () => set({ versionsError: null }),

  loadVersions: async (teamId: string, fileId: string) => {
    set({ versionsLoading: true, versionsError: null, versions: [] });
    try {
      const { getFileVersions } = await import('@ppa/firebase');
      const versions = await getFileVersions(teamId, fileId);
      set({ versions, versionsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load versions';
      set({ versionsError: message, versionsLoading: false });
      throw error;
    }
  },

  uploadVersion: async (teamId: string, fileId: string, fileBlob: Blob, note?: string) => {
    set({ versionUploading: true, versionsError: null });
    try {
      const { uploadFileVersion } = await import('@ppa/firebase');
      const newVersion = await uploadFileVersion(teamId, fileId, fileBlob, note);
      set((state) => ({
        versions: [newVersion, ...state.versions],
        versionUploading: false,
      }));
      return newVersion;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload version';
      set({ versionsError: message, versionUploading: false });
      throw error;
    }
  },

  restoreVersion: async (teamId: string, fileId: string, versionId: string) => {
    set({ versionRestoring: true, versionsError: null });
    try {
      const { restoreFileVersion } = await import('@ppa/firebase');
      await restoreFileVersion(teamId, fileId, versionId);
      set({ versionRestoring: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore version';
      set({ versionsError: message, versionRestoring: false });
      throw error;
    }
  },

  deleteVersion: async (teamId: string, fileId: string, versionId: string) => {
    set({ versionDeleting: true, versionsError: null });
    try {
      const { deleteFileVersion } = await import('@ppa/firebase');
      await deleteFileVersion(teamId, fileId, versionId);
      set((state) => ({
        versions: state.versions.filter((v) => v.id !== versionId),
        versionDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete version';
      set({ versionsError: message, versionDeleting: false });
      throw error;
    }
  },
});
