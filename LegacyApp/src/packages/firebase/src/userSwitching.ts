/**
 * User switching service for admin impersonation and migration testing.
 * Allows admins to view the app as different users without changing Firebase Auth.
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  doc,
  DocumentReference,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, getOldDb, isMigrationEnabled } from './config';
import {
  userExistsInOldProject,
  migrateUser,
  type MigrationResult
} from './migration';
import { sendResetPasswordEmail } from './auth';
import type { User, Team } from '@ppa/interfaces';

export interface UserWithTeam extends User {
  teamName?: string;
  teamSport?: string;
}

/**
 * Represents a user from the old Firebase project with team information
 */
export interface OldProjectUser {
  uid: string;              // Old UID from old project
  email: string;
  fname: string;
  lname: string;
  teamId?: string;          // Team ID from old project
  teamName?: string;        // Team name fetched from old teams collection
  teamSport?: string;       // Team sport from old teams collection
  created?: number;         // Creation timestamp (milliseconds)
  modified?: number;        // Modified timestamp (milliseconds)
  existsInNew?: boolean;    // Whether user already migrated to new project
}

export interface FetchUsersResult {
  success: boolean;
  users: UserWithTeam[];
  error?: string;
}

export interface OldProjectUserInfo {
  email: string;
  existsInOld: boolean;
  existsInNew: boolean;
  needsMigration: boolean;
}

/**
 * Fetch all users from Firestore with their team names
 */
export const fetchAllUsers = async (): Promise<FetchUsersResult> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('email')
    );

    const snapshot = await getDocs(usersQuery);

    const usersWithTeams: UserWithTeam[] = await Promise.all(
      snapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data() as User;
        const user: UserWithTeam = {
          ...userData,
          uid: userDoc.id,
          ref: userDoc.ref,
          path: userDoc.ref.path,
        };

        // Try to fetch team name if teamRef exists
        if (userData.teamRef) {
          try {
            const teamDoc = await getDoc(userData.teamRef);
            if (teamDoc.exists()) {
              const teamData = teamDoc.data() as Team;
              user.teamName = teamData.name;
              user.teamSport = teamData.sport;
            }
          } catch (error) {
            // Team fetch failed, continue without team info
            console.warn(`Failed to fetch team for user ${userDoc.id}:`, error);
          }
        }

        return user;
      })
    );

    return {
      success: true,
      users: usersWithTeams,
    };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return {
      success: false,
      users: [],
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    };
  }
};

/**
 * Search users by email or name
 */
export const searchUsers = async (searchQuery: string): Promise<FetchUsersResult> => {
  try {
    // First fetch all users, then filter client-side
    // Firestore doesn't support LIKE queries, so we filter in memory
    const result = await fetchAllUsers();

    if (!result.success) {
      return result;
    }

    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return result;
    }

    const filteredUsers = result.users.filter((user) => {
      const email = user.email?.toLowerCase() || '';
      const fname = user.fname?.toLowerCase() || '';
      const lname = user.lname?.toLowerCase() || '';
      const fullName = `${fname} ${lname}`;
      const teamName = user.teamName?.toLowerCase() || '';

      return (
        email.includes(query) ||
        fname.includes(query) ||
        lname.includes(query) ||
        fullName.includes(query) ||
        teamName.includes(query)
      );
    });

    return {
      success: true,
      users: filteredUsers,
    };
  } catch (error) {
    console.error('Error searching users:', error);
    return {
      success: false,
      users: [],
      error: error instanceof Error ? error.message : 'Failed to search users',
    };
  }
};

/**
 * Get user by UID with team info
 */
export const getUserWithTeam = async (uid: string): Promise<UserWithTeam | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data() as User;
    const user: UserWithTeam = {
      ...userData,
      uid: userDoc.id,
      ref: userDoc.ref,
      path: userDoc.ref.path,
    };

    // Fetch team info
    if (userData.teamRef) {
      try {
        const teamDoc = await getDoc(userData.teamRef);
        if (teamDoc.exists()) {
          const teamData = teamDoc.data() as Team;
          user.teamName = teamData.name;
          user.teamSport = teamData.sport;
        }
      } catch (error) {
        console.warn(`Failed to fetch team for user ${uid}:`, error);
      }
    }

    return user;
  } catch (error) {
    console.error('Error fetching user with team:', error);
    return null;
  }
};

/**
 * Check user status in old and new Firebase projects
 */
export const checkUserMigrationStatus = async (email: string): Promise<OldProjectUserInfo> => {
  // Check if user exists in new project
  const usersQuery = query(
    collection(db, 'users'),
    where('email', '==', email)
  );
  const snapshot = await getDocs(usersQuery);
  const existsInNew = !snapshot.empty;

  // Check if user exists in old project
  const existsInOld = await userExistsInOldProject(email);

  return {
    email,
    existsInOld,
    existsInNew,
    needsMigration: existsInOld && !existsInNew,
  };
};

/**
 * Get list of users from OLD Firebase project that haven't been migrated
 */
export const getUnmigratedOldProjectUsers = async (): Promise<string[]> => {
  if (!isMigrationEnabled) {
    return [];
  }

  const oldDb = getOldDb();
  if (!oldDb) {
    return [];
  }

  try {
    const oldUsersQuery = query(collection(oldDb, 'users'));
    const oldUsersSnapshot = await getDocs(oldUsersQuery);

    const unmigratedEmails: string[] = [];

    for (const oldUserDoc of oldUsersSnapshot.docs) {
      const oldUserData = oldUserDoc.data();
      const email = oldUserData.email;

      if (email) {
        // Check if this email exists in new project
        const newUsersQuery = query(
          collection(db, 'users'),
          where('email', '==', email)
        );
        const newUsersSnapshot = await getDocs(newUsersQuery);

        if (newUsersSnapshot.empty) {
          unmigratedEmails.push(email);
        }
      }
    }

    return unmigratedEmails;
  } catch (error) {
    console.error('Error fetching unmigrated users:', error);
    return [];
  }
};

export interface TriggerMigrationResult {
  success: boolean;
  migrated: boolean;
  requiresPasswordReset: boolean;
  error?: string;
}

/**
 * Trigger migration for a specific user from old project
 * This creates the user in the new project and migrates their data
 */
export const triggerMigrationForUser = async (email: string): Promise<TriggerMigrationResult> => {
  try {
    // First check migration status
    const status = await checkUserMigrationStatus(email);

    if (!status.existsInOld) {
      return {
        success: false,
        migrated: false,
        requiresPasswordReset: false,
        error: 'User does not exist in the old project',
      };
    }

    if (status.existsInNew) {
      return {
        success: false,
        migrated: false,
        requiresPasswordReset: false,
        error: 'User already exists in the new project',
      };
    }

    // Get the old user's UID from the old project
    const oldDb = getOldDb();
    if (!oldDb) {
      return {
        success: false,
        migrated: false,
        requiresPasswordReset: false,
        error: 'Old database not configured',
      };
    }

    const oldUsersQuery = query(
      collection(oldDb, 'users'),
      where('email', '==', email)
    );
    const oldUsersSnapshot = await getDocs(oldUsersQuery);

    if (oldUsersSnapshot.empty) {
      return {
        success: false,
        migrated: false,
        requiresPasswordReset: false,
        error: 'User not found in old project',
      };
    }

    const oldUid = oldUsersSnapshot.docs[0].id;

    // Trigger the migration
    const migrationResult = await migrateUser(email, oldUid);

    if (migrationResult.success) {
      return {
        success: true,
        migrated: true,
        requiresPasswordReset: true,
      };
    }

    return {
      success: false,
      migrated: false,
      requiresPasswordReset: false,
      error: migrationResult.error || 'Migration failed',
    };
  } catch (error) {
    console.error('Error triggering migration:', error);
    return {
      success: false,
      migrated: false,
      requiresPasswordReset: false,
      error: error instanceof Error ? error.message : 'Failed to trigger migration',
    };
  }
};

/**
 * Send password reset email to a user
 */
export const sendPasswordResetToUser = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await sendResetPasswordEmail(email);
    return { success: result.success, error: result.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send password reset',
    };
  }
};

/**
 * Search for old project users by email or name (partial match)
 * This is a simpler query that searches for users containing the search term
 */
export const searchOldProjectUsers = async (searchQuery: string): Promise<{
  success: boolean;
  users: OldProjectUser[];
  error?: string;
}> => {
  if (!isMigrationEnabled) {
    return {
      success: false,
      users: [],
      error: 'Migration not enabled',
    };
  }

  const oldDb = getOldDb();
  if (!oldDb) {
    return {
      success: false,
      users: [],
      error: 'Old database not configured',
    };
  }

  if (!searchQuery || searchQuery.length < 3) {
    return {
      success: false,
      users: [],
      error: 'Search query must be at least 3 characters',
    };
  }

  try {
    // Firestore doesn't support full-text search, so we'll fetch users and filter client-side
    // For better performance in production, consider using Algolia or similar
    const usersCollectionRef = collection(oldDb, 'users');
    const oldUsersQuery = query(
      usersCollectionRef,
      orderBy('email'),
      limit(100) // Limit to prevent excessive reads
    );

    const oldUsersSnapshot = await getDocs(oldUsersQuery);
    const oldProjectUsers: OldProjectUser[] = [];
    const searchLower = searchQuery.toLowerCase();

    for (const oldUserDoc of oldUsersSnapshot.docs) {
      const oldUserData = oldUserDoc.data();

      if (!oldUserData.email) {
        continue;
      }

      // Check if email, first name, or last name contains the search query
      const emailMatch = oldUserData.email.toLowerCase().includes(searchLower);
      const fnameMatch = oldUserData.fname?.toLowerCase().includes(searchLower);
      const lnameMatch = oldUserData.lname?.toLowerCase().includes(searchLower);

      if (!emailMatch && !fnameMatch && !lnameMatch) {
        continue; // Skip if no match
      }

      // Check if user exists in new project
      const newUsersQuery = query(
        collection(db, 'users'),
        where('email', '==', oldUserData.email)
      );
      const newUsersSnapshot = await getDocs(newUsersQuery);
      const existsInNew = !newUsersSnapshot.empty;

      // Get team information if user has a teamRef
      let teamName: string | undefined;
      let teamSport: string | undefined;
      let teamId: string | undefined;

      if (oldUserData.teamRef) {
        try {
          // Handle both string paths and DocumentReference objects
          let teamRef: DocumentReference;
          if (typeof oldUserData.teamRef === 'string') {
            teamRef = doc(oldDb, oldUserData.teamRef);
            teamId = oldUserData.teamRef.split('/')[1];
          } else {
            teamRef = oldUserData.teamRef as DocumentReference;
            teamId = teamRef.id;
          }

          const teamDoc = await getDoc(teamRef);
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            teamName = teamData?.name;
            teamSport = teamData?.sport;
          }
        } catch (error) {
          console.error('Error fetching team data:', error);
        }
      }

      oldProjectUsers.push({
        uid: oldUserDoc.id,
        email: oldUserData.email,
        fname: oldUserData.fname || 'Unknown',
        lname: oldUserData.lname || 'User',
        teamId,
        teamName,
        teamSport,
        created: oldUserData.created,
        modified: oldUserData.modified,
        existsInNew,
      });
    }

    return {
      success: true,
      users: oldProjectUsers,
    };
  } catch (error) {
    console.error('Error searching old project users:', error);
    return {
      success: false,
      users: [],
      error: error instanceof Error ? error.message : 'Failed to search old project users',
    };
  }
};

/**
 * Fetch users from the old Firebase project with their team information
 * Supports pagination and sorts by most recent (modified or created timestamp)
 */
export const fetchOldProjectUsers = async (options?: {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}): Promise<{
  success: boolean;
  users: OldProjectUser[];
  hasMore: boolean;
  lastDoc?: QueryDocumentSnapshot;
  error?: string;
}> => {
  const pageSize = options?.pageSize || 20; // Default to 20 users per page

  if (!isMigrationEnabled) {
    return {
      success: false,
      users: [],
      hasMore: false,
      error: 'Migration not enabled',
    };
  }

  const oldDb = getOldDb();
  if (!oldDb) {
    return {
      success: false,
      users: [],
      hasMore: false,
      error: 'Old database not configured',
    };
  }

  try {
    // 1. Build query with pagination and sorting
    const usersCollectionRef = collection(oldDb, 'users');
    let oldUsersQuery = query(
      usersCollectionRef,
      orderBy('modified', 'desc'), // Sort by modified timestamp, most recent first
      limit(pageSize + 1) // Fetch one extra to check if there are more
    );

    // If we have a cursor, start after it
    if (options?.lastDoc) {
      oldUsersQuery = query(
        usersCollectionRef,
        orderBy('modified', 'desc'),
        startAfter(options.lastDoc),
        limit(pageSize + 1)
      );
    }

    const oldUsersSnapshot = await getDocs(oldUsersQuery);

    const oldProjectUsers: OldProjectUser[] = [];

    // 2. For each user, check if they exist in new project and get team info
    for (const oldUserDoc of oldUsersSnapshot.docs) {
      const oldUserData = oldUserDoc.data();
      
      if (!oldUserData.email) {
        continue; // Skip users without email
      }

      // Check if user exists in new project
      const newUsersQuery = query(
        collection(db, 'users'),
        where('email', '==', oldUserData.email)
      );
      const newUsersSnapshot = await getDocs(newUsersQuery);
      const existsInNew = !newUsersSnapshot.empty;

      // Get team information if user has a teamRef
      let teamName: string | undefined;
      let teamSport: string | undefined;
      let teamId: string | undefined;

      if (oldUserData.teamRef) {
        try {
          // Handle both string paths and DocumentReference objects
          let teamRef: DocumentReference;
          if (typeof oldUserData.teamRef === 'string') {
            // If it's a string path like "teams/fZeU1RoiMV", convert to DocumentReference
            const oldDb = getOldDb();
            teamRef = doc(oldDb, oldUserData.teamRef);
            teamId = oldUserData.teamRef.split('/')[1]; // Extract ID from path
          } else {
            // Already a DocumentReference
            teamRef = oldUserData.teamRef as DocumentReference;
            teamId = teamRef.id;
          }

          const teamDoc = await getDoc(teamRef);
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            teamName = teamData?.name;
            teamSport = teamData?.sport;
          }
        } catch (error) {
          console.error('Error fetching team data:', error);
        }
      }

      oldProjectUsers.push({
        uid: oldUserDoc.id,
        email: oldUserData.email,
        fname: oldUserData.fname || 'Unknown',
        lname: oldUserData.lname || 'User',
        teamId,
        teamName,
        teamSport,
        created: oldUserData.created,
        modified: oldUserData.modified,
        existsInNew,
      });
    }

    // 3. Check if there are more pages
    const hasMore = oldUsersSnapshot.docs.length > pageSize;
    const docs = hasMore ? oldUsersSnapshot.docs.slice(0, pageSize) : oldUsersSnapshot.docs;
    const lastDocument = docs.length > 0 ? docs[docs.length - 1] : undefined;

    // Only return the users up to pageSize (we fetched pageSize + 1 to check for more)
    const usersToReturn = hasMore ? oldProjectUsers.slice(0, pageSize) : oldProjectUsers;

    return {
      success: true,
      users: usersToReturn,
      hasMore,
      lastDoc: lastDocument,
    };
  } catch (error) {
    console.error('Error fetching old project users:', error);
    return {
      success: false,
      users: [],
      hasMore: false,
      error: error instanceof Error ? error.message : 'Failed to fetch old project users',
    };
  }
};
