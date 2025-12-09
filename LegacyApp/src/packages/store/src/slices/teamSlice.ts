import { StateCreator } from 'zustand';
import { Team } from '@ppa/interfaces';
import { updateTeam as updateTeamService } from '@ppa/firebase';

export type UpdateTeamInput = Partial<Omit<Team, 'id' | 'ref' | 'path' | 'col' | 'headCoach'>>;

export interface TeamSlice {
  team: Team | null;
  teamUpdating: boolean;
  teamError: string | null;

  setTeam: (team: Team | null) => void;
  updateTeam: (teamId: string, updates: UpdateTeamInput) => Promise<void>;
  setTeamError: (error: string | null) => void;
  clearTeamError: () => void;
}

export const createTeamSlice: StateCreator<TeamSlice> = (set, get) => ({
  team: null,
  teamUpdating: false,
  teamError: null,

  setTeam: (team) => set({ team }),

  updateTeam: async (teamId: string, updates: UpdateTeamInput) => {
    set({ teamUpdating: true, teamError: null });
    try {
      await updateTeamService(teamId, updates);
      // Note: With real-time subscriptions, the team will auto-update
      // But we can optimistically update local state
      set((state) => ({
        team: state.team ? { ...state.team, ...updates } : null,
        teamUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update team';
      set({ teamError: message, teamUpdating: false });
      throw error;
    }
  },

  setTeamError: (error) => set({ teamError: error }),
  clearTeamError: () => set({ teamError: null }),
});
