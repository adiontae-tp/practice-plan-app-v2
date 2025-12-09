import { StateCreator } from 'zustand';
import { Announcement, AnnouncementPriority } from '@ppa/interfaces';

export interface AnnouncementsUISlice {
  announcementsSearchQuery: string;
  announcementsSortBy: 'newest' | 'oldest';
  announcementsShowCreateModal: boolean;
  announcementsShowDetailModal: boolean;
  announcementsShowEditModal: boolean;
  announcementsShowDeleteAlert: boolean;
  announcementsSelectedAnnouncement: Announcement | null;
  announcementsFormTitle: string;
  announcementsFormMessage: string;
  announcementsFormPriority: AnnouncementPriority;
  announcementsIsLoading: boolean;

  setAnnouncementsSearchQuery: (query: string) => void;
  setAnnouncementsSortBy: (sortBy: 'newest' | 'oldest') => void;
  setAnnouncementsShowCreateModal: (show: boolean) => void;
  setAnnouncementsShowDetailModal: (show: boolean) => void;
  setAnnouncementsShowEditModal: (show: boolean) => void;
  setAnnouncementsShowDeleteAlert: (show: boolean) => void;
  setAnnouncementsSelectedAnnouncement: (announcement: Announcement | null) => void;
  setAnnouncementsFormTitle: (title: string) => void;
  setAnnouncementsFormMessage: (message: string) => void;
  setAnnouncementsFormPriority: (priority: AnnouncementPriority) => void;
  setAnnouncementsIsLoading: (loading: boolean) => void;
  resetAnnouncementsUI: () => void;
}

const initialState = {
  announcementsSearchQuery: '',
  announcementsSortBy: 'newest' as 'newest' | 'oldest',
  announcementsShowCreateModal: false,
  announcementsShowDetailModal: false,
  announcementsShowEditModal: false,
  announcementsShowDeleteAlert: false,
  announcementsSelectedAnnouncement: null,
  announcementsFormTitle: '',
  announcementsFormMessage: '',
  announcementsFormPriority: 'medium' as AnnouncementPriority,
  announcementsIsLoading: false,
};

export const createAnnouncementsUISlice: StateCreator<AnnouncementsUISlice> = (set) => ({
  ...initialState,

  setAnnouncementsSearchQuery: (query) => set({ announcementsSearchQuery: query }),
  setAnnouncementsSortBy: (sortBy) => set({ announcementsSortBy: sortBy }),
  setAnnouncementsShowCreateModal: (show) => set({ announcementsShowCreateModal: show }),
  setAnnouncementsShowDetailModal: (show) => set({ announcementsShowDetailModal: show }),
  setAnnouncementsShowEditModal: (show) => set({ announcementsShowEditModal: show }),
  setAnnouncementsShowDeleteAlert: (show) => set({ announcementsShowDeleteAlert: show }),
  setAnnouncementsSelectedAnnouncement: (announcement) => set({ announcementsSelectedAnnouncement: announcement }),
  setAnnouncementsFormTitle: (title) => set({ announcementsFormTitle: title }),
  setAnnouncementsFormMessage: (message) => set({ announcementsFormMessage: message }),
  setAnnouncementsFormPriority: (priority) => set({ announcementsFormPriority: priority }),
  setAnnouncementsIsLoading: (loading) => set({ announcementsIsLoading: loading }),
  resetAnnouncementsUI: () => set(initialState),
});
