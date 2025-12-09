import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { useSegments, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// Dynamic imports for native modules that require a development build
let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
try {
  AppleAuthentication = require('expo-apple-authentication');
} catch {
  console.warn('[Auth] expo-apple-authentication not available in Expo Go');
}

// Dynamic import for Google auth (requires native modules)
let Google: typeof import('expo-auth-session/providers/google') | null = null;
let useGoogleAuthRequest: any = null;
try {
  Google = require('expo-auth-session/providers/google');
  useGoogleAuthRequest = Google.useAuthRequest;
} catch {
  console.warn('[Auth] expo-auth-session/providers/google not available');
  // Create a safe fallback hook that returns safe defaults
  useGoogleAuthRequest = () => [null, null, async () => ({ type: 'cancel' as const })];
}

// Simple SHA-256 hash function for nonce (used for Apple Sign-In)
// This is a fallback when expo-crypto is not available
async function sha256(str: string): Promise<string> {
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  // Use Web Crypto API (available in React Native)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useAuthState,
  useMigrationAuth,
  signInWithAppleCredential,
  signInWithGoogleCredential,
  ensureUserDocumentExists,
  sendEmailSignInLink,
  isEmailSignInLink,
  completeEmailSignInWithUserSetup,
  type AuthUser,
  type MigrationResult,
  type AuthResult,
} from '@ppa/firebase';

// Key for storing email in AsyncStorage for email link sign-in
const EMAIL_LINK_STORAGE_KEY = '@PracticePlan:emailForSignIn';

// Complete auth session for web browser redirect
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs from Firebase Console
// Web Client ID (client_type: 3) - used for token exchange
const GOOGLE_WEB_CLIENT_ID = '49133175250-27j4r1i1k3p2mj859ha9thiab33vopjj.apps.googleusercontent.com';
// iOS Client ID (client_type: 2) - from GoogleService-Info.plist
const GOOGLE_IOS_CLIENT_ID = '49133175250-dhovocrbbcpj83k0h0te88ahfgbe6flr.apps.googleusercontent.com';
// Android uses the Web Client ID for expo-auth-session
const GOOGLE_ANDROID_CLIENT_ID = GOOGLE_WEB_CLIENT_ID;

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  // Auth actions
  signIn: (email: string, password: string) => Promise<MigrationResult>;
  signUp: (email: string, password: string, fnameOrDisplayName?: string, lname?: string) => Promise<MigrationResult>;
  signOut: () => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  // Social auth
  signInWithApple: () => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  isAppleSignInAvailable: boolean;
  // Email link (passwordless) auth
  sendSignInLink: (email: string) => Promise<AuthResult>;
  completeSignInWithLink: (email: string, url: string) => Promise<AuthResult & { userCreated?: boolean }>;
  isSignInWithEmailLink: (url: string) => boolean;
  getStoredEmailForSignIn: () => Promise<string | null>;
  clearStoredEmailForSignIn: () => Promise<void>;
  emailLinkSent: boolean;
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
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const {
    signIn,
    signUp,
    logout,
    sendResetPasswordEmail,
    loading: authActionLoading,
    error,
    clearError: clearMigrationError,
    migrated,
    requiresPasswordReset,
    clearMigrationState,
  } = useMigrationAuth();

  // Google Auth Session hook (always called, but uses fallback if Google module isn't available)
  const [googleRequest, googleResponse, promptGoogleAsync] = useGoogleAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  // Handle Google auth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token, access_token } = googleResponse.params;

      if (id_token) {
        setSocialAuthLoading(true);
        signInWithGoogleCredential(id_token, access_token)
          .then(async (result) => {
            if (!result.success) {
              setSocialAuthError(result.error || 'Google sign-in failed');
              return;
            }

            // Ensure user document exists (creates User + Team if missing)
            if (result.user?.email) {
              try {
                const ensureResult = await ensureUserDocumentExists(
                  result.user.uid,
                  result.user.email,
                  result.user.displayName
                );
                if (ensureResult.error) {
                  console.error('Error ensuring user document:', ensureResult.error);
                }
              } catch (err) {
                console.error('Error in ensureUserDocumentExists:', err);
              }
            }
          })
          .catch((err) => {
            setSocialAuthError(err.message || 'Google sign-in failed');
          })
          .finally(() => {
            setSocialAuthLoading(false);
          });
      }
    } else if (googleResponse?.type === 'error') {
      setSocialAuthError(googleResponse.error?.message || 'Google sign-in failed');
    }
  }, [googleResponse]);

  // Check Apple Sign-In availability on iOS
  useEffect(() => {
    if (Platform.OS === 'ios' && AppleAuthentication) {
      AppleAuthentication.isAvailableAsync().then(setIsAppleSignInAvailable);
    }
  }, []);

  // Clear all errors
  const clearError = useCallback(() => {
    clearMigrationError();
    setSocialAuthError(null);
  }, [clearMigrationError]);

  // Apple Sign-In
  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Sign-In is only available on iOS' };
    }

    if (!AppleAuthentication) {
      return { success: false, error: 'Apple Sign-In requires a development build' };
    }

    setSocialAuthLoading(true);
    setSocialAuthError(null);

    try {
      // Generate nonce for security
      const nonce = Math.random().toString(36).substring(2, 15);
      const hashedNonce = await sha256(nonce);

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!appleCredential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      const result = await signInWithAppleCredential(
        appleCredential.identityToken,
        nonce
      );

      if (!result.success) {
        setSocialAuthError(result.error || 'Apple sign-in failed');
        return result;
      }

      // Ensure user document exists (creates User + Team if missing)
      // Note: Apple may not provide email on subsequent sign-ins
      if (result.user?.email) {
        try {
          // Build displayName from Apple credential (only available on first sign-in)
          let displayName: string | null = null;
          if (appleCredential.fullName) {
            const parts = [
              appleCredential.fullName.givenName,
              appleCredential.fullName.familyName,
            ].filter(Boolean);
            displayName = parts.join(' ') || null;
          }

          const ensureResult = await ensureUserDocumentExists(
            result.user.uid,
            result.user.email,
            displayName || result.user.displayName
          );
          if (ensureResult.error) {
            console.error('Error ensuring user document:', ensureResult.error);
          }
        } catch (err) {
          console.error('Error in ensureUserDocumentExists:', err);
        }
      }

      return result;
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { success: false, error: 'Sign-in cancelled' };
      }
      const errorMessage = error.message || 'Apple sign-in failed';
      setSocialAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSocialAuthLoading(false);
    }
  }, []);

  // Google Sign-In
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!Google) {
      return { success: false, error: 'Google Sign-In requires a development build' };
    }

    setSocialAuthLoading(true);
    setSocialAuthError(null);

    try {
      const result = await promptGoogleAsync();

      if (result?.type === 'cancel') {
        setSocialAuthLoading(false);
        return { success: false, error: 'Sign-in cancelled' };
      }

      // The actual sign-in is handled by the useEffect watching googleResponse
      // Return pending result - the effect will complete the sign-in
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign-in failed';
      setSocialAuthError(errorMessage);
      setSocialAuthLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [promptGoogleAsync]);

  // ============================================================================
  // EMAIL LINK (PASSWORDLESS) AUTHENTICATION
  // ============================================================================

  /**
   * Send a sign-in link to the user's email
   * Stores the email in AsyncStorage for completing sign-in on the same device
   */
  const sendSignInLink = useCallback(async (email: string): Promise<AuthResult> => {
    setSocialAuthLoading(true);
    setSocialAuthError(null);
    setEmailLinkSent(false);

    try {
      const result = await sendEmailSignInLink(email);

      if (result.success) {
        // Store email for later (when user clicks the link)
        await AsyncStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
        setEmailLinkSent(true);
      } else {
        setSocialAuthError(result.error || 'Failed to send sign-in link');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send sign-in link';
      setSocialAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSocialAuthLoading(false);
    }
  }, []);

  /**
   * Complete sign-in with the email link
   * Called when the app opens via deep link with the sign-in code
   */
  const completeSignInWithLink = useCallback(async (
    email: string,
    url: string
  ): Promise<AuthResult & { userCreated?: boolean }> => {
    setSocialAuthLoading(true);
    setSocialAuthError(null);

    try {
      const result = await completeEmailSignInWithUserSetup(email, url);

      if (result.success) {
        // Clear the stored email after successful sign-in
        await AsyncStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
        setEmailLinkSent(false);
      } else {
        setSocialAuthError(result.error || 'Failed to complete sign-in');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to complete sign-in';
      setSocialAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSocialAuthLoading(false);
    }
  }, []);

  /**
   * Check if a URL is an email sign-in link
   */
  const checkIsSignInWithEmailLink = useCallback((url: string): boolean => {
    return isEmailSignInLink(url);
  }, []);

  /**
   * Get the stored email for completing sign-in
   * Returns null if no email was stored (user opened link on different device)
   */
  const getStoredEmailForSignIn = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(EMAIL_LINK_STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  /**
   * Clear the stored email (used after successful sign-in or if user cancels)
   */
  const clearStoredEmailForSignIn = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
      setEmailLinkSent(false);
    } catch {
      // Ignore errors
    }
  }, []);

  // Mark as initialized once auth state has been checked
  useEffect(() => {
    if (!authStateLoading) {
      setIsInitialized(true);
    }
  }, [authStateLoading]);

  // Handle routing based on auth state
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onOnboardingScreen = segments[1] === 'onboarding';

    if (!user && !inAuthGroup) {
      // Not signed in and not in auth group, redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup && !onOnboardingScreen) {
      // Signed in and in auth group (but not on onboarding screen)
      // Check if user has completed onboarding
      const hasCompletedOnboarding = (user as any).onboardingCompleted;

      if (!hasCompletedOnboarding) {
        // Redirect to onboarding
        router.replace('/(auth)/onboarding');
      } else {
        // Redirect to main app
        router.replace('/(main)/(tabs)');
      }
    } else if (user && onOnboardingScreen && (user as any).onboardingCompleted) {
      // User is on onboarding screen but already completed it, redirect to main app
      router.replace('/(main)/(tabs)');
    }
  }, [user, segments, isInitialized]);

  const value: AuthContextType = {
    user,
    isLoading: authStateLoading || authActionLoading || socialAuthLoading,
    isInitialized,
    signIn,
    signUp,
    signOut: logout,
    sendPasswordReset: sendResetPasswordEmail,
    // Social auth
    signInWithApple,
    signInWithGoogle,
    isAppleSignInAvailable,
    // Email link (passwordless) auth
    sendSignInLink,
    completeSignInWithLink,
    isSignInWithEmailLink: checkIsSignInWithEmailLink,
    getStoredEmailForSignIn,
    clearStoredEmailForSignIn,
    emailLinkSent,
    // Migration state
    migrated,
    requiresPasswordReset,
    clearMigrationState,
    // Error handling
    error: error || socialAuthError,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
