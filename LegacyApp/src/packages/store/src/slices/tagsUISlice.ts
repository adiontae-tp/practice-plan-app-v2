import { StateCreator } from 'zustand';
import { Tag } from '@ppa/interfaces';

export interface TagsUISlice {
  tagsSearchQuery: string;
  tagsShowCreateModal: boolean;
  tagsShowEditModal: boolean;
  tagsShowDeleteAlert: boolean;
  tagsSelectedTag: Tag | null;
  tagsFormName: string;
  tagsIsLoading: boolean;

  setTagsSearchQuery: (query: string) => void;
  setTagsShowCreateModal: (show: boolean) => void;
  setTagsShowEditModal: (show: boolean) => void;
  setTagsShowDeleteAlert: (show: boolean) => void;
  setTagsSelectedTag: (tag: Tag | null) => void;
  setTagsFormName: (name: string) => void;
  setTagsIsLoading: (loading: boolean) => void;
  resetTagsUI: () => void;
}

const initialState = {
  tagsSearchQuery: '',
  tagsShowCreateModal: false,
  tagsShowEditModal: false,
  tagsShowDeleteAlert: false,
  tagsSelectedTag: null,
  tagsFormName: '',
  tagsIsLoading: false,
};

export const createTagsUISlice: StateCreator<TagsUISlice> = (set) => ({
  ...initialState,

  setTagsSearchQuery: (query) => set({ tagsSearchQuery: query }),
  setTagsShowCreateModal: (show) => set({ tagsShowCreateModal: show }),
  setTagsShowEditModal: (show) => set({ tagsShowEditModal: show }),
  setTagsShowDeleteAlert: (show) => set({ tagsShowDeleteAlert: show }),
  setTagsSelectedTag: (tag) => set({ tagsSelectedTag: tag }),
  setTagsFormName: (name) => set({ tagsFormName: name }),
  setTagsIsLoading: (loading) => set({ tagsIsLoading: loading }),
  resetTagsUI: () => set(initialState),
});
