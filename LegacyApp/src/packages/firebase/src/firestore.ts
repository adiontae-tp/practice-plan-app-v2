import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentReference,
  QueryConstraint,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db, storage } from './config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import type { User, Team, Plan, Tag, Coach, Period, Template, File, Announcement, Folder, FileVersion, FileShare, ShareType, SharePermission } from '@ppa/interfaces';

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Check if a user document exists in Firestore
 */
export const userDocumentExists = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

/**
 * Get user by email (searches all users)
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const snapshot = await getDocs(usersQuery);
    
    if (snapshot.empty) return null;
    
    const userDoc = snapshot.docs[0];
    return {
      ...userDoc.data(),
      uid: userDoc.id,
      ref: userDoc.ref,
      path: userDoc.ref.path,
    } as User;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

/**
 * Get user document by UID
 */
export const getUserByUid = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;

    return {
      ...userDoc.data(),
      uid: userDoc.id,
      ref: userDoc.ref,
      path: userDoc.ref.path,
    } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

/**
 * Create or update user document
 */
export const setUserDoc = async (uid: string, userData: Partial<User>): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      modified: Date.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error setting user:', error);
    throw error;
  }
};

/**
 * Subscribe to user document changes
 */
export const subscribeToUser = (
  uid: string,
  callback: (user: User | null) => void
): (() => void) => {
  return onSnapshot(doc(db, 'users', uid), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({
      ...snapshot.data(),
      uid: snapshot.id,
      ref: snapshot.ref,
      path: snapshot.ref.path,
    } as User);
  });
};

/**
 * Upload a user profile photo and update the user document
 */
export const uploadProfilePhoto = async (
  uid: string,
  file: Blob,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `users/${uid}/profile_${timestamp}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Error uploading profile photo:', error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await setDoc(doc(db, 'users', uid), { photoUrl: url, modified: Date.now() }, { merge: true });
          resolve(url);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

/**
 * Delete the user profile photo
 */
export const deleteProfilePhoto = async (
  uid: string,
  photoUrl: string
): Promise<void> => {
  try {
    const pathMatch = photoUrl.match(/\/o\/(.+?)\?/);
    if (pathMatch) {
      const decodedPath = decodeURIComponent(pathMatch[1]);
      const storageRef = ref(storage, decodedPath);
      await deleteObject(storageRef);
    }
    await setDoc(doc(db, 'users', uid), { photoUrl: null, modified: Date.now() }, { merge: true });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    throw error;
  }
};

/**
 * Update user onboarding status
 */
export interface OnboardingStatus {
  welcomeTourCompleted?: boolean;
  welcomeTourCompletedAt?: number;
  guidedTourCompleted?: boolean;
  guidedTourCompletedAt?: number;
  onboardingSkipped?: boolean;
  onboardingSkippedAt?: number;
}

export const updateUserOnboardingStatus = async (
  uid: string,
  status: OnboardingStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...status,
      modified: Date.now(),
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
};

/**
 * Get user onboarding status
 */
export const getUserOnboardingStatus = async (
  uid: string
): Promise<OnboardingStatus | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      welcomeTourCompleted: data.welcomeTourCompleted,
      welcomeTourCompletedAt: data.welcomeTourCompletedAt,
      guidedTourCompleted: data.guidedTourCompleted,
      guidedTourCompletedAt: data.guidedTourCompletedAt,
      onboardingSkipped: data.onboardingSkipped,
      onboardingSkippedAt: data.onboardingSkippedAt,
    };
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return null;
  }
};

// ============================================================================
// NEW USER/TEAM CREATION
// ============================================================================

export interface CreateUserResult {
  success: boolean;
  teamId?: string;
  coachId?: string;
  error?: string;
}

/**
 * Create a brand new user with a default team ("My Team")
 * This is used for new signups who don't exist in either old or new Firebase projects
 */
export const createNewUserWithTeam = async (
  uid: string,
  email: string,
  fname: string,
  lname: string,
  teamName: string,
  sport: string
): Promise<CreateUserResult> => {
  try {
    const timestamp = Date.now();

    // 1. Create a new team document
    const teamRef = await addDoc(collection(db, 'teams'), {
      name: teamName,
      sport: sport,
      createdAt: timestamp,
      uid: uid,
    });
    const teamId = teamRef.id;

    // 2. Create coach document for the user (as admin)
    // Using userId as document ID for active coaches
    const coachRef = doc(db, 'teams', teamId, 'coaches', uid);
    await setDoc(coachRef, {
      email: email,
      permission: 'admin',
      status: 'active',
      userId: uid,
      joinedAt: timestamp,
    });
    const coachId = uid;

    // 3. Update team with headCoach reference
    await updateDoc(teamRef, {
      headCoach: coachRef,
    });

    // 4. Create user document with teamRef
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid: uid,
      email: email,
      fname: fname,
      lname: lname,
      teamRef: teamRef,
      isAdmin: 'true',
      tpNews: 0,
      entitlement: 0,
      stripeEntitlement: 0,
      created: timestamp,
      modified: timestamp,
      path: `users/${uid}`,
      onboardingCompleted: false, // User needs to complete onboarding
    });
    
    return {
      success: true,
      teamId: teamId,
      coachId: coachId,
    };
  } catch (error) {
    console.error('Error creating new user with team:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user and team',
    };
  }
};

/**
 * Create a default team for an existing user who doesn't have one
 */
export const createDefaultTeam = async (
  userId: string,
  userEmail: string
): Promise<CreateUserResult> => {
  try {
    const timestamp = Date.now();
    
    // 1. Create team
    const teamRef = await addDoc(collection(db, 'teams'), {
      name: 'My Team',
      sport: '',
      createdAt: timestamp,
      uid: userId,
    });
    const teamId = teamRef.id;
    
    // 2. Create coach doc
    // Using userId as document ID for active coaches
    const coachRef = doc(db, 'teams', teamId, 'coaches', userId);
    await setDoc(coachRef, {
      email: userEmail,
      permission: 'admin',
      status: 'active',
      userId: userId,
      joinedAt: timestamp,
    });

    // 3. Update team with headCoach
    await updateDoc(teamRef, {
      headCoach: coachRef,
    });

    // 4. Update user's teamRef
    await updateDoc(doc(db, 'users', userId), {
      teamRef: teamRef,
      modified: timestamp,
    });

    return {
      success: true,
      teamId: teamId,
      coachId: userId,
    };
  } catch (error) {
    console.error('Error creating default team:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create default team',
    };
  }
};

/**
 * Link pending coach invites to a newly signed up user
 * Searches for coach docs with matching email and status 'invited'
 */
export const linkPendingCoachInvites = async (
  userId: string,
  email: string
): Promise<string[]> => {
  const linkedTeamIds: string[] = [];
  
  try {
    // Get all teams
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    
    for (const teamDoc of teamsSnapshot.docs) {
      // Check coaches subcollection for pending invites with matching email
      const coachesQuery = query(
        collection(db, 'teams', teamDoc.id, 'coaches'),
        where('email', '==', email),
        where('status', '==', 'invited')
      );
      
      const coachesSnapshot = await getDocs(coachesQuery);
      
      for (const coachDoc of coachesSnapshot.docs) {
        const invitedCoachData = coachDoc.data();

        // Create new coach doc with userId as document ID
        const newCoachRef = doc(db, 'teams', teamDoc.id, 'coaches', userId);
        await setDoc(newCoachRef, {
          email: invitedCoachData.email,
          permission: invitedCoachData.permission || 'view',
          status: 'active',
          userId: userId,
          invitedAt: invitedCoachData.invitedAt,
          joinedAt: Date.now(),
        });

        // Delete the old invited coach document
        await deleteDoc(coachDoc.ref);

        linkedTeamIds.push(teamDoc.id);
      }
    }
    
    return linkedTeamIds;
  } catch (error) {
    console.error('Error linking pending coach invites:', error);
    return linkedTeamIds;
  }
};

/**
 * Get all teams where a user is a coach (for multi-team support)
 */
export const getTeamsForUser = async (userId: string): Promise<Team[]> => {
  const teams: Team[] = [];
  
  try {
    // Get all teams and check coaches subcollection
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    
    for (const teamDoc of teamsSnapshot.docs) {
      const coachesQuery = query(
        collection(db, 'teams', teamDoc.id, 'coaches'),
        where('userId', '==', userId)
      );
      
      const coachesSnapshot = await getDocs(coachesQuery);
      
      if (!coachesSnapshot.empty) {
        teams.push({
          ...teamDoc.data(),
          id: teamDoc.id,
          ref: teamDoc.ref,
          path: teamDoc.ref.path,
        } as Team);
      }
    }
    
    return teams;
  } catch (error) {
    console.error('Error fetching teams for user:', error);
    return teams;
  }
};

// ============================================================================
// TEAM OPERATIONS
// ============================================================================

/**
 * Get team by reference
 */
export const getTeamByRef = async (teamRef: DocumentReference): Promise<Team | null> => {
  try {
    const teamDoc = await getDoc(teamRef);
    if (!teamDoc.exists()) return null;

    return {
      ...teamDoc.data(),
      id: teamDoc.id,
      ref: teamDoc.ref,
      path: teamDoc.ref.path,
    } as Team;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
};

/**
 * Get team by ID
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) return null;

    return {
      ...teamDoc.data(),
      id: teamDoc.id,
      ref: teamDoc.ref,
      path: teamDoc.ref.path,
    } as Team;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
};

/**
 * Subscribe to team changes
 */
export const subscribeToTeam = (
  teamRef: DocumentReference,
  callback: (team: Team | null) => void
): (() => void) => {
  return onSnapshot(teamRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({
      ...snapshot.data(),
      id: snapshot.id,
      ref: snapshot.ref,
      path: snapshot.ref.path,
    } as Team);
  });
};

/**
 * Update a team
 */
export const updateTeam = async (
  teamId: string,
  updates: Partial<Team>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId), updates);
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

/**
 * Upload a team logo and update the team document
 */
export const uploadTeamLogo = async (
  teamId: string,
  file: Blob,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `teams/${teamId}/logo_${timestamp}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Error uploading team logo:', error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(doc(db, 'teams', teamId), { logoUrl: url });
          resolve(url);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading team logo:', error);
    throw error;
  }
};

/**
 * Delete the team logo
 */
export const deleteTeamLogo = async (
  teamId: string,
  logoUrl: string
): Promise<void> => {
  try {
    // Extract path from download URL
    // Download URLs look like: https://firebasestorage.googleapis.com/v0/b/bucket/o/teams%2FteamId%2Flogo_timestamp?alt=...
    const pathMatch = logoUrl.match(/\/o\/(.+?)\?/);
    if (pathMatch) {
      const decodedPath = decodeURIComponent(pathMatch[1]);
      const storageRef = ref(storage, decodedPath);
      await deleteObject(storageRef);
    }
    await updateDoc(doc(db, 'teams', teamId), { logoUrl: null });
  } catch (error) {
    console.error('Error deleting team logo:', error);
    throw error;
  }
};

/**
 * Upload a custom team font and update the team document
 */
export const uploadTeamFont = async (
  teamId: string,
  file: Blob,
  fontName: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `teams/${teamId}/font_${timestamp}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Error uploading team font:', error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(doc(db, 'teams', teamId), { fontUrl: url, fontName });
          resolve(url);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading team font:', error);
    throw error;
  }
};

/**
 * Delete the team font
 */
export const deleteTeamFont = async (
  teamId: string,
  fontUrl: string
): Promise<void> => {
  try {
    const pathMatch = fontUrl.match(/\/o\/(.+?)\?/);
    if (pathMatch) {
      const decodedPath = decodeURIComponent(pathMatch[1]);
      const storageRef = ref(storage, decodedPath);
      await deleteObject(storageRef);
    }
    await updateDoc(doc(db, 'teams', teamId), { fontUrl: null, fontName: null });
  } catch (error) {
    console.error('Error deleting team font:', error);
    throw error;
  }
};

/**
 * Delete a team and all its subcollections (plans, templates, coaches, etc.)
 * This is a destructive operation that cannot be undone
 */
export const deleteTeam = async (teamId: string): Promise<void> => {
  try {
    const subcollections = ['plans', 'templates', 'coaches', 'tags', 'periods', 'files', 'folders', 'announcements'];
    
    for (const subcol of subcollections) {
      const snapshot = await getDocs(collection(db, 'teams', teamId, subcol));
      const deletePromises = snapshot.docs.map((docSnapshot) => deleteDoc(docSnapshot.ref));
      await Promise.all(deletePromises);
    }
    
    await deleteDoc(doc(db, 'teams', teamId));
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

// ============================================================================
// PLANS OPERATIONS
// ============================================================================

/**
 * Get plans for a team within a date range
 */
export const getPlans = async (
  teamId: string,
  startDate?: number,
  endDate?: number
): Promise<Plan[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    if (startDate) {
      constraints.push(where('startTime', '>=', startDate));
    }
    if (endDate) {
      constraints.push(where('startTime', '<=', endDate));
    }
    constraints.push(orderBy('startTime', 'asc'));

    const plansQuery = query(
      collection(db, 'teams', teamId, 'plans'),
      ...constraints
    );

    const snapshot = await getDocs(plansQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
    })) as Plan[];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
};

/**
 * Get a single plan by ID
 */
export const getPlanById = async (teamId: string, planId: string): Promise<Plan | null> => {
  try {
    const planDoc = await getDoc(doc(db, 'teams', teamId, 'plans', planId));
    if (!planDoc.exists()) return null;

    return {
      ...planDoc.data(),
      id: planDoc.id,
      ref: planDoc.ref,
    } as Plan;
  } catch (error) {
    console.error('Error fetching plan:', error);
    return null;
  }
};

/**
 * Subscribe to plans for a team
 */
export const subscribeToPlans = (
  teamId: string,
  callback: (plans: Plan[]) => void,
  startDate?: number,
  endDate?: number
): (() => void) => {
  const constraints: QueryConstraint[] = [];

  if (startDate) {
    constraints.push(where('startTime', '>=', startDate));
  }
  if (endDate) {
    constraints.push(where('startTime', '<=', endDate));
  }
  constraints.push(orderBy('startTime', 'asc'));

  const plansQuery = query(
    collection(db, 'teams', teamId, 'plans'),
    ...constraints
  );

  return onSnapshot(plansQuery, (snapshot) => {
    const plans = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
    })) as Plan[];
    callback(plans);
  });
};

/**
 * Create a new plan
 */
export const createPlan = async (teamId: string, planData: Omit<Plan, 'id' | 'ref'>): Promise<Plan> => {
  try {
    const docRef = await addDoc(collection(db, 'teams', teamId, 'plans'), planData);
    return {
      ...planData,
      id: docRef.id,
      ref: docRef,
    } as Plan;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
};

/**
 * Update a plan
 */
export const updatePlan = async (
  teamId: string,
  planId: string,
  updates: Partial<Plan>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'plans', planId), updates);
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
};

/**
 * Delete a plan
 */
export const deletePlan = async (teamId: string, planId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teams', teamId, 'plans', planId));
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
};

/**
 * Generate a unique share token for a plan
 */
const generateShareToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Enable sharing for a plan and get/create share token
 */
export const enablePlanSharing = async (
  teamId: string,
  planId: string
): Promise<string> => {
  try {
    const planRef = doc(db, 'teams', teamId, 'plans', planId);
    const planDoc = await getDoc(planRef);
    
    if (!planDoc.exists()) {
      throw new Error('Plan not found');
    }
    
    const planData = planDoc.data();
    
    if (planData.shareToken && planData.shareEnabled) {
      return planData.shareToken;
    }
    
    const shareToken = planData.shareToken || generateShareToken();
    
    await updateDoc(planRef, {
      shareToken,
      shareEnabled: true,
    });
    
    return shareToken;
  } catch (error) {
    console.error('Error enabling plan sharing:', error);
    throw error;
  }
};

/**
 * Disable sharing for a plan
 */
export const disablePlanSharing = async (
  teamId: string,
  planId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'plans', planId), {
      shareEnabled: false,
    });
  } catch (error) {
    console.error('Error disabling plan sharing:', error);
    throw error;
  }
};

/**
 * Get a shared plan by token (for public access)
 * This searches across all teams for the share token
 */
export const getSharedPlanByToken = async (
  shareToken: string
): Promise<{ plan: Plan; team: Team } | null> => {
  try {
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    
    for (const teamDoc of teamsSnapshot.docs) {
      const plansQuery = query(
        collection(db, 'teams', teamDoc.id, 'plans'),
        where('shareToken', '==', shareToken),
        where('shareEnabled', '==', true)
      );
      
      const plansSnapshot = await getDocs(plansQuery);
      
      if (!plansSnapshot.empty) {
        const planDoc = plansSnapshot.docs[0];
        const plan = {
          ...planDoc.data(),
          id: planDoc.id,
          ref: planDoc.ref,
        } as Plan;
        
        const team = {
          ...teamDoc.data(),
          id: teamDoc.id,
          ref: teamDoc.ref,
          path: teamDoc.ref.path,
        } as Team;
        
        return { plan, team };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching shared plan:', error);
    return null;
  }
};

// ============================================================================
// TAGS OPERATIONS
// ============================================================================

/**
 * Get all tags for a team
 */
export const getTags = async (teamId: string): Promise<Tag[]> => {
  try {
    const tagsQuery = query(
      collection(db, 'teams', teamId, 'tags'),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(tagsQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      path: doc.ref.path,
    })) as Tag[];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

/**
 * Subscribe to tags for a team
 */
export const subscribeToTags = (
  teamId: string,
  callback: (tags: Tag[]) => void
): (() => void) => {
  const tagsQuery = query(
    collection(db, 'teams', teamId, 'tags'),
    orderBy('name', 'asc')
  );

  return onSnapshot(tagsQuery, (snapshot) => {
    const tags = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      path: doc.ref.path,
    })) as Tag[];
    callback(tags);
  });
};

/**
 * Create a tag
 */
export const createTag = async (teamId: string, tagData: Omit<Tag, 'id' | 'ref' | 'path'>): Promise<Tag> => {
  try {
    const docRef = await addDoc(collection(db, 'teams', teamId, 'tags'), tagData);
    return {
      ...tagData,
      id: docRef.id,
      ref: docRef,
      path: docRef.path,
    } as Tag;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Update a tag
 */
export const updateTag = async (
  teamId: string,
  tagId: string,
  updates: Partial<Tag>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'tags', tagId), updates);
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (teamId: string, tagId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teams', teamId, 'tags', tagId));
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

// ============================================================================
// COACHES OPERATIONS
// ============================================================================

/**
 * Get all coaches for a team
 */
export const getCoaches = async (teamId: string): Promise<Coach[]> => {
  try {
    const coachesQuery = query(
      collection(db, 'teams', teamId, 'coaches'),
      orderBy('email', 'asc')
    );

    const snapshot = await getDocs(coachesQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
    })) as Coach[];
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return [];
  }
};

/**
 * Subscribe to coaches for a team
 */
export const subscribeToCoaches = (
  teamId: string,
  callback: (coaches: Coach[]) => void
): (() => void) => {
  const coachesQuery = query(
    collection(db, 'teams', teamId, 'coaches'),
    orderBy('email', 'asc')
  );

  return onSnapshot(coachesQuery, (snapshot) => {
    const coaches = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
    })) as Coach[];
    callback(coaches);
  });
};

/**
 * Add a coach
 * For active coaches with userId, uses userId as document ID
 * For invited coaches without userId, uses auto-generated ID
 */
export const addCoach = async (teamId: string, coachData: Omit<Coach, 'id' | 'ref'>): Promise<Coach> => {
  try {
    // If coach has userId and is active, use userId as document ID
    if (coachData.userId && coachData.status === 'active') {
      const docRef = doc(db, 'teams', teamId, 'coaches', coachData.userId);
      await setDoc(docRef, coachData);
      return {
        ...coachData,
        id: coachData.userId,
        ref: docRef,
      } as Coach;
    } else {
      // For invited coaches without userId, use auto-generated ID
      const docRef = await addDoc(collection(db, 'teams', teamId, 'coaches'), coachData);
      return {
        ...coachData,
        id: docRef.id,
        ref: docRef,
      } as Coach;
    }
  } catch (error) {
    console.error('Error adding coach:', error);
    throw error;
  }
};

/**
 * Remove a coach
 */
export const removeCoach = async (teamId: string, coachId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teams', teamId, 'coaches', coachId));
  } catch (error) {
    console.error('Error removing coach:', error);
    throw error;
  }
};

/**
 * Update a coach
 */
export const updateCoach = async (
  teamId: string,
  coachId: string,
  updates: Partial<Coach>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'coaches', coachId), updates);
  } catch (error) {
    console.error('Error updating coach:', error);
    throw error;
  }
};

/**
 * Invite a coach to a team
 * Creates the coach record with 'invited' status and sends an invitation email
 */
export interface InviteCoachParams {
  teamId: string;
  email: string;
  permission: 'admin' | 'edit' | 'view';
  teamName: string;
  inviterName: string;
}

export interface InviteCoachResult {
  coach: Coach;
  emailSent: boolean;
  emailId?: string;
}

export const inviteCoach = async (params: InviteCoachParams): Promise<InviteCoachResult> => {
  const { teamId, email, permission, teamName, inviterName } = params;

  // Import email function dynamically to avoid circular dependencies
  const { sendCoachInviteEmail } = await import('./email');

  try {
    // 1. Create the coach record with 'invited' status
    const coachData: Omit<Coach, 'id' | 'ref'> = {
      email: email.toLowerCase().trim(),
      col: 'coaches',
      permission,
      status: 'invited',
      invitedAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, 'teams', teamId, 'coaches'), coachData);
    const coach: Coach = {
      ...coachData,
      id: docRef.id,
      ref: docRef,
    };

    // 2. Create a pending invite record (for linking when user signs up)
    const normalizedEmail = email.toLowerCase().trim();
    await setDoc(doc(db, 'pending_coach_invites', normalizedEmail), {
      email: normalizedEmail,
      teamId,
      teamName,
      permission,
      invitedAt: Date.now(),
      invitedBy: inviterName,
    }, { merge: true });

    // 3. Send the invitation email
    let emailSent = false;
    let emailId: string | undefined;

    try {
      emailId = await sendCoachInviteEmail({
        recipientEmail: normalizedEmail,
        teamName,
        inviterName,
      });
      emailSent = true;
      console.log(`[inviteCoach] Invitation email queued for ${email}, emailId: ${emailId}`);
    } catch (emailError) {
      // Log but don't fail the whole operation if email fails
      console.error('[inviteCoach] Failed to send invitation email:', emailError);
    }

    return { coach, emailSent, emailId };
  } catch (error) {
    console.error('Error inviting coach:', error);
    throw error;
  }
};

// ============================================================================
// PERIODS (PERIOD TEMPLATES) OPERATIONS
// ============================================================================

/**
 * Get all period templates for a team
 */
export const getPeriods = async (teamId: string): Promise<Period[]> => {
  try {
    const periodsQuery = query(
      collection(db, 'teams', teamId, 'periods'),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(periodsQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
    })) as Period[];
  } catch (error) {
    console.error('Error fetching periods:', error);
    return [];
  }
};

/**
 * Subscribe to periods for a team
 */
export const subscribeToPeriods = (
  teamId: string,
  callback: (periods: Period[]) => void
): (() => void) => {
  const periodsQuery = query(
    collection(db, 'teams', teamId, 'periods'),
    orderBy('name', 'asc')
  );

  return onSnapshot(periodsQuery, (snapshot) => {
    const periods = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
    })) as Period[];
    callback(periods);
  });
};

/**
 * Create a period
 */
export const createPeriod = async (teamId: string, periodData: Omit<Period, 'id' | 'ref'>): Promise<Period> => {
  try {
    const docRef = await addDoc(collection(db, 'teams', teamId, 'periods'), periodData);
    return {
      ...periodData,
      id: docRef.id,
      ref: docRef,
    } as Period;
  } catch (error) {
    console.error('Error creating period:', error);
    throw error;
  }
};

/**
 * Update a period
 */
export const updatePeriod = async (
  teamId: string,
  periodId: string,
  updates: Partial<Period>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'periods', periodId), updates);
  } catch (error) {
    console.error('Error updating period:', error);
    throw error;
  }
};

/**
 * Delete a period
 */
export const deletePeriod = async (teamId: string, periodId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teams', teamId, 'periods', periodId));
  } catch (error) {
    console.error('Error deleting period:', error);
    throw error;
  }
};

// ============================================================================
// TEMPLATES (PRACTICE TEMPLATES) OPERATIONS
// ============================================================================

/**
 * Get all practice templates for a team
 */
export const getTemplates = async (teamId: string): Promise<Template[]> => {
  try {
    const templatesQuery = query(
      collection(db, 'teams', teamId, 'templates'),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(templatesQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
    })) as Template[];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

/**
 * Subscribe to templates for a team
 */
export const subscribeToTemplates = (
  teamId: string,
  callback: (templates: Template[]) => void
): (() => void) => {
  const templatesQuery = query(
    collection(db, 'teams', teamId, 'templates'),
    orderBy('name', 'asc')
  );

  return onSnapshot(templatesQuery, (snapshot) => {
    const templates = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
    })) as Template[];
    callback(templates);
  });
};

/**
 * Create a template
 */
export const createTemplate = async (
  teamId: string,
  templateData: Omit<Template, 'id' | 'ref'>
): Promise<Template> => {
  try {
    const docRef = await addDoc(collection(db, 'teams', teamId, 'templates'), templateData);
    return {
      ...templateData,
      id: docRef.id,
      ref: docRef,
    } as Template;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

/**
 * Update a template
 */
export const updateTemplate = async (
  teamId: string,
  templateId: string,
  updates: Partial<Template>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'templates', templateId), updates);
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

/**
 * Delete a template
 */
export const deleteTemplate = async (teamId: string, templateId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teams', teamId, 'templates', templateId));
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// ============================================================================
// FILES OPERATIONS
// ============================================================================

/**
 * Subscribe to files for a team
 */
export const subscribeToFiles = (
  teamId: string,
  callback: (files: File[]) => void
): (() => void) => {
  const filesQuery = query(
    collection(db, 'teams', teamId, 'files'),
    orderBy('uploadedAt', 'desc')
  );

  return onSnapshot(filesQuery, (snapshot) => {
    const files = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      col: 'files',
    })) as File[];
    callback(files);
  });
};

/**
 * Get all files for a team
 */
export const getFiles = async (teamId: string): Promise<File[]> => {
  try {
    const filesQuery = query(
      collection(db, 'teams', teamId, 'files'),
      orderBy('uploadedAt', 'desc')
    );

    const snapshot = await getDocs(filesQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      col: 'files',
    })) as File[];
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
};

/**
 * Upload a file to Firebase Storage and create Firestore document
 */
export const uploadFile = async (
  teamId: string,
  file: Blob,
  metadata: Omit<File, 'id' | 'ref' | 'col' | 'url' | 'currentVersionId' | 'versionCount'>,
  onProgress?: (progress: number) => void
): Promise<File> => {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${metadata.name}`;
    const storageRef = ref(storage, `teams/${teamId}/files/${filename}`);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Error uploading file:', error);
          reject(error);
        },
        async () => {
          // Get download URL
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          // Create Firestore document
          const fileData = {
            ...metadata,
            url,
            uploadedAt: timestamp,
          };

          const docRef = await addDoc(collection(db, 'teams', teamId, 'files'), fileData);

          resolve({
            ...fileData,
            id: docRef.id,
            ref: docRef,
            col: 'files',
          } as File);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Update file metadata
 */
export const updateFile = async (
  teamId: string,
  fileId: string,
  updates: Partial<File>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'files', fileId), updates);
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
};

/**
 * Delete a file from Storage and Firestore
 */
export const deleteFile = async (teamId: string, fileId: string, fileUrl?: string): Promise<void> => {
  try {
    // Delete from Firestore first
    await deleteDoc(doc(db, 'teams', teamId, 'files', fileId));

    // If URL provided, attempt to delete from Storage
    if (fileUrl) {
      try {
        const storageRef = ref(storage, fileUrl);
        await deleteObject(storageRef);
      } catch (storageError) {
        // Log but don't fail if storage deletion fails
        console.warn('Could not delete file from storage:', storageError);
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get storage usage for a team
 */
export const getStorageUsage = async (teamId: string): Promise<number> => {
  try {
    const filesQuery = query(collection(db, 'teams', teamId, 'files'));
    const snapshot = await getDocs(filesQuery);
    let totalBytes = 0;
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.size) totalBytes += data.size;
    });
    return totalBytes;
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return 0;
  }
};

// ============================================================================
// FOLDERS OPERATIONS
// ============================================================================

/**
 * Subscribe to folders for a team
 */
export const subscribeToFolders = (
  teamId: string,
  callback: (folders: Folder[]) => void
): (() => void) => {
  const foldersQuery = query(
    collection(db, 'teams', teamId, 'folders'),
    orderBy('name', 'asc')
  );

  return onSnapshot(foldersQuery, (snapshot) => {
    const folders = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      col: 'folders',
    })) as Folder[];
    callback(folders);
  });
};

/**
 * Get all folders for a team
 */
export const getFolders = async (teamId: string): Promise<Folder[]> => {
  try {
    const foldersQuery = query(
      collection(db, 'teams', teamId, 'folders'),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(foldersQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      col: 'folders',
    })) as Folder[];
  } catch (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
};

/**
 * Create a folder
 */
export const createFolder = async (
  teamId: string,
  folderData: Omit<Folder, 'id' | 'ref' | 'col' | 'updatedAt'>
): Promise<Folder> => {
  try {
    const docRef = await addDoc(collection(db, 'teams', teamId, 'folders'), {
      ...folderData,
      createdAt: Date.now(),
    });
    return {
      ...folderData,
      id: docRef.id,
      ref: docRef,
      col: 'folders',
    } as Folder;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

/**
 * Update a folder
 */
export const updateFolder = async (
  teamId: string,
  folderId: string,
  updates: Partial<Pick<Folder, 'name' | 'parentId'>>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'folders', folderId), {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

/**
 * Delete a folder (and optionally its contents)
 */
export const deleteFolder = async (teamId: string, folderId: string): Promise<void> => {
  try {
    // Move files in this folder to root
    const filesQuery = query(
      collection(db, 'teams', teamId, 'files'),
      where('folderId', '==', folderId)
    );
    const filesSnapshot = await getDocs(filesQuery);
    const updatePromises = filesSnapshot.docs.map((fileDoc) =>
      updateDoc(fileDoc.ref, { folderId: null })
    );
    await Promise.all(updatePromises);

    // Move subfolders to root
    const subfoldersQuery = query(
      collection(db, 'teams', teamId, 'folders'),
      where('parentId', '==', folderId)
    );
    const subfoldersSnapshot = await getDocs(subfoldersQuery);
    const subfolderPromises = subfoldersSnapshot.docs.map((folderDoc) =>
      updateDoc(folderDoc.ref, { parentId: null })
    );
    await Promise.all(subfolderPromises);

    // Delete the folder
    await deleteDoc(doc(db, 'teams', teamId, 'folders', folderId));
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

// ============================================================================
// FILE VERSIONS OPERATIONS
// ============================================================================

/**
 * Get all versions for a file
 */
export const getFileVersions = async (teamId: string, fileId: string): Promise<FileVersion[]> => {
  try {
    const versionsQuery = query(
      collection(db, 'teams', teamId, 'files', fileId, 'versions'),
      orderBy('versionNumber', 'desc')
    );

    const snapshot = await getDocs(versionsQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      col: 'versions',
      fileId,
    })) as FileVersion[];
  } catch (error) {
    console.error('Error fetching file versions:', error);
    return [];
  }
};

/**
 * Upload a new version of a file
 */
export const uploadFileVersion = async (
  teamId: string,
  fileId: string,
  fileBlob: Blob,
  note?: string,
  onProgress?: (progress: number) => void
): Promise<FileVersion> => {
  try {
    // Get current version count
    const fileDoc = await getDoc(doc(db, 'teams', teamId, 'files', fileId));
    if (!fileDoc.exists()) throw new Error('File not found');
    
    const fileData = fileDoc.data() as File;
    const newVersionNumber = (fileData.versionCount || 0) + 1;
    
    const timestamp = Date.now();
    const filename = `${timestamp}_v${newVersionNumber}_${fileData.name}`;
    const storageRef = ref(storage, `teams/${teamId}/files/${fileId}/versions/${filename}`);

    const uploadTask = uploadBytesResumable(storageRef, fileBlob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Error uploading file version:', error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          const versionData = {
            fileId,
            versionNumber: newVersionNumber,
            url,
            size: fileBlob.size,
            uploadedAt: timestamp,
            uploadedBy: fileData.uploadedBy,
            note,
          };

          const versionRef = await addDoc(
            collection(db, 'teams', teamId, 'files', fileId, 'versions'),
            versionData
          );

          // Update file with new version info
          await updateDoc(doc(db, 'teams', teamId, 'files', fileId), {
            url,
            size: fileBlob.size,
            currentVersionId: versionRef.id,
            versionCount: newVersionNumber,
          });

          resolve({
            ...versionData,
            id: versionRef.id,
            ref: versionRef,
            col: 'versions',
          } as FileVersion);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file version:', error);
    throw error;
  }
};

/**
 * Restore a previous version of a file
 */
export const restoreFileVersion = async (
  teamId: string,
  fileId: string,
  versionId: string
): Promise<void> => {
  try {
    const versionDoc = await getDoc(doc(db, 'teams', teamId, 'files', fileId, 'versions', versionId));
    if (!versionDoc.exists()) throw new Error('Version not found');

    const versionData = versionDoc.data() as FileVersion;

    await updateDoc(doc(db, 'teams', teamId, 'files', fileId), {
      url: versionData.url,
      size: versionData.size,
      currentVersionId: versionId,
    });
  } catch (error) {
    console.error('Error restoring file version:', error);
    throw error;
  }
};

/**
 * Delete a file version
 */
export const deleteFileVersion = async (
  teamId: string,
  fileId: string,
  versionId: string
): Promise<void> => {
  try {
    const versionDoc = await getDoc(doc(db, 'teams', teamId, 'files', fileId, 'versions', versionId));
    if (versionDoc.exists()) {
      const versionData = versionDoc.data();
      // Try to delete from storage
      if (versionData.url) {
        try {
          const storageRef = ref(storage, versionData.url);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn('Could not delete version file from storage:', storageError);
        }
      }
    }

    await deleteDoc(doc(db, 'teams', teamId, 'files', fileId, 'versions', versionId));
  } catch (error) {
    console.error('Error deleting file version:', error);
    throw error;
  }
};

// ============================================================================
// FILE SHARES OPERATIONS
// ============================================================================

/**
 * Get all shares for a file
 */
export const getFileShares = async (teamId: string, fileId: string): Promise<FileShare[]> => {
  try {
    const sharesQuery = query(
      collection(db, 'teams', teamId, 'files', fileId, 'shares'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(sharesQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      col: 'shares',
      fileId,
    })) as FileShare[];
  } catch (error) {
    console.error('Error fetching file shares:', error);
    return [];
  }
};

/**
 * Create a file share
 */
export const createFileShare = async (
  teamId: string,
  fileId: string,
  shareData: {
    type: ShareType;
    targetId?: string;
    targetEmail?: string;
    permission: SharePermission;
    expiresAt?: number;
    password?: string;
  }
): Promise<FileShare> => {
  try {
    const timestamp = Date.now();
    const data = {
      ...shareData,
      fileId,
      accessCount: 0,
      createdAt: timestamp,
      createdBy: shareData.targetId || 'system',
    };

    const docRef = await addDoc(collection(db, 'teams', teamId, 'files', fileId, 'shares'), data);
    return {
      ...data,
      id: docRef.id,
      ref: docRef,
      col: 'shares',
    } as FileShare;
  } catch (error) {
    console.error('Error creating file share:', error);
    throw error;
  }
};

/**
 * Update a file share
 */
export const updateFileShare = async (
  teamId: string,
  fileId: string,
  shareId: string,
  updates: Partial<Pick<FileShare, 'permission' | 'expiresAt' | 'password'>>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'files', fileId, 'shares', shareId), updates);
  } catch (error) {
    console.error('Error updating file share:', error);
    throw error;
  }
};

/**
 * Delete a file share
 */
export const deleteFileShare = async (teamId: string, fileId: string, shareId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teams', teamId, 'files', fileId, 'shares', shareId));
  } catch (error) {
    console.error('Error deleting file share:', error);
    throw error;
  }
};

/**
 * Increment share access count
 */
export const incrementShareAccess = async (teamId: string, fileId: string, shareId: string): Promise<void> => {
  try {
    const shareRef = doc(db, 'teams', teamId, 'files', fileId, 'shares', shareId);
    const shareDoc = await getDoc(shareRef);
    if (shareDoc.exists()) {
      const currentCount = shareDoc.data().accessCount || 0;
      await updateDoc(shareRef, { accessCount: currentCount + 1 });
    }
  } catch (error) {
    console.error('Error incrementing share access:', error);
    throw error;
  }
};

/**
 * Get share by ID (for public access validation)
 */
export const getShareById = async (
  teamId: string,
  fileId: string,
  shareId: string
): Promise<FileShare | null> => {
  try {
    const shareDoc = await getDoc(doc(db, 'teams', teamId, 'files', fileId, 'shares', shareId));
    if (!shareDoc.exists()) return null;
    
    return {
      ...shareDoc.data(),
      id: shareDoc.id,
      ref: shareDoc.ref,
      col: 'shares',
      fileId,
    } as FileShare;
  } catch (error) {
    console.error('Error fetching share:', error);
    return null;
  }
};

// ============================================================================
// ANNOUNCEMENTS OPERATIONS
// ============================================================================

/**
 * Subscribe to announcements for a team
 */
export const subscribeToAnnouncements = (
  teamId: string,
  callback: (announcements: Announcement[]) => void
): (() => void) => {
  const announcementsQuery = query(
    collection(db, 'teams', teamId, 'announcements'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(announcementsQuery, (snapshot) => {
    const announcements = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      col: 'announcements',
    })) as Announcement[];
    callback(announcements);
  });
};

/**
 * Get all announcements for a team
 */
export const getAnnouncements = async (teamId: string): Promise<Announcement[]> => {
  try {
    const announcementsQuery = query(
      collection(db, 'teams', teamId, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(announcementsQuery);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      ref: doc.ref,
      col: 'announcements',
    })) as Announcement[];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

/**
 * Create an announcement
 */
export const createAnnouncement = async (
  teamId: string,
  announcementData: Omit<Announcement, 'id' | 'ref' | 'col'>
): Promise<Announcement> => {
  try {
    const docRef = await addDoc(collection(db, 'teams', teamId, 'announcements'), announcementData);
    return {
      ...announcementData,
      id: docRef.id,
      ref: docRef,
      col: 'announcements',
    } as Announcement;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

/**
 * Update an announcement
 */
export const updateAnnouncement = async (
  teamId: string,
  announcementId: string,
  updates: Partial<Announcement>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'teams', teamId, 'announcements', announcementId), updates);
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

/**
 * Delete an announcement
 */
export const deleteAnnouncement = async (teamId: string, announcementId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teams', teamId, 'announcements', announcementId));
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

/**
 * Mark announcement as read by a user
 */
export const markAnnouncementRead = async (
  teamId: string,
  announcementId: string,
  userId: string
): Promise<void> => {
  try {
    const announcementRef = doc(db, 'teams', teamId, 'announcements', announcementId);
    const announcementDoc = await getDoc(announcementRef);

    if (announcementDoc.exists()) {
      const readBy = announcementDoc.data().readBy || [];
      if (!readBy.includes(userId)) {
        await updateDoc(announcementRef, {
          readBy: [...readBy, userId],
        });
      }
    }
  } catch (error) {
    console.error('Error marking announcement as read:', error);
    throw error;
  }
};
