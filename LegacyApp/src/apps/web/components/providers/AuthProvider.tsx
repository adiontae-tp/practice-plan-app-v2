'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { signInWithPopup } from 'firebase/auth';
import {
  useAuthState,
  useMigrationAuth,
  auth,
  getGoogleProvider,
  getAppleProvider,
  signUpWithUserCreation,
  ensureUserDocumentExists,
  type AuthUser,
  type MigrationResult,
  type AuthResult,
} from '@ppa/firebase';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  // Auth actions
  signIn: (email: string, password: string) => Promise<MigrationResult>;
  signUp: (email: string, password: string, fname: string, lname: string, teamName: string, sport: string) => Promise<MigrationResult>;
  signOut: () => Promise<any>;
  sendPasswordReset: (email: string) => Promise<any>;
  // Social auth
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  // Migration state
  migrated: boolean;
  requiresPasswordReset: boolean;
  clearMigrationState: () => void;
  // Error handling
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, loading: authStateLoading } = useAuthState();
  const [isInitialized, setIsInitialized] = useState(false);
  const [socialAuthLoading, setSocialAuthLoading] = useState(false);
  const [socialAuthError, setSocialAuthError] = useState<string | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const {
    signIn,
    logout,
    sendResetPasswordEmail,
    loading: authActionLoading,
    error,
    clearError: clearMigrationError,
    migrated,
    requiresPasswordReset,
    clearMigrationState,
  } = useMigrationAuth();

  // Clear all errors
  const clearError = useCallback(() => {
    clearMigrationError();
    setSocialAuthError(null);
    setSignUpError(null);
  }, [clearMigrationError]);

  // Sign up with user and team creation
  const signUp = useCallback(async (
    email: string,
    password: string,
    fname: string,
    lname: string,
    teamName: string,
    sport: string
  ): Promise<MigrationResult> => {
    setSignUpLoading(true);
    setSignUpError(null);

    try {
      const result = await signUpWithUserCreation(email, password, fname, lname, teamName, sport);
      if (!result.success && result.error) {
        setSignUpError(result.error);
      }
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed';
      setSignUpError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSignUpLoading(false);
    }
  }, []);

  // Google Sign-In (web popup)
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setSocialAuthLoading(true);
    setSocialAuthError(null);

    try {
      const provider = getGoogleProvider();
      const result = await signInWithPopup(auth, provider);

      // Ensure user document exists (creates User + Team if missing)
      if (result.user.email) {
        const ensureResult = await ensureUserDocumentExists(
          result.user.uid,
          result.user.email,
          result.user.displayName
        );
        if (ensureResult.error) {
          console.error('Error ensuring user document:', ensureResult.error);
        }
      }

      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        },
      };
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in cancelled' };
      }
      const errorMessage = error.message || 'Google sign-in failed';
      setSocialAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSocialAuthLoading(false);
    }
  }, []);

  // Apple Sign-In (web popup)
  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    setSocialAuthLoading(true);
    setSocialAuthError(null);

    try {
      const provider = getAppleProvider();
      const result = await signInWithPopup(auth, provider);

      // Ensure user document exists (creates User + Team if missing)
      if (result.user.email) {
        const ensureResult = await ensureUserDocumentExists(
          result.user.uid,
          result.user.email,
          result.user.displayName
        );
        if (ensureResult.error) {
          console.error('Error ensuring user document:', ensureResult.error);
        }
      }

      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        },
      };
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in cancelled' };
      }
      const errorMessage = error.message || 'Apple sign-in failed';
      setSocialAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSocialAuthLoading(false);
    }
  }, []);

  // Mark as initialized once auth state has been checked
  useEffect(() => {
    if (!authStateLoading) {
      setIsInitialized(true);
    }
  }, [authStateLoading]);

  // Push user identification to GTM dataLayer for Microsoft Clarity
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.email) {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'user_identified',
        user_email: user.email,
        user_id: user.uid,
      });
      console.log('[Analytics] User identified:', user.email);
    }
  }, [user?.email, user?.uid]);

  // NOTE: Redirect logic is handled by TPAppShell which properly waits for
  // both Firebase auth AND Firestore data to be loaded before redirecting.
  // Having duplicate redirect logic here caused infinite loops because
  // AuthProvider's user (Firebase auth) loads before the Zustand user
  // (Firestore document), causing conflicting redirects.

  const value: AuthContextType = {
    user,
    isLoading: authStateLoading || authActionLoading || socialAuthLoading || signUpLoading,
    isInitialized,
    signIn,
    signUp,
    signOut: logout,
    sendPasswordReset: sendResetPasswordEmail,
    // Social auth
    signInWithGoogle,
    signInWithApple,
    // Migration state
    migrated,
    requiresPasswordReset,
    clearMigrationState,
    // Error handling
    error: error || socialAuthError || signUpError,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
