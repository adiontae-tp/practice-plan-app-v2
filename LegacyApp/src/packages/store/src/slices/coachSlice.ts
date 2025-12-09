import { StateCreator } from 'zustand';
import { Coach } from '@ppa/interfaces';
import {
  addCoach as addCoachService,
  updateCoach as updateCoachService,
  removeCoach as removeCoachService,
} from '@ppa/firebase';

export type CreateCoachInput = Omit<Coach, 'id' | 'ref'>;
export type UpdateCoachInput = Partial<Omit<Coach, 'id' | 'ref'>>;

export interface CoachSlice {
  // Data state
  coaches: Coach[];
  coach: Coach | null;

  // Loading/error states
  coachesLoading: boolean;
  coachCreating: boolean;
  coachUpdating: boolean;
  coachDeleting: boolean;
  coachesError: string | null;

  // Basic setters
  setCoaches: (coaches: Coach[]) => void;
  setCoach: (coach: Coach | null) => void;

  // Error handling
  setCoachesError: (error: string | null) => void;
  clearCoachesError: () => void;

  // Async CRUD actions
  createCoach: (teamId: string, data: CreateCoachInput) => Promise<Coach>;
  updateCoach: (teamId: string, coachId: string, updates: UpdateCoachInput) => Promise<void>;
  deleteCoach: (teamId: string, coachId: string) => Promise<void>;
}

export const createCoachSlice: StateCreator<CoachSlice> = (set) => ({
  // Initial data state
  coaches: [],
  coach: null,

  // Initial loading/error states
  coachesLoading: false,
  coachCreating: false,
  coachUpdating: false,
  coachDeleting: false,
  coachesError: null,

  // Basic setters (deduplicate by ID to prevent duplicates from optimistic updates + listeners)
  setCoaches: (coaches) => {
    const seen = new Set<string>();
    const deduplicated = coaches.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    set({ coaches: deduplicated });
  },
  setCoach: (coach) => set({ coach }),

  // Error handling
  setCoachesError: (error) => set({ coachesError: error }),
  clearCoachesError: () => set({ coachesError: null }),

  // Async CRUD actions
  createCoach: async (teamId: string, data: CreateCoachInput) => {
    set({ coachCreating: true, coachesError: null });
    try {
      const newCoach = await addCoachService(teamId, data);
      // Note: With real-time subscriptions, the coaches array will auto-update
      // Deduplicate to prevent doubles from optimistic update + listener
      set((state) => {
        const exists = state.coaches.some((c) => c.id === newCoach.id);
        return {
          coaches: exists
            ? state.coaches
            : [...state.coaches, newCoach].sort((a, b) => a.email.localeCompare(b.email)),
          coachCreating: false,
        };
      });
      return newCoach;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add coach';
      set({ coachesError: message, coachCreating: false });
      throw error;
    }
  },

  updateCoach: async (teamId: string, coachId: string, updates: UpdateCoachInput) => {
    set({ coachUpdating: true, coachesError: null });
    try {
      await updateCoachService(teamId, coachId, updates);
      // Note: With real-time subscriptions, the coaches array will auto-update
      set((state) => ({
        coaches: state.coaches
          .map((c) => (c.id === coachId ? { ...c, ...updates } : c))
          .sort((a, b) => a.email.localeCompare(b.email)),
        coach: state.coach?.id === coachId ? { ...state.coach, ...updates } : state.coach,
        coachUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update coach';
      set({ coachesError: message, coachUpdating: false });
      throw error;
    }
  },

  deleteCoach: async (teamId: string, coachId: string) => {
    set({ coachDeleting: true, coachesError: null });
    try {
      await removeCoachService(teamId, coachId);
      // Note: With real-time subscriptions, the coaches array will auto-update
      set((state) => ({
        coaches: state.coaches.filter((c) => c.id !== coachId),
        coach: state.coach?.id === coachId ? null : state.coach,
        coachDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove coach';
      set({ coachesError: message, coachDeleting: false });
      throw error;
    }
  },
});
