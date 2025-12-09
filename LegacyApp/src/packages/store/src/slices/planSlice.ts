import { StateCreator } from 'zustand';
import { Plan, Activity, Tag } from '@ppa/interfaces';
import {
  createPlan as createPlanService,
  updatePlan as updatePlanService,
  deletePlan as deletePlanService,
  getPlanById as getPlanByIdService,
  getPlans as getPlansService,
  subscribeToPlans as subscribeToPlansService,
} from '@ppa/firebase';

export interface EditingActivityData {
  activity: Activity;
  index: number;
  planEditMode: boolean;
}

export interface UpdatedActivityData {
  activity: Activity;
  index: number;
}

export interface ViewingNotesData {
  activityName: string;
  notes: string;
}

export type CreatePlanInput = Omit<Plan, 'id' | 'ref'>;
export type UpdatePlanInput = Partial<Omit<Plan, 'id' | 'ref'>>;

export interface PlanSlice {
  // Data state
  plans: Plan[];
  plan: Plan | null;
  selectedPeriodActivities: Activity[] | null;
  editingActivity: EditingActivityData | null;
  updatedActivity: UpdatedActivityData | null;
  viewingNotes: ViewingNotesData | null;
  deletedActivityIndex: number | null;
  selectedTag: Tag | null;

  // Loading/error states for CRUD operations
  plansLoading: boolean;
  planCreating: boolean;
  planUpdating: boolean;
  planDeleting: boolean;
  plansError: string | null;

  // Basic setters
  setPlans: (plans: Plan[]) => void;
  setPlan: (plan: Plan | null) => void;
  setSelectedPeriodActivities: (activities: Activity[] | null) => void;
  clearSelectedPeriodActivities: () => void;
  setEditingActivity: (data: EditingActivityData | null) => void;
  setUpdatedActivity: (data: UpdatedActivityData | null) => void;
  clearEditingActivity: () => void;
  clearUpdatedActivity: () => void;
  setViewingNotes: (data: ViewingNotesData | null) => void;
  clearViewingNotes: () => void;
  setDeletedActivityIndex: (index: number | null) => void;
  clearDeletedActivityIndex: () => void;
  setSelectedTag: (tag: Tag | null) => void;

  // Error handling
  setPlansError: (error: string | null) => void;
  clearPlansError: () => void;

  // Async CRUD actions
  fetchPlan: (teamId: string, planId: string) => Promise<Plan | null>;
  fetchPlans: (teamId: string, startDate?: number, endDate?: number) => Promise<Plan[]>;
  subscribePlans: (teamId: string, startDate?: number, endDate?: number) => () => void;
  createPlan: (teamId: string, data: CreatePlanInput) => Promise<Plan>;
  updatePlan: (teamId: string, planId: string, updates: UpdatePlanInput) => Promise<void>;
  deletePlan: (teamId: string, planId: string) => Promise<void>;

  // Series actions (for recurring plans)
  getPlansInSeries: (seriesId: string) => Plan[];
  updatePlanSeries: (teamId: string, seriesId: string, updates: UpdatePlanInput) => Promise<void>;
  deletePlanSeries: (teamId: string, seriesId: string) => Promise<void>;
}

export const createPlanSlice: StateCreator<PlanSlice> = (set, get) => ({
  // Initial data state
  plans: [],
  plan: null,
  selectedPeriodActivities: null,
  editingActivity: null,
  updatedActivity: null,
  viewingNotes: null,
  deletedActivityIndex: null,
  selectedTag: null,

  // Initial loading/error states
  plansLoading: false,
  planCreating: false,
  planUpdating: false,
  planDeleting: false,
  plansError: null,

  // Basic setters (deduplicate by ID to prevent duplicates from optimistic updates + listeners)
  setPlans: (plans) => {
    const seen = new Set<string>();
    const deduplicated = plans.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    set({ plans: deduplicated });
  },
  setPlan: (plan) => set({ plan }),
  setSelectedPeriodActivities: (activities) =>
    set({ selectedPeriodActivities: activities }),
  clearSelectedPeriodActivities: () => set({ selectedPeriodActivities: null }),
  setEditingActivity: (data) => set({ editingActivity: data }),
  setUpdatedActivity: (data) => set({ updatedActivity: data }),
  clearEditingActivity: () => set({ editingActivity: null }),
  clearUpdatedActivity: () => set({ updatedActivity: null }),
  setViewingNotes: (data) => set({ viewingNotes: data }),
  clearViewingNotes: () => set({ viewingNotes: null }),
  setDeletedActivityIndex: (index) => set({ deletedActivityIndex: index }),
  clearDeletedActivityIndex: () => set({ deletedActivityIndex: null }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),

  // Error handling
  setPlansError: (error) => set({ plansError: error }),
  clearPlansError: () => set({ plansError: null }),

  // Async CRUD actions
  fetchPlan: async (teamId: string, planId: string) => {
    set({ plansLoading: true, plansError: null });
    try {
      const plan = await getPlanByIdService(teamId, planId);
      set({ plan, plansLoading: false });
      return plan;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch plan';
      set({ plansError: message, plansLoading: false });
      return null;
    }
  },

  fetchPlans: async (teamId: string, startDate?: number, endDate?: number) => {
    set({ plansLoading: true, plansError: null });
    try {
      const plans = await getPlansService(teamId, startDate, endDate);
      set({ plans, plansLoading: false });
      return plans;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch plans';
      set({ plansError: message, plansLoading: false });
      return [];
    }
  },

  subscribePlans: (teamId: string, startDate?: number, endDate?: number) => {
    set({ plansLoading: true, plansError: null });
    return subscribeToPlansService(
      teamId,
      (plans) => {
        set({ plans, plansLoading: false });
      },
      startDate,
      endDate
    );
  },

  createPlan: async (teamId: string, data: CreatePlanInput) => {
    set({ planCreating: true, plansError: null });
    try {
      const newPlan = await createPlanService(teamId, data);
      // Note: With real-time subscriptions, the plans array will auto-update
      // But we can optimistically add it for immediate feedback (deduplicate to prevent doubles)
      set((state) => {
        const exists = state.plans.some((p) => p.id === newPlan.id);
        return {
          plans: exists ? state.plans : [...state.plans, newPlan],
          planCreating: false,
        };
      });
      return newPlan;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create plan';
      set({ plansError: message, planCreating: false });
      throw error;
    }
  },

  updatePlan: async (teamId: string, planId: string, updates: UpdatePlanInput) => {
    set({ planUpdating: true, plansError: null });
    try {
      await updatePlanService(teamId, planId, updates);
      // Note: With real-time subscriptions, the plans array will auto-update
      // But we can optimistically update for immediate feedback
      set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId ? { ...p, ...updates } : p
        ),
        plan: state.plan?.id === planId ? { ...state.plan, ...updates } : state.plan,
        planUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update plan';
      set({ plansError: message, planUpdating: false });
      throw error;
    }
  },

  deletePlan: async (teamId: string, planId: string) => {
    set({ planDeleting: true, plansError: null });
    try {
      await deletePlanService(teamId, planId);
      // Note: With real-time subscriptions, the plans array will auto-update
      // But we can optimistically remove for immediate feedback
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== planId),
        plan: state.plan?.id === planId ? null : state.plan,
        planDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete plan';
      set({ plansError: message, planDeleting: false });
      throw error;
    }
  },

  // Series actions (for recurring plans)
  getPlansInSeries: (seriesId: string) => {
    return get().plans.filter((p) => p.seriesId === seriesId);
  },

  updatePlanSeries: async (teamId: string, seriesId: string, updates: UpdatePlanInput) => {
    set({ planUpdating: true, plansError: null });
    try {
      const plansInSeries = get().plans.filter((p) => p.seriesId === seriesId);

      // Update all plans in the series
      await Promise.all(
        plansInSeries.map((plan) => updatePlanService(teamId, plan.id, updates))
      );

      // Optimistically update local state
      set((state) => ({
        plans: state.plans.map((p) =>
          p.seriesId === seriesId ? { ...p, ...updates } : p
        ),
        planUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update plan series';
      set({ plansError: message, planUpdating: false });
      throw error;
    }
  },

  deletePlanSeries: async (teamId: string, seriesId: string) => {
    set({ planDeleting: true, plansError: null });
    try {
      const plansInSeries = get().plans.filter((p) => p.seriesId === seriesId);

      // Delete all plans in the series
      await Promise.all(
        plansInSeries.map((plan) => deletePlanService(teamId, plan.id))
      );

      // Optimistically update local state
      set((state) => ({
        plans: state.plans.filter((p) => p.seriesId !== seriesId),
        plan: state.plan?.seriesId === seriesId ? null : state.plan,
        planDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete plan series';
      set({ plansError: message, planDeleting: false });
      throw error;
    }
  },
});
