import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  AuthError,
} from 'firebase/auth';
import { auth, getOldAuth, isMigrationEnabled } from './config';
import { handleAuthError, toAuthUser, type AuthUser, type AuthResult } from './auth';
import { migrateUserData, type DataMigrationResult } from './dataMigration';
import { createNewUserWithTeam, linkPendingCoachInvites } from './firestore';

export interface MigrationResult extends AuthResult {
  migrated?: boolean;
  requiresPasswordReset?: boolean;
  dataMigration?: DataMigrationResult;
}

export interface OldCredentialsResult {
  valid: boolean;
  oldUid?: string;
}

/**
 * Check if a user exists in the NEW Firebase project
 */
export const userExistsInNewProject = async (email: string): Promise<boolean> => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    // If error, assume user doesn't exist
    return false;
  }
};

/**
 * Check if a user exists in the OLD Firebase project
 */
export const userExistsInOldProject = async (email: string): Promise<boolean> => {
  const oldAuth = getOldAuth();
  if (!oldAuth || !isMigrationEnabled) {
    return false;
  }

  try {
    const methods = await fetchSignInMethodsForEmail(oldAuth, email);
    return methods.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Verify credentials against the OLD Firebase project
 * Returns the old user's UID if credentials are valid (needed for data migration)
 */
export const verifyOldProjectCredentials = async (
  email: string,
  password: string
): Promise<OldCredentialsResult> => {
  const oldAuth = getOldAuth();
  if (!oldAuth || !isMigrationEnabled) {
    return { valid: false };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(oldAuth, email, password);
    return {
      valid: true,
      oldUid: userCredential.user.uid,
    };
  } catch (error) {
    return { valid: false };
  }
};

/**
 * Migrate user from old project to new project
 * Creates the user in the new project with a temporary password,
 * migrates Firestore data, and sends a password reset email
 */
export const migrateUser = async (
  email: string,
  oldUid: string,
  options?: {
    temporaryPassword?: string;
    sendPasswordReset?: boolean; // Only send email if explicitly requested
  }
): Promise<MigrationResult> => {
  try {
    // Generate a random temporary password if not provided
    const tempPassword = options?.temporaryPassword || generateTemporaryPassword();

    // Create user in new project with temporary password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      tempPassword
    );

    const newUid = userCredential.user.uid;

    // Migrate Firestore data (user document, team, subcollections, storage)
    let dataMigrationResult: DataMigrationResult | undefined;
    try {
      dataMigrationResult = await migrateUserData(oldUid, newUid);
      if (!dataMigrationResult.success) {
        console.warn('Data migration had issues:', dataMigrationResult.error);
      }
    } catch (dataMigrationError) {
      console.error('Data migration failed:', dataMigrationError);
      // Don't fail the entire migration if data migration fails
      // User can still sign in and data can be re-synced later
    }

    // Only send password reset email if explicitly requested (e.g., on login attempt)
    if (options?.sendPasswordReset) {
      await sendPasswordResetEmail(auth, email);
    }

    return {
      success: true,
      user: toAuthUser(userCredential.user),
      migrated: true,
      requiresPasswordReset: true,
      dataMigration: dataMigrationResult,
    };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
      migrated: false,
    };
  }
};

/**
 * Main migration sign-in flow:
 * 1. Try to sign in to NEW project
 * 2. If user not found, check OLD project
 * 3. If user exists in OLD project and credentials are valid, migrate them (auth + data)
 * 4. Send password reset email and inform user
 */
export const signInWithMigration = async (
  email: string,
  password: string
): Promise<MigrationResult> => {
  // First, try to sign in to the NEW project
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: toAuthUser(userCredential.user),
      migrated: false,
    };
  } catch (newProjectError) {
    const error = newProjectError as AuthError;

    // If user not found in new project, check migration
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      // Check if migration is enabled
      const oldAuth = getOldAuth();
      if (!isMigrationEnabled || !oldAuth) {
        return {
          success: false,
          error: 'User not found. Please sign up for a new account.',
        };
      }

      // Check if user exists in old project
      const existsInOld = await userExistsInOldProject(email);

      if (!existsInOld) {
        return {
          success: false,
          error: 'User not found. Please sign up for a new account.',
        };
      }

      // Verify credentials against old project and get old UID
      const credentialsResult = await verifyOldProjectCredentials(email, password);

      if (!credentialsResult.valid || !credentialsResult.oldUid) {
        return {
          success: false,
          error: 'Incorrect password. Please try again.',
        };
      }

      // User exists in old project with valid credentials - migrate auth + data
      // Send password reset email immediately so they can set a new password
      const migrationResult = await migrateUser(email, credentialsResult.oldUid, {
        sendPasswordReset: true, // Send email on first login attempt
      });

      if (migrationResult.success) {
        return {
          success: false, // User needs to reset password before they can fully sign in
          migrated: true,
          requiresPasswordReset: true,
          dataMigration: migrationResult.dataMigration,
          error: 'Welcome to our new platform! We\'ve migrated your account and sent a password reset email. Please check your inbox to set a new password. You can keep the same password or choose a new one.',
        };
      }

      return migrationResult;
    }

    // For other errors (wrong password, etc.), return the error
    return {
      success: false,
      error: handleAuthError(error),
    };
  }
};

/**
 * Generate a secure temporary password
 */
const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Sign up a new user with Firestore User/Team creation.
 * This integrates with the migration system by:
 * 1. Checking if user exists in OLD project first (they should sign in instead)
 * 2. Checking if user exists in NEW project (duplicate account)
 * 3. Creating Firebase Auth user
 * 4. Creating Firestore User + Team documents
 * 5. Linking any pending coach invitations
 */
export const signUpWithUserCreation = async (
  email: string,
  password: string,
  fname: string,
  lname: string,
  teamName: string,
  sport: string
): Promise<MigrationResult> => {
  try {
    // 1. Check if user exists in OLD project (migration case)
    const existsInOld = await userExistsInOldProject(email);
    if (existsInOld) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }

    // 2. Check if user exists in NEW project
    const existsInNew = await userExistsInNewProject(email);
    if (existsInNew) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }

    // 3. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUid = userCredential.user.uid;

    // 4. Create Firestore User + Team documents
    const createResult = await createNewUserWithTeam(newUid, email, fname, lname, teamName, sport);

    if (!createResult.success) {
      // Rollback: delete auth user if Firestore creation fails
      try {
        await userCredential.user.delete();
      } catch (deleteError) {
        console.error('Failed to rollback auth user after Firestore error:', deleteError);
      }
      return {
        success: false,
        error: createResult.error || 'Failed to create user account',
      };
    }

    // 5. Link any pending coach invitations (if this email was invited to other teams)
    try {
      const linkedTeamIds = await linkPendingCoachInvites(newUid, email);
      if (linkedTeamIds.length > 0) {
        console.log(`Linked ${linkedTeamIds.length} pending coach invitations for ${email}`);
      }
    } catch (linkError) {
      // Don't fail signup if linking invites fails
      console.error('Error linking pending coach invites:', linkError);
    }

    // 6. Send welcome email
    try {
      const { sendWelcomeEmail } = await import('./email');
      const userName = `${fname} ${lname}`.trim() || 'there';
      await sendWelcomeEmail({
        recipientEmail: email,
        userName,
      });
      console.log(`[signUpWithUserCreation] Welcome email queued for ${email}`);
    } catch (emailError) {
      // Don't fail signup if welcome email fails
      console.error('[signUpWithUserCreation] Failed to send welcome email:', emailError);
    }

    return {
      success: true,
      user: toAuthUser(userCredential.user),
      migrated: false,
    };
  } catch (error) {
    return {
      success: false,
      error: handleAuthError(error as AuthError),
    };
  }
};
