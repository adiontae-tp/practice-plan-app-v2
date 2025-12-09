import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  DocumentReference,
  Firestore,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  getBytes,
  FirebaseStorage,
} from 'firebase/storage';
import { db, storage, getOldDb, getOldStorage, isMigrationEnabled } from './config';
import type { User, Team } from '@ppa/interfaces';

// Subcollections that exist under each team
const TEAM_SUBCOLLECTIONS = [
  'plans',
  'tags',
  'coaches',
  'periods',
  'templates',
  'files',
  'announcements',
] as const;

export interface DataMigrationResult {
  success: boolean;
  userMigrated: boolean;
  teamMigrated: boolean;
  teamAlreadyExisted: boolean;
  error?: string;
  details?: {
    subcollectionsCopied: string[];
    filesCopied: number;
  };
}

/**
 * Check if a team already exists in the new project
 */
export const teamExistsInNewProject = async (teamId: string): Promise<boolean> => {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    return teamSnap.exists();
  } catch (error) {
    console.error('Error checking if team exists:', error);
    return false;
  }
};

/**
 * Get user document from the old project
 */
export const getOldUserDocument = async (oldUid: string): Promise<User | null> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return null;
  }

  try {
    const userRef = doc(oldDb as Firestore, 'users', oldUid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as User;
  } catch (error) {
    console.error('Error getting old user document:', error);
    return null;
  }
};

/**
 * Extract team ID from a teamRef DocumentReference
 */
const getTeamIdFromRef = (teamRef: DocumentReference | string | null): string | null => {
  if (!teamRef) return null;

  if (typeof teamRef === 'string') {
    // If it's a path string like "teams/abc123"
    const parts = teamRef.split('/');
    return parts[parts.length - 1];
  }

  // If it's a DocumentReference
  return teamRef.id;
};

/**
 * Add human-readable timestamp fields (created_t, modified_t) from millisecond values
 */
const addReadableTimestamps = (data: Record<string, unknown>): Record<string, unknown> => {
  const updated = { ...data };

  if (updated.created && typeof updated.created === 'number') {
    updated.created_t = Timestamp.fromMillis(updated.created);
  }

  if (updated.modified && typeof updated.modified === 'number') {
    updated.modified_t = Timestamp.fromMillis(updated.modified);
  }

  return updated;
};

/**
 * Transform document data during re-migration
 * Updates user IDs, tag references, and applies subcollection-specific transformations
 */
const transformDocumentData = (
  data: Record<string, unknown>,
  oldUserIdToNewUidMap: Map<string, string>,
  subcollectionName: string,
  teamId: string
): Record<string, unknown> => {
  let updated = { ...data };

  // Subcollection-specific transformations
  switch (subcollectionName) {
    case 'plans':
      // Update uid field if it exists in the map
      if (updated.uid && typeof updated.uid === 'string' && oldUserIdToNewUidMap.has(updated.uid)) {
        updated.uid = oldUserIdToNewUidMap.get(updated.uid)!;
      }

      // Transform tags[] DocumentReferences
      if (Array.isArray(updated.tags)) {
        updated.tags = updated.tags.map((tag) => {
          if (tag && typeof tag === 'object' && 'path' in tag) {
            const tagId = (tag as DocumentReference).id;
            return doc(db, 'teams', teamId, 'tags', tagId);
          }
          return tag;
        });
      }

      // Transform nested activities[].tags[]
      if (Array.isArray(updated.activities)) {
        updated.activities = updated.activities.map((activity: Record<string, unknown>) => {
          if (activity && Array.isArray(activity.tags)) {
            return {
              ...activity,
              tags: activity.tags.map((tag) => {
                if (tag && typeof tag === 'object' && 'path' in tag) {
                  const tagId = (tag as DocumentReference).id;
                  return doc(db, 'teams', teamId, 'tags', tagId);
                }
                return tag;
              }),
            };
          }
          return activity;
        });
      }
      break;

    case 'templates':
      // Transform tags[] DocumentReferences
      if (Array.isArray(updated.tags)) {
        updated.tags = updated.tags.map((tag) => {
          if (tag && typeof tag === 'object' && 'path' in tag) {
            const tagId = (tag as DocumentReference).id;
            return doc(db, 'teams', teamId, 'tags', tagId);
          }
          return tag;
        });
      }

      // Transform nested activities[].tags[]
      if (Array.isArray(updated.activities)) {
        updated.activities = updated.activities.map((activity: Record<string, unknown>) => {
          if (activity && Array.isArray(activity.tags)) {
            return {
              ...activity,
              tags: activity.tags.map((tag) => {
                if (tag && typeof tag === 'object' && 'path' in tag) {
                  const tagId = (tag as DocumentReference).id;
                  return doc(db, 'teams', teamId, 'tags', tagId);
                }
                return tag;
              }),
            };
          }
          return activity;
        });
      }
      break;

    case 'coaches':
      // Update userId field using the mapping
      if (updated.userId && typeof updated.userId === 'string' && oldUserIdToNewUidMap.has(updated.userId)) {
        updated.userId = oldUserIdToNewUidMap.get(updated.userId)!;
      }
      break;

    case 'files':
      // Update uploadedBy field
      if (updated.uploadedBy && typeof updated.uploadedBy === 'string' && oldUserIdToNewUidMap.has(updated.uploadedBy)) {
        updated.uploadedBy = oldUserIdToNewUidMap.get(updated.uploadedBy)!;
      }
      // Tags are strings in files, no transformation needed
      break;

    case 'announcements':
      // Update createdBy field
      if (updated.createdBy && typeof updated.createdBy === 'string' && oldUserIdToNewUidMap.has(updated.createdBy)) {
        updated.createdBy = oldUserIdToNewUidMap.get(updated.createdBy)!;
      }

      // Update readBy[] array
      if (Array.isArray(updated.readBy)) {
        updated.readBy = updated.readBy.map((userId) => {
          if (typeof userId === 'string' && oldUserIdToNewUidMap.has(userId)) {
            return oldUserIdToNewUidMap.get(userId)!;
          }
          return userId;
        });
      }
      break;

    // periods and tags don't need special transformations
    case 'periods':
    case 'tags':
      // No special transformations needed
      break;
  }

  // Universal transformations
  updated = addReadableTimestamps(updated);

  // Remove old ref field (will be recreated by setDoc)
  delete updated.ref;

  return updated;
};

/**
 * Migrate a single subcollection from old team to new team
 * @param teamId - The team ID
 * @param subcollectionName - Name of the subcollection to migrate
 * @param oldUid - Optional old user ID (for updating userId fields in coaches)
 * @param newUid - Optional new user ID (for updating userId fields in coaches)
 * @param oldUserIdToNewUidMap - Map of old user IDs to new UIDs (for coach userId updates)
 * @returns Count of documents migrated and map of old coach IDs to new user UIDs
 */
const migrateSubcollection = async (
  teamId: string,
  subcollectionName: string,
  oldUid?: string,
  newUid?: string,
  oldUserIdToNewUidMap?: Map<string, string>
): Promise<{ count: number; coachToUserMap: Map<string, string> }> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return { count: 0, coachToUserMap: new Map() };
  }

  const coachToUserMap = new Map<string, string>(); // Maps old coach document ID to new user UID

  try {
    const oldCollectionRef = collection(oldDb as Firestore, 'teams', teamId, subcollectionName);
    const snapshot = await getDocs(oldCollectionRef);

    let count = 0;
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const newDocRef = doc(db, 'teams', teamId, subcollectionName, docSnap.id);

      // Update any DocumentReference fields to point to new project
      let updatedData = updateDocumentReferences(data, teamId);

      // For coaches subcollection, track userId mappings and update them
      if (subcollectionName === 'coaches') {
        const oldCoachUserId = updatedData.userId as string | undefined;
        
        // If this coach's userId matches the currently migrating user, update it
        if (oldCoachUserId && oldUid && newUid && oldCoachUserId === oldUid) {
          updatedData = {
            ...updatedData,
            userId: newUid,
          };
          // Track this coach -> user mapping
          coachToUserMap.set(docSnap.id, newUid);
        } else if (oldCoachUserId && oldUserIdToNewUidMap?.has(oldCoachUserId)) {
          // This coach's userId has already been migrated by another user
          const mappedNewUid = oldUserIdToNewUidMap.get(oldCoachUserId)!;
          updatedData = {
            ...updatedData,
            userId: mappedNewUid,
          };
          coachToUserMap.set(docSnap.id, mappedNewUid);
        } else if (oldCoachUserId) {
          // Coach has a userId but we don't have the mapping yet
          // Keep the old userId for now - it will be updated when that user migrates
          coachToUserMap.set(docSnap.id, oldCoachUserId);
        }
      }

      // Add readable timestamps
      updatedData = addReadableTimestamps(updatedData);

      await setDoc(newDocRef, updatedData);
      count++;
    }

    return { count, coachToUserMap };
  } catch (error) {
    console.error(`Error migrating subcollection ${subcollectionName}:`, error);
    return { count: 0, coachToUserMap: new Map() };
  }
};

/**
 * Update DocumentReference fields in data to point to new project's Firestore
 * This handles tags, headCoach, and other reference fields
 * @param coachToUserMap - Map of old coach document IDs to new user UIDs (for headCoach resolution)
 */
const updateDocumentReferences = (
  data: Record<string, unknown>,
  teamId: string,
  coachToUserMap?: Map<string, string>
): Record<string, unknown> => {
  const updated = { ...data };

  // Handle tags array (can be DocumentReferences or Tag objects)
  if (Array.isArray(updated.tags)) {
    updated.tags = updated.tags.map((tag) => {
      if (tag && typeof tag === 'object' && 'id' in tag) {
        // It's a Tag object, keep it as is
        return tag;
      }
      if (tag && typeof tag === 'object' && 'path' in tag) {
        // It's a DocumentReference, create new reference in new project
        const tagId = (tag as DocumentReference).id;
        return doc(db, 'teams', teamId, 'tags', tagId);
      }
      return tag;
    });
  }

  // Handle activities array (plans and templates have this)
  if (Array.isArray(updated.activities)) {
    updated.activities = updated.activities.map((activity: Record<string, unknown>) => {
      if (activity && Array.isArray(activity.tags)) {
        return {
          ...activity,
          tags: activity.tags.map((tag) => {
            if (tag && typeof tag === 'object' && 'path' in tag) {
              const tagId = (tag as DocumentReference).id;
              return doc(db, 'teams', teamId, 'tags', tagId);
            }
            return tag;
          }),
        };
      }
      return activity;
    });
  }

  // Handle headCoach reference (Team document)
  // headCoach should point to users collection, not coaches subcollection
  if (updated.headCoach && typeof updated.headCoach === 'object' && 'path' in updated.headCoach) {
    const oldCoachId = (updated.headCoach as DocumentReference).id;
    
    // Look up the new user UID for this coach
    if (coachToUserMap && coachToUserMap.has(oldCoachId)) {
      const newUserUid = coachToUserMap.get(oldCoachId)!;
      // Set headCoach to point to users collection with the new UID
      updated.headCoach = doc(db, 'users', newUserUid);
    } else {
      // If we don't have the mapping yet, we'll need to look it up from the coach document
      // For now, we'll leave it as a placeholder that will be fixed later
      // This shouldn't happen in normal flow, but handle gracefully
      console.warn(`No user mapping found for coach ${oldCoachId}, headCoach reference may be incorrect`);
      // Still create the reference structure, but it will need to be fixed
      updated.headCoach = doc(db, 'teams', teamId, 'coaches', oldCoachId);
    }
  }

  // Handle teamRef (User document)
  if (updated.teamRef && typeof updated.teamRef === 'object' && 'path' in updated.teamRef) {
    updated.teamRef = doc(db, 'teams', teamId);
  }

  // Handle ref field - create new reference in new project
  if (updated.ref && typeof updated.ref === 'object' && 'path' in updated.ref) {
    // This will be set when the document is created, so we can remove it
    delete updated.ref;
  }

  return updated;
};

/**
 * Migrate all storage files for a team
 */
const migrateTeamStorage = async (teamId: string): Promise<number> => {
  const oldStorage = getOldStorage();
  if (!oldStorage || !isMigrationEnabled) {
    return 0;
  }

  try {
    const oldFilesRef = ref(oldStorage as FirebaseStorage, `teams/${teamId}/files`);
    const fileList = await listAll(oldFilesRef);

    let count = 0;
    for (const item of fileList.items) {
      try {
        // Download file from old storage
        const fileBytes = await getBytes(item);

        // Upload to new storage with same path
        const newFileRef = ref(storage, item.fullPath);
        await uploadBytes(newFileRef, fileBytes);

        count++;
      } catch (fileError) {
        console.error(`Error migrating file ${item.name}:`, fileError);
        // Continue with other files even if one fails
      }
    }

    return count;
  } catch (error) {
    console.error('Error migrating team storage:', error);
    return 0;
  }
};

/**
 * Resolve headCoach reference by looking up the coach's userId and finding the new UID
 * @param oldCoachRef - The old headCoach DocumentReference or string path
 * @param teamId - The team ID
 * @param oldUid - The old user ID (for the currently migrating user)
 * @param newUid - The new user ID (for the currently migrating user)
 * @param oldUserIdToNewUidMap - Map of old user IDs to new UIDs
 */
const resolveHeadCoachReference = async (
  oldCoachRef: DocumentReference | string,
  teamId: string,
  oldUid?: string,
  newUid?: string,
  oldUserIdToNewUidMap?: Map<string, string>
): Promise<DocumentReference | null> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return null;
  }

  try {
    // Convert string path to DocumentReference if needed
    let coachRef: DocumentReference;
    if (typeof oldCoachRef === 'string') {
      // Parse the path to get collection and document ID
      const pathParts = oldCoachRef.split('/');
      if (pathParts.length < 2) {
        console.warn(`Invalid headCoach path: ${oldCoachRef}`);
        return null;
      }
      // Reconstruct as a reference to the coaches subcollection
      const coachId = pathParts[pathParts.length - 1];
      coachRef = doc(oldDb as Firestore, 'teams', teamId, 'coaches', coachId);
    } else {
      coachRef = oldCoachRef;
    }

    // Get the old coach document to find its userId
    const oldCoachSnap = await getDoc(coachRef);
    if (!oldCoachSnap.exists()) {
      console.warn(`Old coach document not found for headCoach: ${coachRef.id}`);
      return null;
    }

    const oldCoachData = oldCoachSnap.data();
    const oldCoachUserId = oldCoachData.userId as string | undefined;

    if (!oldCoachUserId) {
      console.warn(`Coach ${coachRef.id} has no userId`);
      return null;
    }

    // Check if this is the currently migrating user
    if (oldUid && newUid && oldCoachUserId === oldUid) {
      return doc(db, 'users', newUid);
    }

    // Check if we have a mapping for this userId
    if (oldUserIdToNewUidMap && oldUserIdToNewUidMap.has(oldCoachUserId)) {
      const newUserUid = oldUserIdToNewUidMap.get(oldCoachUserId)!;
      return doc(db, 'users', newUserUid);
    }

    // Try to find the user in the new database by checking if they've migrated
    // This handles the case where another user from the same team migrated first
    try {
      const newUsersRef = collection(db, 'users');
      const newUsersSnap = await getDocs(newUsersRef);
      
      for (const userDoc of newUsersSnap.docs) {
        const userData = userDoc.data() as User;
        // Check if this user has the migratedAt flag and matches the email pattern
        // We can't directly match old UID, but we can check if user exists
        // For now, if we can't find it, we'll need to handle it later
      }
    } catch (error) {
      console.error('Error looking up migrated user:', error);
    }

    // If we can't resolve it now, return null and it will be fixed when that user migrates
    console.warn(`Cannot resolve headCoach userId ${oldCoachUserId} - will be fixed when that user migrates`);
    return null;
  } catch (error) {
    console.error('Error resolving headCoach reference:', error);
    return null;
  }
};

/**
 * Migrate team document and all its subcollections
 * @param teamId - The team ID to migrate
 * @param oldUid - The old user ID (for updating coach userId fields)
 * @param newUid - The new user ID (for updating coach userId fields)
 * @param oldUserIdToNewUidMap - Map of old user IDs to new UIDs (for users who already migrated)
 */
export const migrateTeamWithSubcollections = async (
  teamId: string,
  oldUid?: string,
  newUid?: string,
  oldUserIdToNewUidMap?: Map<string, string>
): Promise<{ success: boolean; subcollectionsCopied: string[]; filesCopied: number }> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return { success: false, subcollectionsCopied: [], filesCopied: 0 };
  }

  const subcollectionsCopied: string[] = [];
  let filesCopied = 0;

  try {
    // Get the old team document
    const oldTeamRef = doc(oldDb as Firestore, 'teams', teamId);
    const oldTeamSnap = await getDoc(oldTeamRef);

    if (!oldTeamSnap.exists()) {
      console.error('Old team document not found:', teamId);
      return { success: false, subcollectionsCopied: [], filesCopied: 0 };
    }

    const teamData = oldTeamSnap.data() as Team;
    const oldHeadCoachRef = teamData.headCoach as DocumentReference | string | undefined;

    // Step 1: Migrate coaches subcollection first to build the mapping
    const coachesResult = await migrateSubcollection(
      teamId,
      'coaches',
      oldUid,
      newUid,
      oldUserIdToNewUidMap
    );
    const coachToUserMap = coachesResult.coachToUserMap;
    
    // Add the currently migrating user to the map if they're a coach
    if (oldUid && newUid) {
      // Check if this user is in the coaches subcollection
      const oldCoachesRef = collection(oldDb as Firestore, 'teams', teamId, 'coaches');
      const oldCoachesSnap = await getDocs(oldCoachesRef);
      for (const coachDoc of oldCoachesSnap.docs) {
        const coachData = coachDoc.data();
        if (coachData.userId === oldUid) {
          coachToUserMap.set(coachDoc.id, newUid);
          break;
        }
      }
    }

    // Step 2: Resolve headCoach reference
    let resolvedHeadCoach: DocumentReference | null = null;
    if (oldHeadCoachRef) {
      // Extract coach ID from reference (handle both string paths and DocumentReferences)
      let oldCoachId: string;
      if (typeof oldHeadCoachRef === 'string') {
        const pathParts = oldHeadCoachRef.split('/');
        oldCoachId = pathParts[pathParts.length - 1];
      } else if (oldHeadCoachRef && typeof oldHeadCoachRef === 'object' && 'id' in oldHeadCoachRef) {
        oldCoachId = oldHeadCoachRef.id;
      } else {
        console.warn('Invalid headCoach reference type:', typeof oldHeadCoachRef);
        oldCoachId = '';
      }

      // First try to get it from the coach-to-user map
      if (oldCoachId && coachToUserMap.has(oldCoachId)) {
        const newUserUid = coachToUserMap.get(oldCoachId)!;
        resolvedHeadCoach = doc(db, 'users', newUserUid);
      } else if (oldCoachId) {
        // Try to resolve it by looking up the coach document
        resolvedHeadCoach = await resolveHeadCoachReference(
          oldHeadCoachRef,
          teamId,
          oldUid,
          newUid,
          oldUserIdToNewUidMap
        );
      }
    }

    // Step 3: Update team document with resolved headCoach
    // Temporarily remove headCoach from teamData so updateDocumentReferences doesn't set it incorrectly
    const teamDataWithoutHeadCoach = { ...teamData };
    delete (teamDataWithoutHeadCoach as Record<string, unknown>).headCoach;
    
    const updatedTeamData = updateDocumentReferences(
      teamDataWithoutHeadCoach as unknown as Record<string, unknown>,
      teamId,
      coachToUserMap
    );

    // Set headCoach only if we successfully resolved it
    if (resolvedHeadCoach) {
      updatedTeamData.headCoach = resolvedHeadCoach;
    } else if (oldHeadCoachRef) {
      // If we couldn't resolve it, log a warning but don't set an incorrect reference
      // This will be fixed when the headCoach user migrates
      console.warn(
        `Could not resolve headCoach reference for team ${teamId}. ` +
        `This will be fixed when the headCoach user migrates.`
      );
      // Don't set headCoach - leave it undefined so it can be fixed later
    }

    // Add readable timestamps
    const teamDataWithTimestamps = addReadableTimestamps(updatedTeamData);

    // Set the team document in new project
    const newTeamRef = doc(db, 'teams', teamId);
    await setDoc(newTeamRef, {
      ...teamDataWithTimestamps,
      id: teamId,
      migratedAt: Date.now(),
    });

    if (coachesResult.count > 0) {
      subcollectionsCopied.push(`coaches (${coachesResult.count})`);
    }

    // Step 4: Migrate other subcollections (skip coaches, already done)
    for (const subcollection of TEAM_SUBCOLLECTIONS) {
      if (subcollection === 'coaches') {
        continue; // Already migrated
      }
      const result = await migrateSubcollection(teamId, subcollection, oldUid, newUid, oldUserIdToNewUidMap);
      if (result.count > 0) {
        subcollectionsCopied.push(`${subcollection} (${result.count})`);
      }
    }

    // Migrate storage files
    filesCopied = await migrateTeamStorage(teamId);

    return { success: true, subcollectionsCopied, filesCopied };
  } catch (error) {
    console.error('Error migrating team:', error);
    return { success: false, subcollectionsCopied, filesCopied };
  }
};

/**
 * Update coach userId after migration when team already exists
 * This handles the case where another team member migrated first,
 * and we need to update this user's coach record with their new userId
 */
const updateCoachUserIdAfterMigration = async (
  teamId: string,
  oldUid: string,
  newUid: string
): Promise<boolean> => {
  try {
    // Find coach document with the old userId
    const coachesRef = collection(db, 'teams', teamId, 'coaches');
    const snapshot = await getDocs(coachesRef);

    for (const coachDoc of snapshot.docs) {
      const coachData = coachDoc.data();
      if (coachData.userId === oldUid) {
        // Update this coach's userId to the new one
        await updateDoc(coachDoc.ref, { userId: newUid });
        console.log(`Updated coach ${coachDoc.id} userId from ${oldUid} to ${newUid}`);
        return true;
      }
    }

    console.warn(`No coach found with userId ${oldUid} in team ${teamId}`);
    return false;
  } catch (error) {
    console.error('Error updating coach userId after migration:', error);
    return false;
  }
};

/**
 * Update team's headCoach reference after migration
 * This handles the case where another coach migrated first (leaving headCoach null/undefined),
 * and now the actual head coach is migrating - we need to update the team's headCoach field
 */
const updateTeamHeadCoachAfterMigration = async (
  teamId: string,
  oldUid: string,
  newUid: string
): Promise<boolean> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return false;
  }

  try {
    // Get the old team document to check who the headCoach was
    const oldTeamRef = doc(oldDb as Firestore, 'teams', teamId);
    const oldTeamSnap = await getDoc(oldTeamRef);

    if (!oldTeamSnap.exists()) {
      console.warn(`Old team document not found: ${teamId}`);
      return false;
    }

    const oldTeamData = oldTeamSnap.data() as Team;
    const oldHeadCoachRef = oldTeamData.headCoach as DocumentReference | string | undefined;

    if (!oldHeadCoachRef) {
      // No headCoach in old team
      return false;
    }

    // Get the coach ID from the reference
    let oldCoachId: string;
    if (typeof oldHeadCoachRef === 'string') {
      const pathParts = oldHeadCoachRef.split('/');
      oldCoachId = pathParts[pathParts.length - 1];
    } else if (oldHeadCoachRef && typeof oldHeadCoachRef === 'object' && 'id' in oldHeadCoachRef) {
      oldCoachId = oldHeadCoachRef.id;
    } else {
      console.warn('Invalid headCoach reference type');
      return false;
    }

    // Get the old coach document to check its userId
    const oldCoachRef = doc(oldDb as Firestore, 'teams', teamId, 'coaches', oldCoachId);
    const oldCoachSnap = await getDoc(oldCoachRef);

    if (!oldCoachSnap.exists()) {
      console.warn(`Old coach document not found: ${oldCoachId}`);
      return false;
    }

    const oldCoachData = oldCoachSnap.data();
    const oldCoachUserId = oldCoachData.userId as string | undefined;

    // Check if the currently migrating user is the headCoach
    if (oldCoachUserId !== oldUid) {
      // This user is not the headCoach, nothing to update
      return false;
    }

    // This user IS the headCoach - update the team's headCoach reference
    const newTeamRef = doc(db, 'teams', teamId);
    const newHeadCoachRef = doc(db, 'users', newUid);

    await updateDoc(newTeamRef, {
      headCoach: newHeadCoachRef,
    });

    console.log(`Updated team ${teamId} headCoach reference to user ${newUid}`);
    return true;
  } catch (error) {
    console.error('Error updating team headCoach after migration:', error);
    return false;
  }
};

/**
 * Create user document in new project with updated references
 * This function ensures the user document is created or updated with migration data
 */
export const createMigratedUserDocument = async (
  oldUserData: User,
  newUid: string,
  teamId: string
): Promise<boolean> => {
  try {
    const newUserRef = doc(db, 'users', newUid);

    // Check if user already exists
    const existingUserSnap = await getDoc(newUserRef);
    
    // Destructure to exclude ref and teamRef (which point to old database)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ref: _oldRef, teamRef: _oldTeamRef, ...userDataWithoutRefs } = oldUserData;

    // Add readable timestamps
    const userDataWithTimestamps = addReadableTimestamps(userDataWithoutRefs as Record<string, unknown>);

    const userData = {
      ...userDataWithTimestamps,
      uid: newUid,
      teamRef: doc(db, 'teams', teamId),
      ref: newUserRef, // Create new ref pointing to new database
      dataMigrated: true,
      migratedAt: Date.now(),
      path: `users/${newUid}`,
    };

    if (existingUserSnap.exists()) {
      // Update existing user document
      await updateDoc(newUserRef, userData);
    } else {
      // Create new user document
      await setDoc(newUserRef, userData);
    }

    return true;
  } catch (error) {
    console.error('Error creating migrated user document:', error);
    return false;
  }
};

/**
 * Mark user as migrated (update existing user document)
 */
export const markUserAsMigrated = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      dataMigrated: true,
      migratedAt: Date.now(),
    });
    return true;
  } catch (error) {
    console.error('Error marking user as migrated:', error);
    return false;
  }
};

/**
 * Check if user needs data migration
 * Returns true if user exists in old project but doesn't have dataMigrated flag
 */
export const checkNeedsMigration = async (uid: string, email: string): Promise<{
  needsMigration: boolean;
  oldUid?: string;
}> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return { needsMigration: false };
  }

  try {
    // First check if user already has dataMigrated flag in new project
    const newUserRef = doc(db, 'users', uid);
    const newUserSnap = await getDoc(newUserRef);

    if (newUserSnap.exists()) {
      const userData = newUserSnap.data() as User;
      if (userData.dataMigrated) {
        // Already migrated
        return { needsMigration: false };
      }
    }

    // Check if user exists in old project by querying with email
    // Since we can't query by email without an index, we'll use the uid
    // The old project might have a different uid, so we need to handle this differently

    // For now, if user document exists but no dataMigrated flag, they might need migration
    // The actual migration will verify if old data exists
    if (newUserSnap.exists()) {
      return { needsMigration: false }; // User doc exists, assume they're set up
    }

    return { needsMigration: true };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return { needsMigration: false };
  }
};

/**
 * Check and migrate user data on app load if needed
 * This handles the case where user signed in but data migration failed or was interrupted
 */
export const checkAndMigrateOnAppLoad = async (
  currentUid: string,
  email: string
): Promise<DataMigrationResult | null> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return null;
  }

  try {
    // Check if user document exists in new project
    const newUserRef = doc(db, 'users', currentUid);
    const newUserSnap = await getDoc(newUserRef);

    if (newUserSnap.exists()) {
      const userData = newUserSnap.data() as User;

      // If already migrated, nothing to do
      if (userData.dataMigrated) {
        return null;
      }

      // User exists but not marked as migrated - check if they have team data
      if (userData.teamRef) {
        const teamId = userData.teamRef.id;
        const teamExists = await teamExistsInNewProject(teamId);

        if (teamExists) {
          // Team exists, just mark user as migrated
          await markUserAsMigrated(currentUid);
          return {
            success: true,
            userMigrated: true,
            teamMigrated: false,
            teamAlreadyExisted: true,
          };
        }
      }
    }

    // Try to find user in old project by email (search through users collection)
    // This is a fallback for users who authenticated but didn't complete data migration
    const oldUsersRef = collection(oldDb as Firestore, 'users');
    const oldUsersSnap = await getDocs(oldUsersRef);

    let oldUserData: User | null = null;
    let oldUid: string | null = null;

    for (const userDoc of oldUsersSnap.docs) {
      const data = userDoc.data() as User;
      if (data.email === email) {
        oldUserData = data;
        oldUid = userDoc.id;
        break;
      }
    }

    if (!oldUserData || !oldUid) {
      // No old user found, mark current user as migrated (they're a new user)
      if (newUserSnap.exists()) {
        await markUserAsMigrated(currentUid);
      }
      return null;
    }

    // Found old user data - perform migration
    return await migrateUserData(oldUid, currentUid);
  } catch (error) {
    console.error('Error in checkAndMigrateOnAppLoad:', error);
    return null;
  }
};

/**
 * Build a mapping of old user IDs to new UIDs by checking existing migrated users
 * This helps resolve headCoach references for users who already migrated
 */
const buildOldUserIdToNewUidMap = async (
  teamId: string,
  currentOldUid: string,
  currentNewUid: string
): Promise<Map<string, string>> => {
  const mapping = new Map<string, string>();
  
  // Add the currently migrating user
  mapping.set(currentOldUid, currentNewUid);

  try {
    const oldDb = getOldDb();
    if (!oldDb || !isMigrationEnabled) {
      return mapping;
    }

    // Get all coaches from the old team to find their user IDs
    const oldCoachesRef = collection(oldDb as Firestore, 'teams', teamId, 'coaches');
    const oldCoachesSnap = await getDocs(oldCoachesRef);
    
    const oldUserIds = new Set<string>();
    for (const coachDoc of oldCoachesSnap.docs) {
      const coachData = coachDoc.data();
      const userId = coachData.userId as string | undefined;
      if (userId) {
        oldUserIds.add(userId);
      }
    }

    // For each old user ID, try to find the corresponding new user by email
    // (since we can't directly match UIDs, we match by email)
    const oldUsersRef = collection(oldDb as Firestore, 'users');
    const oldUsersSnap = await getDocs(oldUsersRef);
    
    const oldEmailToOldUid = new Map<string, string>();
    for (const userDoc of oldUsersSnap.docs) {
      const userData = userDoc.data() as User;
      if (oldUserIds.has(userDoc.id)) {
        oldEmailToOldUid.set(userData.email, userDoc.id);
      }
    }

    // Now check new users to find matches by email
    const newUsersRef = collection(db, 'users');
    const newUsersSnap = await getDocs(newUsersRef);
    
    for (const newUserDoc of newUsersSnap.docs) {
      const newUserData = newUserDoc.data() as User;
      if (newUserData.dataMigrated && oldEmailToOldUid.has(newUserData.email)) {
        const oldUid = oldEmailToOldUid.get(newUserData.email)!;
        mapping.set(oldUid, newUserDoc.id);
      }
    }
  } catch (error) {
    console.error('Error building user ID mapping:', error);
  }

  return mapping;
};

/**
 * Main migration orchestrator - migrates user data and team (if needed)
 * Called after successful auth migration
 */
export const migrateUserData = async (
  oldUid: string,
  newUid: string
): Promise<DataMigrationResult> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return {
      success: false,
      userMigrated: false,
      teamMigrated: false,
      teamAlreadyExisted: false,
      error: 'Migration not enabled or old database not available',
    };
  }

  try {
    // Step 1: Get old user document
    const oldUserData = await getOldUserDocument(oldUid);

    if (!oldUserData) {
      return {
        success: false,
        userMigrated: false,
        teamMigrated: false,
        teamAlreadyExisted: false,
        error: 'Old user document not found',
      };
    }

    // Step 2: Extract team ID from user's teamRef
    const teamId = getTeamIdFromRef(oldUserData.teamRef);

    if (!teamId) {
      return {
        success: false,
        userMigrated: false,
        teamMigrated: false,
        teamAlreadyExisted: false,
        error: 'User has no team reference',
      };
    }

    // Step 3: Build mapping of old user IDs to new UIDs (for headCoach resolution)
    const oldUserIdToNewUidMap = await buildOldUserIdToNewUidMap(teamId, oldUid, newUid);

    // Step 4: Check if team already exists in new project
    const teamExists = await teamExistsInNewProject(teamId);

    let teamMigrated = false;
    let subcollectionsCopied: string[] = [];
    let filesCopied = 0;

    // Step 5: Migrate team if it doesn't exist, or update coach record if it does
    if (!teamExists) {
      // Migrate team with all subcollections
      const teamResult = await migrateTeamWithSubcollections(
        teamId,
        oldUid,
        newUid,
        oldUserIdToNewUidMap
      );
      teamMigrated = teamResult.success;
      subcollectionsCopied = teamResult.subcollectionsCopied;
      filesCopied = teamResult.filesCopied;

      if (!teamMigrated) {
        return {
          success: false,
          userMigrated: false,
          teamMigrated: false,
          teamAlreadyExisted: false,
          error: 'Failed to migrate team data',
        };
      }
    } else {
      // Team already exists - update the coach record for this user
      await updateCoachUserIdAfterMigration(teamId, oldUid, newUid);

      // Also check if this user is the headCoach and update the team's headCoach reference if needed
      await updateTeamHeadCoachAfterMigration(teamId, oldUid, newUid);
    }

    // Step 6: Always create/update user document (regardless of team state)
    const userCreated = await createMigratedUserDocument(oldUserData, newUid, teamId);

    if (!userCreated) {
      return {
        success: false,
        userMigrated: false,
        teamMigrated,
        teamAlreadyExisted: teamExists,
        error: 'Failed to create user document',
      };
    }

    return {
      success: true,
      userMigrated: true,
      teamMigrated,
      teamAlreadyExisted: teamExists,
      details: {
        subcollectionsCopied,
        filesCopied,
      },
    };
  } catch (error) {
    console.error('Error in migrateUserData:', error);
    return {
      success: false,
      userMigrated: false,
      teamMigrated: false,
      teamAlreadyExisted: false,
      error: error instanceof Error ? error.message : 'Unknown migration error',
    };
  }
};

/**
 * Progress callback for re-migration
 */
export type ReMigrationProgress = {
  step: string;
  current: number;
  total: number;
  itemName?: string;
};

export type ReMigrationProgressCallback = (progress: ReMigrationProgress) => void;

/**
 * Re-migrate specific subcollections for a user
 * Useful for re-syncing data that may have changed or was corrupted
 */
export const reMigrateUserData = async (
  oldUid: string,
  newUid: string,
  subcollections: string[],
  onProgress?: ReMigrationProgressCallback
): Promise<DataMigrationResult> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return {
      success: false,
      userMigrated: false,
      teamMigrated: false,
      teamAlreadyExisted: false,
      error: 'Migration not enabled or old database not available',
    };
  }

  try {
    // Report progress: Starting
    onProgress?.({
      step: 'Initializing re-migration...',
      current: 0,
      total: subcollections.length,
    });

    // Step 1: Get old user document
    const oldUserData = await getOldUserDocument(oldUid);

    if (!oldUserData) {
      return {
        success: false,
        userMigrated: false,
        teamMigrated: false,
        teamAlreadyExisted: false,
        error: 'Old user document not found',
      };
    }

    // Step 2: Extract team ID
    const teamId = getTeamIdFromRef(oldUserData.teamRef);

    if (!teamId) {
      return {
        success: false,
        userMigrated: false,
        teamMigrated: false,
        teamAlreadyExisted: false,
        error: 'User has no team reference',
      };
    }

    // Step 3: Build user mapping
    const oldUserIdToNewUidMap = await buildOldUserIdToNewUidMap(teamId, oldUid, newUid);

    // Step 4: Re-migrate selected subcollections
    const subcollectionsCopied: string[] = [];
    let totalDocs = 0;

    for (let i = 0; i < subcollections.length; i++) {
      const subcollName = subcollections[i];

      // Report progress: Starting subcollection
      onProgress?.({
        step: `Migrating ${subcollName}...`,
        current: i,
        total: subcollections.length,
        itemName: subcollName,
      });

      try {
        const oldTeamRef = doc(oldDb, 'teams', teamId);
        const oldSubcollRef = collection(oldTeamRef, subcollName);
        const oldSubcollSnapshot = await getDocs(oldSubcollRef);

        // Get new team reference
        const newTeamRef = doc(db, 'teams', teamId);
        const newSubcollRef = collection(newTeamRef, subcollName);

        let docsInSubcoll = 0;
        for (const oldDoc of oldSubcollSnapshot.docs) {
          const docData = oldDoc.data();

          // Transform data if needed (e.g., fix references)
          const transformedData = transformDocumentData(
            docData,
            oldUserIdToNewUidMap,
            subcollName,
            teamId
          );

          // Write to new project (overwrite if exists)
          await setDoc(doc(newSubcollRef, oldDoc.id), transformedData, { merge: true });
          docsInSubcoll++;
        }

        subcollectionsCopied.push(subcollName);
        totalDocs += docsInSubcoll;

        // Report progress: Completed subcollection
        onProgress?.({
          step: `Completed ${subcollName} (${docsInSubcoll} items)`,
          current: i + 1,
          total: subcollections.length,
          itemName: subcollName,
        });
      } catch (error) {
        console.error(`Error re-migrating ${subcollName}:`, error);
        // Continue with other subcollections even if one fails
      }
    }

    // Report final progress
    onProgress?.({
      step: 'Re-migration complete',
      current: subcollections.length,
      total: subcollections.length,
    });

    return {
      success: true,
      userMigrated: false, // User doc not re-created in this operation
      teamMigrated: true,
      teamAlreadyExisted: true,
      details: {
        subcollectionsCopied,
        filesCopied: 0, // Files not re-migrated in this operation
      },
    };
  } catch (error) {
    console.error('Error in reMigrateUserData:', error);
    return {
      success: false,
      userMigrated: false,
      teamMigrated: false,
      teamAlreadyExisted: false,
      error: error instanceof Error ? error.message : 'Unknown re-migration error',
    };
  }
};

/**
 * Get old user UID by email
 * Searches the old Firebase project's users collection to find a user by email
 */
export const getOldUserUidByEmail = async (email: string): Promise<string | null> => {
  const oldDb = getOldDb();
  if (!oldDb || !isMigrationEnabled) {
    return null;
  }

  try {
    const oldUsersRef = collection(oldDb as Firestore, 'users');
    const oldUsersSnap = await getDocs(oldUsersRef);

    for (const userDoc of oldUsersSnap.docs) {
      const userData = userDoc.data() as User;
      if (userData.email === email) {
        return userDoc.id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding old user by email:', error);
    return null;
  }
};
