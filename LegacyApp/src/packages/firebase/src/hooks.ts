import { useEffect, useState } from 'react';
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
} from './auth';
import {
  signInWithMigration,
  signUpWithUserCreation,
  type MigrationResult,
} from './migration';

/**
 * Hook to get the current authenticated user
 * Subscribes to auth state changes
 */
export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Set initial user
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthStateChanges((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};

/**
 * Hook for user authentication operations
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    setError(null);
    const result = await signUp(email, password, displayName);
    if (!result.success) {
      setError(result.error || 'Sign up failed');
    }
    setLoading(false);
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.error || 'Sign in failed');
    }
    setLoading(false);
    return result;
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    const result = await logout();
    if (!result.success) {
      setError(result.error || 'Sign out failed');
    }
    setLoading(false);
    return result;
  };

  const handleSendResetPasswordEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    const result = await sendResetPasswordEmail(email);
    if (!result.success) {
      setError(result.error || 'Failed to send reset email');
    }
    setLoading(false);
    return result;
  };

  const handleUpdateProfile = async (displayName?: string, photoURL?: string) => {
    setLoading(true);
    setError(null);
    const result = await updateUserProfile(displayName, photoURL);
    if (!result.success) {
      setError(result.error || 'Failed to update profile');
    }
    setLoading(false);
    return result;
  };

  const handleUpdateEmail = async (newEmail: string) => {
    setLoading(true);
    setError(null);
    const result = await updateUserEmail(newEmail);
    if (!result.success) {
      setError(result.error || 'Failed to update email');
    }
    setLoading(false);
    return result;
  };

  const handleUpdatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    const result = await updateUserPassword(newPassword);
    if (!result.success) {
      setError(result.error || 'Failed to update password');
    }
    setLoading(false);
    return result;
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    clearError,
    signUp: handleSignUp,
    signIn: handleSignIn,
    logout: handleLogout,
    sendResetPasswordEmail: handleSendResetPasswordEmail,
    updateProfile: handleUpdateProfile,
    updateEmail: handleUpdateEmail,
    updatePassword: handleUpdatePassword,
  };
};

/**
 * Hook for authentication with migration support
 * Use this during the migration period to automatically migrate users
 * from the old Firebase project to the new one
 */
export const useMigrationAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrated, setMigrated] = useState(false);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);

  const handleSignIn = async (email: string, password: string): Promise<MigrationResult> => {
    setLoading(true);
    setError(null);
    setMigrated(false);
    setRequiresPasswordReset(false);

    const result = await signInWithMigration(email, password);

    if (!result.success) {
      setError(result.error || 'Sign in failed');
    }

    if (result.migrated) {
      setMigrated(true);
    }

    if (result.requiresPasswordReset) {
      setRequiresPasswordReset(true);
    }

    setLoading(false);
    return result;
  };

  /**
   * Sign up with User + Team document creation.
   * @param email - User's email
   * @param password - User's password
   * @param fnameOrDisplayName - First name (if 6 params) OR displayName (if 3 params)
   * @param lname - Last name (optional, if provided uses fname/lname pattern)
   * @param teamName - Team name (required)
   * @param sport - Sport (required)
   */
  const handleSignUp = async (
    email: string,
    password: string,
    fnameOrDisplayName?: string,
    lname?: string,
    teamName?: string,
    sport?: string
  ): Promise<MigrationResult> => {
    setLoading(true);
    setError(null);

    let fname: string;
    let lastName: string;
    let teamNameFinal: string;
    let sportFinal: string;

    // New 6-parameter pattern: signUp(email, password, fname, lname, teamName, sport)
    if (teamName !== undefined && sport !== undefined) {
      fname = fnameOrDisplayName || '';
      lastName = lname || '';
      teamNameFinal = teamName;
      sportFinal = sport;
    } else if (lname !== undefined) {
      // Old 4-parameter pattern: signUp(email, password, fname, lname) - not supported anymore
      fname = fnameOrDisplayName || '';
      lastName = lname;
      teamNameFinal = 'My Team'; // Fallback for old code
      sportFinal = ''; // Fallback for old code
    } else if (fnameOrDisplayName) {
      // Legacy 3-parameter pattern: signUp(email, password, displayName)
      const nameParts = fnameOrDisplayName.trim().split(' ');
      fname = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
      teamNameFinal = 'My Team'; // Fallback for old code
      sportFinal = ''; // Fallback for old code
    } else {
      // No parameters provided - should not happen
      fname = '';
      lastName = '';
      teamNameFinal = 'My Team';
      sportFinal = '';
    }

    const result = await signUpWithUserCreation(email, password, fname, lastName, teamNameFinal, sportFinal);
    if (!result.success) {
      setError(result.error || 'Sign up failed');
    }
    setLoading(false);
    return result;
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    const result = await logout();
    if (!result.success) {
      setError(result.error || 'Sign out failed');
    }
    setLoading(false);
    return result;
  };

  const handleSendResetPasswordEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    const result = await sendResetPasswordEmail(email);
    if (!result.success) {
      setError(result.error || 'Failed to send reset email');
    }
    setLoading(false);
    return result;
  };

  const clearError = () => setError(null);
  const clearMigrationState = () => {
    setMigrated(false);
    setRequiresPasswordReset(false);
  };

  return {
    loading,
    error,
    migrated,
    requiresPasswordReset,
    clearError,
    clearMigrationState,
    signIn: handleSignIn,
    signUp: handleSignUp,
    logout: handleLogout,
    sendResetPasswordEmail: handleSendResetPasswordEmail,
  };
};
