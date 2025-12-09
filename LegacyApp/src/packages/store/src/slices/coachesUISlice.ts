import { StateCreator } from 'zustand';
import { Coach } from '@ppa/interfaces';

export type CoachPermission = 'admin' | 'edit' | 'view';
export type CoachStatus = 'active' | 'invited' | 'inactive';

export interface CoachesUISlice {
  coachesSearchQuery: string;
  coachesShowInviteModal: boolean;
  coachesShowEditModal: boolean;
  coachesShowRemoveAlert: boolean;
  coachesSelectedCoach: Coach | null;
  coachesFormEmail: string;
  coachesFormPermission: CoachPermission;
  coachesFormStatus: CoachStatus;
  coachesIsLoading: boolean;

  setCoachesSearchQuery: (query: string) => void;
  setCoachesShowInviteModal: (show: boolean) => void;
  setCoachesShowEditModal: (show: boolean) => void;
  setCoachesShowRemoveAlert: (show: boolean) => void;
  setCoachesSelectedCoach: (coach: Coach | null) => void;
  setCoachesFormEmail: (email: string) => void;
  setCoachesFormPermission: (permission: CoachPermission) => void;
  setCoachesFormStatus: (status: CoachStatus) => void;
  setCoachesIsLoading: (loading: boolean) => void;
  resetCoachesUI: () => void;
}

const initialState = {
  coachesSearchQuery: '',
  coachesShowInviteModal: false,
  coachesShowEditModal: false,
  coachesShowRemoveAlert: false,
  coachesSelectedCoach: null,
  coachesFormEmail: '',
  coachesFormPermission: 'view' as CoachPermission,
  coachesFormStatus: 'active' as CoachStatus,
  coachesIsLoading: false,
};

export const createCoachesUISlice: StateCreator<CoachesUISlice> = (set) => ({
  ...initialState,

  setCoachesSearchQuery: (query) => set({ coachesSearchQuery: query }),
  setCoachesShowInviteModal: (show) => set({ coachesShowInviteModal: show }),
  setCoachesShowEditModal: (show) => set({ coachesShowEditModal: show }),
  setCoachesShowRemoveAlert: (show) => set({ coachesShowRemoveAlert: show }),
  setCoachesSelectedCoach: (coach) => set({ coachesSelectedCoach: coach }),
  setCoachesFormEmail: (email) => set({ coachesFormEmail: email }),
  setCoachesFormPermission: (permission) => set({ coachesFormPermission: permission }),
  setCoachesFormStatus: (status) => set({ coachesFormStatus: status }),
  setCoachesIsLoading: (loading) => set({ coachesIsLoading: loading }),
  resetCoachesUI: () => set(initialState),
});
