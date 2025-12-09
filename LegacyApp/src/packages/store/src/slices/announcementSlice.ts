import { StateCreator } from 'zustand';
import { Announcement } from '@ppa/interfaces';
import {
  createAnnouncement as createAnnouncementService,
  updateAnnouncement as updateAnnouncementService,
  deleteAnnouncement as deleteAnnouncementService,
  markAnnouncementRead as markAnnouncementReadService,
} from '@ppa/firebase';

export type CreateAnnouncementInput = Omit<Announcement, 'id' | 'ref' | 'col'>;
export type UpdateAnnouncementInput = Partial<Omit<Announcement, 'id' | 'ref' | 'col' | 'createdAt' | 'createdBy'>>;

export interface AnnouncementSlice {
  // Data state
  announcements: Announcement[];
  announcement: Announcement | null;

  // Loading/error states
  announcementsLoading: boolean;
  announcementCreating: boolean;
  announcementUpdating: boolean;
  announcementDeleting: boolean;
  announcementsError: string | null;

  // Basic setters
  setAnnouncements: (announcements: Announcement[]) => void;
  setAnnouncement: (announcement: Announcement | null) => void;

  // Error handling
  setAnnouncementsError: (error: string | null) => void;
  clearAnnouncementsError: () => void;

  // Async CRUD actions
  createAnnouncement: (teamId: string, data: CreateAnnouncementInput) => Promise<Announcement>;
  updateAnnouncement: (teamId: string, announcementId: string, updates: UpdateAnnouncementInput) => Promise<void>;
  deleteAnnouncement: (teamId: string, announcementId: string) => Promise<void>;
  markAnnouncementAsRead: (teamId: string, announcementId: string, userId: string) => Promise<void>;
}

export const createAnnouncementSlice: StateCreator<AnnouncementSlice> = (set) => ({
  // Initial data state
  announcements: [],
  announcement: null,

  // Initial loading/error states
  announcementsLoading: false,
  announcementCreating: false,
  announcementUpdating: false,
  announcementDeleting: false,
  announcementsError: null,

  // Basic setters (deduplicate by ID to prevent duplicates from optimistic updates + listeners)
  setAnnouncements: (announcements) => {
    const seen = new Set<string>();
    const deduplicated = announcements.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
    set({ announcements: deduplicated });
  },
  setAnnouncement: (announcement) => set({ announcement }),

  // Error handling
  setAnnouncementsError: (error) => set({ announcementsError: error }),
  clearAnnouncementsError: () => set({ announcementsError: null }),

  // Async CRUD actions
  createAnnouncement: async (teamId: string, data: CreateAnnouncementInput) => {
    set({ announcementCreating: true, announcementsError: null });
    try {
      const newAnnouncement = await createAnnouncementService(teamId, data);
      // Note: With real-time subscriptions, the announcements array will auto-update
      // Deduplicate to prevent doubles from optimistic update + listener
      set((state) => {
        const exists = state.announcements.some((a) => a.id === newAnnouncement.id);
        return {
          announcements: exists
            ? state.announcements
            : [newAnnouncement, ...state.announcements],
          announcementCreating: false,
        };
      });
      return newAnnouncement;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create announcement';
      set({ announcementsError: message, announcementCreating: false });
      throw error;
    }
  },

  updateAnnouncement: async (teamId: string, announcementId: string, updates: UpdateAnnouncementInput) => {
    set({ announcementUpdating: true, announcementsError: null });
    try {
      await updateAnnouncementService(teamId, announcementId, updates);
      // Note: With real-time subscriptions, the announcements array will auto-update
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === announcementId ? { ...a, ...updates } : a
        ),
        announcement:
          state.announcement?.id === announcementId
            ? { ...state.announcement, ...updates }
            : state.announcement,
        announcementUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update announcement';
      set({ announcementsError: message, announcementUpdating: false });
      throw error;
    }
  },

  deleteAnnouncement: async (teamId: string, announcementId: string) => {
    set({ announcementDeleting: true, announcementsError: null });
    try {
      await deleteAnnouncementService(teamId, announcementId);
      // Note: With real-time subscriptions, the announcements array will auto-update
      set((state) => ({
        announcements: state.announcements.filter((a) => a.id !== announcementId),
        announcement: state.announcement?.id === announcementId ? null : state.announcement,
        announcementDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete announcement';
      set({ announcementsError: message, announcementDeleting: false });
      throw error;
    }
  },

  markAnnouncementAsRead: async (teamId: string, announcementId: string, userId: string) => {
    try {
      await markAnnouncementReadService(teamId, announcementId, userId);
      // Note: With real-time subscriptions, the announcements array will auto-update
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === announcementId
            ? { ...a, readBy: [...(a.readBy || []), userId] }
            : a
        ),
        announcement:
          state.announcement?.id === announcementId
            ? { ...state.announcement, readBy: [...(state.announcement.readBy || []), userId] }
            : state.announcement,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark announcement as read';
      set({ announcementsError: message });
      throw error;
    }
  },
});
