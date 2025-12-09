import { StateCreator } from 'zustand';
import { Period } from '@ppa/interfaces';

export interface PeriodsUISlice {
  periodsSearchQuery: string;
  periodsShowCreateModal: boolean;
  periodsShowEditModal: boolean;
  periodsShowDeleteAlert: boolean;
  periodsSelectedPeriod: Period | null;
  periodsFormName: string;
  periodsFormDuration: number;
  periodsFormNotes: string;
  periodsFormTags: string[];
  periodsIsLoading: boolean;

  setPeriodsSearchQuery: (query: string) => void;
  setPeriodsShowCreateModal: (show: boolean) => void;
  setPeriodsShowEditModal: (show: boolean) => void;
  setPeriodsShowDeleteAlert: (show: boolean) => void;
  setPeriodsSelectedPeriod: (period: Period | null) => void;
  setPeriodsFormName: (name: string) => void;
  setPeriodsFormDuration: (duration: number) => void;
  setPeriodsFormNotes: (notes: string) => void;
  setPeriodsFormTags: (tags: string[]) => void;
  setPeriodsIsLoading: (loading: boolean) => void;
  resetPeriodsUI: () => void;
}

const initialState = {
  periodsSearchQuery: '',
  periodsShowCreateModal: false,
  periodsShowEditModal: false,
  periodsShowDeleteAlert: false,
  periodsSelectedPeriod: null,
  periodsFormName: '',
  periodsFormDuration: 15,
  periodsFormNotes: '',
  periodsFormTags: [] as string[],
  periodsIsLoading: false,
};

export const createPeriodsUISlice: StateCreator<PeriodsUISlice> = (set) => ({
  ...initialState,

  setPeriodsSearchQuery: (query) => set({ periodsSearchQuery: query }),
  setPeriodsShowCreateModal: (show) => set({ periodsShowCreateModal: show }),
  setPeriodsShowEditModal: (show) => set({ periodsShowEditModal: show }),
  setPeriodsShowDeleteAlert: (show) => set({ periodsShowDeleteAlert: show }),
  setPeriodsSelectedPeriod: (period) => set({ periodsSelectedPeriod: period }),
  setPeriodsFormName: (name) => set({ periodsFormName: name }),
  setPeriodsFormDuration: (duration) => set({ periodsFormDuration: duration }),
  setPeriodsFormNotes: (notes) => set({ periodsFormNotes: notes }),
  setPeriodsFormTags: (tags) => set({ periodsFormTags: tags }),
  setPeriodsIsLoading: (loading) => set({ periodsIsLoading: loading }),
  resetPeriodsUI: () => set(initialState),
});
