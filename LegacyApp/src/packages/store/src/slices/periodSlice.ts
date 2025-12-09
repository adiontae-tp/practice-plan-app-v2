import { StateCreator } from 'zustand';
import { Period } from '@ppa/interfaces';
import {
  createPeriod as createPeriodService,
  updatePeriod as updatePeriodService,
  deletePeriod as deletePeriodService,
} from '@ppa/firebase';

export type CreatePeriodInput = Omit<Period, 'id' | 'ref'>;
export type UpdatePeriodInput = Partial<Omit<Period, 'id' | 'ref'>>;

export interface PeriodSlice {
  // Data state
  periods: Period[];
  period: Period | null;

  // Loading/error states
  periodsLoading: boolean;
  periodCreating: boolean;
  periodUpdating: boolean;
  periodDeleting: boolean;
  periodsError: string | null;

  // Basic setters
  setPeriods: (periods: Period[]) => void;
  setPeriod: (period: Period | null) => void;

  // Error handling
  setPeriodsError: (error: string | null) => void;
  clearPeriodsError: () => void;

  // Async CRUD actions
  createPeriod: (teamId: string, data: CreatePeriodInput) => Promise<Period>;
  updatePeriod: (teamId: string, periodId: string, updates: UpdatePeriodInput) => Promise<void>;
  deletePeriod: (teamId: string, periodId: string) => Promise<void>;
}

export const createPeriodSlice: StateCreator<PeriodSlice> = (set) => ({
  // Initial data state
  periods: [],
  period: null,

  // Initial loading/error states
  periodsLoading: false,
  periodCreating: false,
  periodUpdating: false,
  periodDeleting: false,
  periodsError: null,

  // Basic setters (deduplicate by ID to prevent duplicates from optimistic updates + listeners)
  setPeriods: (periods) => {
    const seen = new Set<string>();
    const deduplicated = periods.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    set({ periods: deduplicated });
  },
  setPeriod: (period) => set({ period }),

  // Error handling
  setPeriodsError: (error) => set({ periodsError: error }),
  clearPeriodsError: () => set({ periodsError: null }),

  // Async CRUD actions
  createPeriod: async (teamId: string, data: CreatePeriodInput) => {
    set({ periodCreating: true, periodsError: null });
    try {
      const newPeriod = await createPeriodService(teamId, data);
      // Note: With real-time subscriptions, the periods array will auto-update
      // Deduplicate to prevent doubles from optimistic update + listener
      set((state) => {
        const exists = state.periods.some((p) => p.id === newPeriod.id);
        return {
          periods: exists
            ? state.periods
            : [...state.periods, newPeriod].sort((a, b) => a.name.localeCompare(b.name)),
          periodCreating: false,
        };
      });
      return newPeriod;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create period';
      set({ periodsError: message, periodCreating: false });
      throw error;
    }
  },

  updatePeriod: async (teamId: string, periodId: string, updates: UpdatePeriodInput) => {
    set({ periodUpdating: true, periodsError: null });
    try {
      await updatePeriodService(teamId, periodId, updates);
      // Note: With real-time subscriptions, the periods array will auto-update
      set((state) => ({
        periods: state.periods
          .map((p) => (p.id === periodId ? { ...p, ...updates } : p))
          .sort((a, b) => a.name.localeCompare(b.name)),
        period: state.period?.id === periodId ? { ...state.period, ...updates } : state.period,
        periodUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update period';
      set({ periodsError: message, periodUpdating: false });
      throw error;
    }
  },

  deletePeriod: async (teamId: string, periodId: string) => {
    set({ periodDeleting: true, periodsError: null });
    try {
      await deletePeriodService(teamId, periodId);
      // Note: With real-time subscriptions, the periods array will auto-update
      set((state) => ({
        periods: state.periods.filter((p) => p.id !== periodId),
        period: state.period?.id === periodId ? null : state.period,
        periodDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete period';
      set({ periodsError: message, periodDeleting: false });
      throw error;
    }
  },
});
