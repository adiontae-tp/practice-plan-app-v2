import { StateCreator } from 'zustand';
import {
  signUp,
  signIn,
  logout,
  sendResetPasswordEmail,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  subscribeToAuthStateChanges,
  getCurrentUser,
  type AuthUser,
  type AuthResult,
} from '@ppa/firebase';

export interface AuthSlice {
  // State
  authUser: AuthUser | null;
  isAuthLoading: boolean;
  authError: string | null;
  isInitialized: boolean;

  // Actions
  signUpUser: (email: string, password: string, displayName?: string) => Promise<void>;
  signInUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearAuthError: () => void;
  initializeAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => {
  // Set up auth state listener on first access
  let unsubscribe: (() => void) | null = null;

  const setupAuthListener = () => {
    if (!unsubscribe) {
      unsubscribe = subscribeToAuthStateChanges((user) => {
        set({ authUser: user, isInitialized: true });
      });
    }
  };

  return {
    // Initial state
    authUser: getCurrentUser(),
    isAuthLoading: false,
    authError: null,
    isInitialized: false,

    // Actions
    signUpUser: async (email: string, password: string, displayName?: string) => {
      set({ isAuthLoading: true, authError: null });
      try {
        const result = await signUp(email, password, displayName);
        if (!result.success) {
          set({ authError: result.error || 'Sign up failed' });
          throw new Error(result.error);
        }
        set({ authUser: result.user || null, authError: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        set({ authError: message });
        throw error;
      } finally {
        set({ isAuthLoading: false });
      }
    },

    signInUser: async (email: string, password: string) => {
      set({ isAuthLoading: true, authError: null });
      try {
        const result = await signIn(email, password);
        if (!result.success) {
          set({ authError: result.error || 'Sign in failed' });
          throw new Error(result.error);
        }
        set({ authUser: result.user || null, authError: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        set({ authError: message });
        throw error;
      } finally {
        set({ isAuthLoading: false });
      }
    },

    logoutUser: async () => {
      set({ isAuthLoading: true, authError: null });
      try {
        const result = await logout();
        if (!result.success) {
          set({ authError: result.error || 'Sign out failed' });
          throw new Error(result.error);
        }
        set({ authUser: null, authError: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        set({ authError: message });
        throw error;
      } finally {
        set({ isAuthLoading: false });
      }
    },

    resetPassword: async (email: string) => {
      set({ isAuthLoading: true, authError: null });
      try {
        const result = await sendResetPasswordEmail(email);
        if (!result.success) {
          set({ authError: result.error || 'Failed to send reset email' });
          throw new Error(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        set({ authError: message });
        throw error;
      } finally {
        set({ isAuthLoading: false });
      }
    },

    updateProfile: async (displayName?: string, photoURL?: string) => {
      set({ isAuthLoading: true, authError: null });
      try {
        const result = await updateUserProfile(displayName, photoURL);
        if (!result.success) {
          set({ authError: result.error || 'Failed to update profile' });
          throw new Error(result.error);
        }
        set({ authUser: result.user || null, authError: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        set({ authError: message });
        throw error;
      } finally {
        set({ isAuthLoading: false });
      }
    },

    updateEmail: async (newEmail: string) => {
      set({ isAuthLoading: true, authError: null });
      try {
        const result = await updateUserEmail(newEmail);
        if (!result.success) {
          set({ authError: result.error || 'Failed to update email' });
          throw new Error(result.error);
        }
        set({ authUser: result.user || null, authError: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        set({ authError: message });
        throw error;
      } finally {
        set({ isAuthLoading: false });
      }
    },

    updatePassword: async (newPassword: string) => {
      set({ isAuthLoading: true, authError: null });
      try {
        const result = await updateUserPassword(newPassword);
        if (!result.success) {
          set({ authError: result.error || 'Failed to update password' });
          throw new Error(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        set({ authError: message });
        throw error;
      } finally {
        set({ isAuthLoading: false });
      }
    },

    clearAuthError: () => {
      set({ authError: null });
    },

    initializeAuth: () => {
      setupAuthListener();
    },
  };
};
