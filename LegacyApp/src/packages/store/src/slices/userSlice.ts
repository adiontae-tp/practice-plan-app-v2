import { StateCreator } from 'zustand';
import { User } from '@ppa/interfaces';
import { setUserDoc } from '@ppa/firebase';

export type UpdateUserInput = Partial<Pick<User, 'fname' | 'lname'>>;

export interface UserSlice {
  user: User | null;
  userUpdating: boolean;
  userError: string | null;

  setUser: (user: User | null) => void;
  updateUser: (uid: string, updates: UpdateUserInput) => Promise<void>;
  setUserError: (error: string | null) => void;
  clearUserError: () => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  user: null,
  userUpdating: false,
  userError: null,

  setUser: (user) => set({ user }),

  updateUser: async (uid: string, updates: UpdateUserInput) => {
    set({ userUpdating: true, userError: null });
    try {
      await setUserDoc(uid, updates);
      // Note: With real-time subscriptions, the user will auto-update
      // But we can optimistically update local state
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
        userUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      set({ userError: message, userUpdating: false });
      throw error;
    }
  },

  setUserError: (error) => set({ userError: error }),
  clearUserError: () => set({ userError: null }),
});
