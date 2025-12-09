import { StateCreator } from 'zustand';
import { Template } from '@ppa/interfaces';

export interface TemplatesUISlice {
  templatesSearchQuery: string;
  templatesShowCreateModal: boolean;
  templatesShowDetailModal: boolean;
  templatesShowEditModal: boolean;
  templatesShowDeleteAlert: boolean;
  templatesSelectedTemplate: Template | null;
  templatesFormName: string;
  templatesIsLoading: boolean;

  setTemplatesSearchQuery: (query: string) => void;
  setTemplatesShowCreateModal: (show: boolean) => void;
  setTemplatesShowDetailModal: (show: boolean) => void;
  setTemplatesShowEditModal: (show: boolean) => void;
  setTemplatesShowDeleteAlert: (show: boolean) => void;
  setTemplatesSelectedTemplate: (template: Template | null) => void;
  setTemplatesFormName: (name: string) => void;
  setTemplatesIsLoading: (loading: boolean) => void;
  resetTemplatesUI: () => void;
}

const initialState = {
  templatesSearchQuery: '',
  templatesShowCreateModal: false,
  templatesShowDetailModal: false,
  templatesShowEditModal: false,
  templatesShowDeleteAlert: false,
  templatesSelectedTemplate: null,
  templatesFormName: '',
  templatesIsLoading: false,
};

export const createTemplatesUISlice: StateCreator<TemplatesUISlice> = (set) => ({
  ...initialState,

  setTemplatesSearchQuery: (query) => set({ templatesSearchQuery: query }),
  setTemplatesShowCreateModal: (show) => set({ templatesShowCreateModal: show }),
  setTemplatesShowDetailModal: (show) => set({ templatesShowDetailModal: show }),
  setTemplatesShowEditModal: (show) => set({ templatesShowEditModal: show }),
  setTemplatesShowDeleteAlert: (show) => set({ templatesShowDeleteAlert: show }),
  setTemplatesSelectedTemplate: (template) => set({ templatesSelectedTemplate: template }),
  setTemplatesFormName: (name) => set({ templatesFormName: name }),
  setTemplatesIsLoading: (loading) => set({ templatesIsLoading: loading }),
  resetTemplatesUI: () => set(initialState),
});
