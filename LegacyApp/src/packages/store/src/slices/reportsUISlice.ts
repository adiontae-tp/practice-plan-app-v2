import { StateCreator } from 'zustand';

export type ReportTab = 'periods' | 'tags';
export type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface ReportsUISlice {
  reportsActiveTab: ReportTab;
  reportsDateRange: DateRange;
  reportsIsLoading: boolean;

  setReportsActiveTab: (tab: ReportTab) => void;
  setReportsDateRange: (range: DateRange) => void;
  setReportsIsLoading: (loading: boolean) => void;
  resetReportsUI: () => void;
}

const initialState = {
  reportsActiveTab: 'periods' as ReportTab,
  reportsDateRange: 'month' as DateRange,
  reportsIsLoading: false,
};

export const createReportsUISlice: StateCreator<ReportsUISlice> = (set) => ({
  ...initialState,

  setReportsActiveTab: (tab) => set({ reportsActiveTab: tab }),
  setReportsDateRange: (range) => set({ reportsDateRange: range }),
  setReportsIsLoading: (loading) => set({ reportsIsLoading: loading }),
  resetReportsUI: () => set(initialState),
});
