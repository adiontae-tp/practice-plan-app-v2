import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  sendSignInLinkToEmail as firebaseSendSignInLinkToEmail,
  isSignInWithEmailLink as firebaseIsSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink,
  ActionCodeSettings,
  User,
  AuthError,
} from 'firebase/auth';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { auth } from './config';
import { 
  userDocumentExists, 
  createNewUserWithTeam, 
  linkPendingCoachInvites 
} from './firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

// Convert Firebase User to AuthUser
export const toAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

// Handle Firebase auth errors
export const handleAuthError = (error: AuthError): string => {
  const errorCode = error.code;

  switch (errorCode) {
    case 'auth/user-not-found':
      return 'User not found. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/email-already-in-use':
      return 'Email already in use. Please sign in or use a different email.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    return {
      success: true,
      user: toAuthUser(userCredential.user),
    };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: toAuthUser(userCredential.user),
    };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};

// Sign out
export const logout = async (): Promise<AuthResult> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};

// Send password reset email
export const sendResetPasswordEmail = async (email: string): Promise<AuthResult> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};

// Update user profile
export const updateUserProfile = async (
  displayName?: string,
  photoURL?: string
): Promise<AuthResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'No user is currently logged in.',
      };
    }

    await updateProfile(user, {
      ...(displayName && { displayName }),
      ...(photoURL && { photoURL }),
    });

    return {
      success: true,
      user: toAuthUser(user),
    };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};

// Update email
export const updateUserEmail = async (newEmail: string): Promise<AuthResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'No user is currently logged in.',
      };
    }

    await updateEmail(user, newEmail);
    return {
      success: true,
      user: toAuthUser(user),
    };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};

// Update password
export const updateUserPassword = async (newPassword: string): Promise<AuthResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'No user is currently logged in.',
      };
    }

    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};

// Listen to auth state changes
export const subscribeToAuthStateChanges = (
  callback: (user: AuthUser | null) => void
) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? toAuthUser(user) : null);
  });
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser;
  return user ? toAuthUser(user) : null;
};

/**
 * Get the current user's ID token
 * Used for cross-platform auth (mobile → web)
 * @param forceRefresh - If true, force token refresh
 */
export const getIdToken = async (forceRefresh = false): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
};

export interface EnsureUserResult {
  created: boolean;
  teamId?: string;
  linkedTeams?: string[];
  error?: string;
}

/**
 * Ensure a user document exists in Firestore.
 * Used after social auth (Google/Apple) to create User + Team if missing.
 * Also links any pending coach invitations.
 */
export const ensureUserDocumentExists = async (
  uid: string,
  email: string,
  displayName?: string | null
): Promise<EnsureUserResult> => {
  try {
    // Check if user doc already exists
    const exists = await userDocumentExists(uid);
    if (exists) {
      // User already exists, just link any pending invites
      const linkedTeamIds = await linkPendingCoachInvites(uid, email);
      return { 
        created: false,
        linkedTeams: linkedTeamIds.length > 0 ? linkedTeamIds : undefined,
      };
    }

    // Parse displayName into fname/lname
    const nameParts = (displayName || 'New User').trim().split(' ');
    const fname = nameParts[0] || 'New';
    const lname = nameParts.slice(1).join(' ') || 'User';

    // Create new user with default team
    const result = await createNewUserWithTeam(uid, email, fname, lname, 'My Team', '');

    if (!result.success) {
      return {
        created: false,
        error: result.error,
      };
    }

    // Link any pending coach invitations
    let linkedTeamIds: string[] = [];
    try {
      linkedTeamIds = await linkPendingCoachInvites(uid, email);
    } catch (linkError) {
      console.error('Error linking pending coach invites:', linkError);
    }

    return {
      created: true,
      teamId: result.teamId,
      linkedTeams: linkedTeamIds.length > 0 ? linkedTeamIds : undefined,
    };
  } catch (error) {
    console.error('Error in ensureUserDocumentExists:', error);
    return {
      created: false,
      error: error instanceof Error ? error.message : 'Failed to ensure user document',
    };
  }
};

// ============================================================================
// EMAIL LINK (PASSWORDLESS) AUTHENTICATION
// ============================================================================

/**
 * Email link authentication configuration
 * These settings control how the sign-in link behaves
 */
export interface EmailLinkConfig {
  /** The URL to redirect to after sign-in. Must be whitelisted in Firebase Console */
  continueUrl?: string;
  /** iOS bundle ID for deep linking */
  iosBundleId?: string;
  /** Android package name for deep linking */
  androidPackageName?: string;
  /** Whether to install the Android app if not installed */
  androidInstallApp?: boolean;
  /** Minimum Android app version */
  androidMinimumVersion?: string;
}

/**
 * Get the action code settings for email link sign-in
 * @param config - Optional custom configuration
 */
export const getEmailLinkActionCodeSettings = (config?: EmailLinkConfig): ActionCodeSettings => {
  // Default configuration for Practice Plan App
  const defaultConfig: ActionCodeSettings = {
    // URL you want to redirect back to - must be in authorized domains in Firebase Console
    // For mobile apps, this can be your Firebase Hosting domain or custom domain
    url: config?.continueUrl || 'https://ppa-tp.firebaseapp.com/auth/email-signin',
    // This must be true for email link sign-in
    handleCodeInApp: true,
    // iOS configuration
    iOS: {
      bundleId: config?.iosBundleId || 'com.parcee.practiceplan',
    },
    // Android configuration
    android: {
      packageName: config?.androidPackageName || 'com.parcee.practiceplan',
      installApp: config?.androidInstallApp ?? true,
      minimumVersion: config?.androidMinimumVersion || '1',
    },
    // Dynamic link domain - if using Firebase Dynamic Links
    // dynamicLinkDomain: 'practiceplan.page.link',
  };

  return defaultConfig;
};

/**
 * Send a sign-in link to the user's email address
 * @param email - The user's email address
 * @param config - Optional custom configuration for the email link
 * @returns AuthResult indicating success or failure
 *
 * IMPORTANT: After calling this, store the email locally so we can complete
 * sign-in when the user clicks the link (they might open on a different device)
 */
export const sendEmailSignInLink = async (
  email: string,
  config?: EmailLinkConfig
): Promise<AuthResult> => {
  try {
    const actionCodeSettings = getEmailLinkActionCodeSettings(config);
    await firebaseSendSignInLinkToEmail(auth, email, actionCodeSettings);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};

/**
 * Check if a URL is a sign-in with email link
 * @param url - The URL to check (usually window.location.href or deep link URL)
 * @returns true if the URL is a valid email sign-in link
 */
export const isEmailSignInLink = (url: string): boolean => {
  return firebaseIsSignInWithEmailLink(auth, url);
};

/**
 * Complete sign-in with email link
 * @param email - The user's email address (should match what was used to send the link)
 * @param url - The full URL containing the sign-in code (window.location.href or deep link)
 * @returns AuthResult with the signed-in user or error
 *
 * SECURITY: Always ask the user to provide their email again if they open the link
 * on a different device. This prevents session fixation attacks.
 */
export const completeEmailSignIn = async (
  email: string,
  url: string
): Promise<AuthResult> => {
  try {
    // Verify this is actually an email sign-in link
    if (!isEmailSignInLink(url)) {
      return {
        success: false,
        error: 'Invalid sign-in link. Please request a new one.',
      };
    }

    const userCredential = await firebaseSignInWithEmailLink(auth, email, url);
    return {
      success: true,
      user: toAuthUser(userCredential.user),
    };
  } catch (error) {
    const authError = error as AuthError;

    // Handle specific email link errors
    if (authError.code === 'auth/invalid-action-code') {
      return {
        success: false,
        error: 'This sign-in link has expired or already been used. Please request a new one.',
      };
    }
    if (authError.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'The email address doesn\'t match the one used to request the sign-in link.',
      };
    }

    return {
      success: false,
      error: handleAuthError(authError),
    };
  }
};

/**
 * Complete email sign-in and ensure user document exists
 * This is the main function to use for passwordless authentication
 * as it handles both the Firebase auth and Firestore user creation
 *
 * @param email - The user's email address
 * @param url - The full URL containing the sign-in code
 * @returns Combined result with auth and user document status
 */
export const completeEmailSignInWithUserSetup = async (
  email: string,
  url: string
): Promise<AuthResult & { userCreated?: boolean; teamId?: string }> => {
  // First, complete the Firebase authentication
  const authResult = await completeEmailSignIn(email, url);

  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  // Now ensure the user document exists in Firestore
  const userResult = await ensureUserDocumentExists(
    authResult.user.uid,
    email,
    authResult.user.displayName
  );

  return {
    ...authResult,
    userCreated: userResult.created,
    teamId: userResult.teamId,
  };
};

// ============================================================================
// ACCOUNT DELETION
// ============================================================================

/**
 * Delete the current user's account
 * This will:
 * - Delete Firebase Auth user
 * - Delete Firestore user document
 * - Remove user from all teams
 * - Delete teams if user is the only admin
 * - Clean up all related data
 */
export const deleteUserAccount = async (reason?: string): Promise<AuthResult> => {
  try {
    const functions = getFunctions();
    const deleteAccount = httpsCallable(functions, 'deleteUserAccount');

    const result = await deleteAccount({ reason });
    
    // Sign out the user after account deletion
    // This should happen even if there was an error, to clear local state
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error('[deleteUserAccount] Error signing out:', signOutError);
      // Continue even if sign out fails
    }
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[deleteUserAccount] Error:', error);
    console.error('[deleteUserAccount] Error type:', typeof error);
    console.error('[deleteUserAccount] Error keys:', Object.keys(error || {}));
    
    // Firebase callable functions throw errors with a specific structure
    // The error might be in error.details, error.message, or error.code
    let errorMessage = 'Failed to delete account';
    
    // Firebase callable errors have a specific structure
    // Check for the message in various places
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.details) {
      // Firebase callable error details can be a string or object
      if (typeof error.details === 'string') {
        errorMessage = error.details;
      } else if (error.details?.message) {
        errorMessage = error.details.message;
      } else if (typeof error.details === 'object') {
        errorMessage = JSON.stringify(error.details);
      }
    } else if (error?.code) {
      // Map common Firebase error codes to user-friendly messages
      if (error.code === 'functions/internal') {
        errorMessage = 'An internal error occurred. Please check the Firebase Function logs for details.';
      } else if (error.code === 'functions/deadline-exceeded') {
        errorMessage = 'The operation timed out. Please try again.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to delete this account.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'You must be signed in to delete your account.';
      } else {
        errorMessage = `Error: ${error.code}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.toString && error.toString() !== '[object Object]') {
      errorMessage = error.toString();
    }
    
    // Log the full error for debugging
    console.error('[deleteUserAccount] Extracted error message:', errorMessage);
    console.error('[deleteUserAccount] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};
