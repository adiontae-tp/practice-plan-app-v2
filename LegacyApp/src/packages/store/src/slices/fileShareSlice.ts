import { StateCreator } from 'zustand';
import { FileShare, ShareType, SharePermission } from '@ppa/interfaces';

export interface CreateShareInput {
  type: ShareType;
  targetId?: string;
  targetEmail?: string;
  permission: SharePermission;
  expiresAt?: number;
  password?: string;
}

export interface FileShareSlice {
  shares: FileShare[];
  sharesLoading: boolean;
  shareCreating: boolean;
  shareDeleting: boolean;
  sharesError: string | null;

  setShares: (shares: FileShare[]) => void;
  setSharesError: (error: string | null) => void;
  clearSharesError: () => void;

  loadShares: (teamId: string, fileId: string) => Promise<void>;
  createShare: (teamId: string, fileId: string, data: CreateShareInput) => Promise<FileShare>;
  deleteShare: (teamId: string, fileId: string, shareId: string) => Promise<void>;
  updateShareExpiry: (teamId: string, fileId: string, shareId: string, expiresAt: number | null) => Promise<void>;
  incrementShareAccessCount: (teamId: string, fileId: string, shareId: string) => Promise<void>;
}

export const createFileShareSlice: StateCreator<FileShareSlice> = (set, get) => ({
  shares: [],
  sharesLoading: false,
  shareCreating: false,
  shareDeleting: false,
  sharesError: null,

  setShares: (shares) => set({ shares }),
  setSharesError: (error) => set({ sharesError: error }),
  clearSharesError: () => set({ sharesError: null }),

  loadShares: async (teamId: string, fileId: string) => {
    set({ sharesLoading: true, sharesError: null, shares: [] });
    try {
      const { getFileShares } = await import('@ppa/firebase');
      const shares = await getFileShares(teamId, fileId);
      set({ shares, sharesLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load shares';
      set({ sharesError: message, sharesLoading: false });
      throw error;
    }
  },

  createShare: async (teamId: string, fileId: string, data: CreateShareInput) => {
    set({ shareCreating: true, sharesError: null });
    try {
      const { createFileShare } = await import('@ppa/firebase');
      const newShare = await createFileShare(teamId, fileId, data);
      set((state) => ({
        shares: [...state.shares, newShare],
        shareCreating: false,
      }));
      return newShare;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create share';
      set({ sharesError: message, shareCreating: false });
      throw error;
    }
  },

  deleteShare: async (teamId: string, fileId: string, shareId: string) => {
    set({ shareDeleting: true, sharesError: null });
    try {
      const { deleteFileShare } = await import('@ppa/firebase');
      await deleteFileShare(teamId, fileId, shareId);
      set((state) => ({
        shares: state.shares.filter((s) => s.id !== shareId),
        shareDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete share';
      set({ sharesError: message, shareDeleting: false });
      throw error;
    }
  },

  updateShareExpiry: async (teamId: string, fileId: string, shareId: string, expiresAt: number | null) => {
    try {
      const { updateFileShare } = await import('@ppa/firebase');
      await updateFileShare(teamId, fileId, shareId, { expiresAt: expiresAt || undefined });
      set((state) => ({
        shares: state.shares.map((s) => (s.id === shareId ? { ...s, expiresAt: expiresAt || undefined } : s)),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update share';
      set({ sharesError: message });
      throw error;
    }
  },

  incrementShareAccessCount: async (teamId: string, fileId: string, shareId: string) => {
    try {
      const { incrementShareAccess } = await import('@ppa/firebase');
      await incrementShareAccess(teamId, fileId, shareId);
      set((state) => ({
        shares: state.shares.map((s) => (s.id === shareId ? { ...s, accessCount: s.accessCount + 1 } : s)),
      }));
    } catch (error) {
      console.error('Failed to increment share access count:', error);
    }
  },
});
