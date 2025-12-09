import * as admin from 'firebase-admin';
import { onDocumentWritten, onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for all functions
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Team statistics - aggregated counts of all team resources
 */
interface TeamStats {
  memberCount: number;
  coachCount: number;
  planCount: number;
  periodCount: number;
  templateCount: number;
  tagCount: number;
  fileCount: number;
  folderCount: number;
  announcementCount: number;
  lastUpdated: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
}

/**
 * Team member record stored in teams/{teamId}/members/{uid}
 */
interface TeamMember {
  uid: string;
  email: string;
  fname: string;
  lname: string;
  photoUrl?: string;
  joinedAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  lastSeen?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  entitlement?: number;
}

/**
 * User's team snapshot stored in users/{uid}/teams/{teamId}
 */
interface UserTeamSnapshot {
  teamId: string;
  teamName: string;
  sport: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  role?: string;
  stats: TeamStats;
  lastSynced: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
}

/**
 * Entitlement IDs from RevenueCat (must match your RevenueCat configuration)
 */
const ENTITLEMENT_IDS = {
  HEAD_COACH: 'Head Coach',
  ORGANIZATION: 'organization',
} as const;

/**
 * Map entitlement to numeric level
 * 0 = free, 1 = coach, 2 = organization
 */
function getEntitlementLevel(activeEntitlements: Record<string, unknown>): number {
  if (activeEntitlements[ENTITLEMENT_IDS.ORGANIZATION]) {
    return 2;
  }
  if (activeEntitlements[ENTITLEMENT_IDS.HEAD_COACH]) {
    return 1;
  }
  return 0;
}

/**
 * Map entitlement level to tier name
 */
function getTierName(entitlement: number): string {
  switch (entitlement) {
    case 2:
      return 'organization';
    case 1:
      return 'coach';
    default:
      return 'free';
  }
}

/**
 * Syncs RevenueCat entitlement data to the main user document
 *
 * Triggered when the RevenueCat extension writes/updates data in:
 * users/{userId}/revenuecat/{docId}
 *
 * Updates the parent user document with:
 * - entitlement: number (0, 1, 2)
 * - subscriptionTier: string ('free', 'coach', 'organization')
 * - subscriptionLastVerified: timestamp
 * - subscriptionSource: 'revenuecat'
 */
export const syncEntitlementToUserDoc = onDocumentWritten(
  'users/{userId}/revenuecat/{docId}',
  async (event) => {
    const { userId, docId } = event.params;

    console.log(`[syncEntitlement] Triggered for user: ${userId}, doc: ${docId}`);

    // Get the after data (current state)
    const afterData = event.data?.after.data();

    // Handle deletion - reset to free tier
    if (!afterData) {
      console.log(`[syncEntitlement] Document deleted, resetting user to free tier`);

      await admin.firestore().doc(`users/${userId}`).update({
        entitlement: 0,
        subscriptionTier: 'free',
        subscriptionLastVerified: Date.now(),
        subscriptionSource: 'revenuecat',
      });

      return;
    }

    // Extract active entitlements from RevenueCat data
    // The structure depends on how RevenueCat extension stores data
    const activeEntitlements = afterData.entitlements?.active ||
                               afterData.activeEntitlements ||
                               {};

    console.log(`[syncEntitlement] Active entitlements:`, JSON.stringify(activeEntitlements));

    // Calculate entitlement level
    const entitlement = getEntitlementLevel(activeEntitlements);
    const subscriptionTier = getTierName(entitlement);

    console.log(`[syncEntitlement] Calculated entitlement: ${entitlement} (${subscriptionTier})`);

    // Update the main user document
    try {
      await admin.firestore().doc(`users/${userId}`).update({
        entitlement,
        subscriptionTier,
        subscriptionLastVerified: Date.now(),
        subscriptionSource: 'revenuecat',
      });

      console.log(`[syncEntitlement] Successfully updated user ${userId} to entitlement ${entitlement}`);
    } catch (error) {
      console.error(`[syncEntitlement] Failed to update user ${userId}:`, error);
      throw error;
    }
  }
);

/**
 * Optional: Sync on RevenueCat events collection
 * This provides additional redundancy by also listening to purchase events
 */
export const syncEntitlementFromEvent = onDocumentWritten(
  'revenuecat_events/{eventId}',
  async (event) => {
    const eventData = event.data?.after.data();

    if (!eventData) {
      console.log('[syncFromEvent] Event deleted, skipping');
      return;
    }

    const appUserId = eventData.app_user_id;

    if (!appUserId) {
      console.log('[syncFromEvent] No app_user_id in event, skipping');
      return;
    }

    console.log(`[syncFromEvent] Processing event for user: ${appUserId}, type: ${eventData.type}`);

    // Only process relevant event types
    const relevantEvents = [
      'INITIAL_PURCHASE',
      'RENEWAL',
      'PRODUCT_CHANGE',
      'CANCELLATION',
      'UNCANCELLATION',
      'EXPIRATION',
      'BILLING_ISSUE',
    ];

    if (!relevantEvents.includes(eventData.type)) {
      console.log(`[syncFromEvent] Skipping irrelevant event type: ${eventData.type}`);
      return;
    }

    // Get current entitlements from the user's revenuecat subcollection
    try {
      const revenueCatDocs = await admin.firestore()
        .collection(`users/${appUserId}/revenuecat`)
        .limit(1)
        .get();

      if (revenueCatDocs.empty) {
        console.log(`[syncFromEvent] No revenuecat data found for user ${appUserId}`);
        return;
      }

      const rcData = revenueCatDocs.docs[0].data();
      const activeEntitlements = rcData.entitlements?.active ||
                                  rcData.activeEntitlements ||
                                  {};

      const entitlement = getEntitlementLevel(activeEntitlements);
      const subscriptionTier = getTierName(entitlement);

      await admin.firestore().doc(`users/${appUserId}`).update({
        entitlement,
        subscriptionTier,
        subscriptionLastVerified: Date.now(),
        subscriptionSource: 'revenuecat',
      });

      console.log(`[syncFromEvent] Updated user ${appUserId} to entitlement ${entitlement}`);
    } catch (error) {
      console.error(`[syncFromEvent] Failed to update user ${appUserId}:`, error);
    }
  }
);

// ============================================================================
// TEAM <-> USER SYNC FUNCTIONS
// ============================================================================

const db = admin.firestore();

/**
 * Helper: Get collection count for a team subcollection
 */
async function getCollectionCount(teamId: string, collectionName: string): Promise<number> {
  const snapshot = await db.collection(`teams/${teamId}/${collectionName}`).count().get();
  return snapshot.data().count;
}

/**
 * Helper: Calculate and return all team stats
 */
async function calculateTeamStats(teamId: string): Promise<Omit<TeamStats, 'lastUpdated'>> {
  const [
    memberCount,
    coachCount,
    planCount,
    periodCount,
    templateCount,
    tagCount,
    fileCount,
    folderCount,
    announcementCount,
  ] = await Promise.all([
    getCollectionCount(teamId, 'members'),
    getCollectionCount(teamId, 'coaches'),
    getCollectionCount(teamId, 'plans'),
    getCollectionCount(teamId, 'periods'),
    getCollectionCount(teamId, 'templates'),
    getCollectionCount(teamId, 'tags'),
    getCollectionCount(teamId, 'files'),
    getCollectionCount(teamId, 'folders'),
    getCollectionCount(teamId, 'announcements'),
  ]);

  return {
    memberCount,
    coachCount,
    planCount,
    periodCount,
    templateCount,
    tagCount,
    fileCount,
    folderCount,
    announcementCount,
  };
}

/**
 * Helper: Update team document with current stats
 */
async function updateTeamStats(teamId: string): Promise<TeamStats> {
  const stats = await calculateTeamStats(teamId);
  const fullStats: TeamStats = {
    ...stats,
    lastUpdated: FieldValue.serverTimestamp(),
  };

  await db.doc(`teams/${teamId}`).update({ stats: fullStats });
  console.log(`[updateTeamStats] Updated stats for team ${teamId}:`, stats);

  return fullStats;
}

/**
 * Helper: Sync team snapshot to a user's subcollection
 */
async function syncUserTeamSnapshot(userId: string, teamId: string): Promise<void> {
  // Get team document
  const teamDoc = await db.doc(`teams/${teamId}`).get();

  if (!teamDoc.exists) {
    console.log(`[syncUserTeamSnapshot] Team ${teamId} not found`);
    return;
  }

  const teamData = teamDoc.data();
  if (!teamData) return;

  // Get or calculate stats
  let stats = teamData.stats;
  if (!stats) {
    stats = await calculateTeamStats(teamId);
  }

  // Get user's role from coaches collection
  const coachDoc = await db.doc(`teams/${teamId}/coaches/${userId}`).get();
  const role = coachDoc.exists ? coachDoc.data()?.permission : 'member';

  const snapshot: UserTeamSnapshot = {
    teamId,
    teamName: teamData.name || '',
    sport: teamData.sport || '',
    logoUrl: teamData.logoUrl,
    primaryColor: teamData.primaryColor,
    secondaryColor: teamData.secondaryColor,
    role,
    stats,
    lastSynced: FieldValue.serverTimestamp(),
  };

  await db.doc(`users/${userId}/teams/${teamId}`).set(snapshot, { merge: true });
  console.log(`[syncUserTeamSnapshot] Synced team ${teamId} to user ${userId}`);
}

/**
 * Helper: Add user to team's members subcollection
 */
async function addUserToTeamMembers(userId: string, teamId: string): Promise<void> {
  // Get user document
  const userDoc = await db.doc(`users/${userId}`).get();

  if (!userDoc.exists) {
    console.log(`[addUserToTeamMembers] User ${userId} not found`);
    return;
  }

  const userData = userDoc.data();
  if (!userData) return;

  const member: TeamMember = {
    uid: userId,
    email: userData.email || '',
    fname: userData.fname || '',
    lname: userData.lname || '',
    joinedAt: FieldValue.serverTimestamp(),
    entitlement: userData.entitlement || 0,
  };

  // Only include photoUrl if it exists (Firestore doesn't allow undefined)
  if (userData.photoUrl) {
    member.photoUrl = userData.photoUrl;
  }

  await db.doc(`teams/${teamId}/members/${userId}`).set(member, { merge: true });
  console.log(`[addUserToTeamMembers] Added user ${userId} to team ${teamId}`);
}

/**
 * Helper: Remove user from team's members subcollection
 */
async function removeUserFromTeamMembers(userId: string, teamId: string): Promise<void> {
  await db.doc(`teams/${teamId}/members/${userId}`).delete();
  console.log(`[removeUserFromTeamMembers] Removed user ${userId} from team ${teamId}`);
}

/**
 * Helper: Remove team snapshot from user's subcollection
 */
async function removeUserTeamSnapshot(userId: string, teamId: string): Promise<void> {
  await db.doc(`users/${userId}/teams/${teamId}`).delete();
  console.log(`[removeUserTeamSnapshot] Removed team ${teamId} from user ${userId}`);
}

/**
 * Helper: Get head coach UID from a team document
 */
async function getHeadCoachUid(teamId: string): Promise<string | null> {
  try {
    const teamDoc = await db.doc(`teams/${teamId}`).get();

    if (!teamDoc.exists) {
      console.warn(`[getHeadCoachUid] Team ${teamId} not found`);
      return null;
    }

    const teamData = teamDoc.data();
    if (!teamData) {
      console.warn(`[getHeadCoachUid] Team ${teamId} has no data`);
      return null;
    }

    const headCoachRef = teamData.headCoach;
    if (!headCoachRef) {
      console.warn(`[getHeadCoachUid] Team ${teamId} has no headCoach field`);
      return null;
    }

    // Extract UID from DocumentReference
    // headCoachRef can have either .id or .path property
    const uid = headCoachRef.id || headCoachRef.path?.split('/').pop();

    if (!uid) {
      console.warn(`[getHeadCoachUid] Could not extract UID from headCoach reference for team ${teamId}`);
      return null;
    }

    return uid;
  } catch (error) {
    console.error(`[getHeadCoachUid] Error getting head coach for team ${teamId}:`, error);
    return null;
  }
}

// ============================================================================
// USER DOCUMENT TRIGGERS
// ============================================================================

/**
 * When a user's teamRef changes, sync the user to the team's members
 * and sync the team data to the user's teams subcollection
 */
export const onUserTeamRefChange = onDocumentWritten(
  'users/{userId}',
  async (event) => {
    const { userId } = event.params;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // Handle deletion
    if (!afterData) {
      // User deleted - this is handled by deleteUserAccount function
      // We don't need to do anything here as the deletion function handles all cleanup
      console.log(`[onUserTeamRefChange] User ${userId} document deleted - cleanup handled by deleteUserAccount`);
      return;
    }

    // Extract team IDs
    const oldTeamId = beforeData?.teamRef?.id || beforeData?.teamRef?.path?.split('/').pop();
    const newTeamId = afterData?.teamRef?.id || afterData?.teamRef?.path?.split('/').pop();

    // Check if teamRef changed
    if (oldTeamId === newTeamId) {
      // TeamRef didn't change - check if user profile changed
      const profileChanged =
        beforeData?.fname !== afterData?.fname ||
        beforeData?.lname !== afterData?.lname ||
        beforeData?.email !== afterData?.email ||
        beforeData?.photoUrl !== afterData?.photoUrl ||
        beforeData?.entitlement !== afterData?.entitlement;

      if (profileChanged && newTeamId) {
        // Update user info in team's members
        await addUserToTeamMembers(userId, newTeamId);
      }
      return;
    }

    console.log(`[onUserTeamRefChange] User ${userId} team changed: ${oldTeamId} -> ${newTeamId}`);

    // Remove from old team
    if (oldTeamId) {
      await removeUserFromTeamMembers(userId, oldTeamId);
      await removeUserTeamSnapshot(userId, oldTeamId);
      // Update old team stats
      await updateTeamStats(oldTeamId).catch(e =>
        console.error(`[onUserTeamRefChange] Failed to update old team stats:`, e)
      );
    }

    // Add to new team
    if (newTeamId) {
      await addUserToTeamMembers(userId, newTeamId);

      // Only sync team snapshot if user is the head coach
      const headCoachUid = await getHeadCoachUid(newTeamId);
      if (headCoachUid === userId) {
        await syncUserTeamSnapshot(userId, newTeamId);
        console.log(`[onUserTeamRefChange] Synced team snapshot to head coach ${userId}`);
      } else {
        console.log(`[onUserTeamRefChange] User ${userId} is not head coach, skipping snapshot sync`);
      }

      // Update new team stats
      await updateTeamStats(newTeamId).catch(e =>
        console.error(`[onUserTeamRefChange] Failed to update new team stats:`, e)
      );
    }
  }
);

// ============================================================================
// TEAM DOCUMENT TRIGGERS
// ============================================================================

/**
 * When a team document is updated, sync changes to all members
 */
export const onTeamUpdate = onDocumentWritten(
  'teams/{teamId}',
  async (event) => {
    const { teamId } = event.params;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // Handle deletion - clean up head coach snapshot
    if (!afterData) {
      console.log(`[onTeamUpdate] Team ${teamId} deleted, cleaning up head coach snapshot`);

      // Extract head coach UID from beforeData (afterData is null on deletion)
      const headCoachRef = beforeData?.headCoach;
      if (headCoachRef) {
        const headCoachUid = headCoachRef.id || headCoachRef.path?.split('/').pop();
        if (headCoachUid) {
          await db.doc(`users/${headCoachUid}/teams/${teamId}`).delete().catch(e =>
            console.error(`[onTeamUpdate] Failed to delete snapshot for head coach ${headCoachUid}:`, e)
          );
        }
      }

      return;
    }

    // Check if relevant team info changed
    const teamInfoChanged =
      beforeData?.name !== afterData?.name ||
      beforeData?.sport !== afterData?.sport ||
      beforeData?.logoUrl !== afterData?.logoUrl ||
      beforeData?.primaryColor !== afterData?.primaryColor ||
      beforeData?.secondaryColor !== afterData?.secondaryColor;

    if (!teamInfoChanged) {
      return;
    }

    console.log(`[onTeamUpdate] Team ${teamId} info changed, syncing to head coach`);

    // Get head coach UID
    const headCoachUid = await getHeadCoachUid(teamId);

    if (!headCoachUid) {
      console.warn(`[onTeamUpdate] No valid head coach for team ${teamId}, skipping sync`);
      return;
    }

    // Sync only to head coach
    await syncUserTeamSnapshot(headCoachUid, teamId).catch(e =>
      console.error(`[onTeamUpdate] Failed to sync to head coach ${headCoachUid}:`, e)
    );
  }
);

// ============================================================================
// TEAM SUBCOLLECTION TRIGGERS - Stats Updates
// ============================================================================

/**
 * Generic handler for team subcollection changes
 * Updates team stats when documents are added/removed
 */
async function handleTeamSubcollectionChange(
  teamId: string,
  collectionName: string,
  operation: 'create' | 'delete'
): Promise<void> {
  console.log(`[handleTeamSubcollectionChange] ${operation} in ${collectionName} for team ${teamId}`);

  // Update team stats
  const stats = await updateTeamStats(teamId);

  // Sync updated stats to head coach only
  const headCoachUid = await getHeadCoachUid(teamId);

  if (!headCoachUid) {
    console.warn(`[handleTeamSubcollectionChange] No valid head coach for team ${teamId}, skipping stats sync`);
    return;
  }

  // Update head coach's team snapshot
  await db.doc(`users/${headCoachUid}/teams/${teamId}`).update({
    stats,
    lastSynced: FieldValue.serverTimestamp(),
  }).catch(e =>
    console.error(`[handleTeamSubcollectionChange] Failed to update stats for head coach ${headCoachUid}:`, e)
  );
}

// Plans
export const onPlanCreated = onDocumentCreated(
  'teams/{teamId}/plans/{planId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'plans', 'create')
);

export const onPlanDeleted = onDocumentDeleted(
  'teams/{teamId}/plans/{planId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'plans', 'delete')
);

// Periods
export const onPeriodCreated = onDocumentCreated(
  'teams/{teamId}/periods/{periodId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'periods', 'create')
);

export const onPeriodDeleted = onDocumentDeleted(
  'teams/{teamId}/periods/{periodId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'periods', 'delete')
);

// Templates
export const onTemplateCreated = onDocumentCreated(
  'teams/{teamId}/templates/{templateId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'templates', 'create')
);

export const onTemplateDeleted = onDocumentDeleted(
  'teams/{teamId}/templates/{templateId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'templates', 'delete')
);

// Tags
export const onTagCreated = onDocumentCreated(
  'teams/{teamId}/tags/{tagId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'tags', 'create')
);

export const onTagDeleted = onDocumentDeleted(
  'teams/{teamId}/tags/{tagId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'tags', 'delete')
);

// Coaches
export const onCoachCreated = onDocumentCreated(
  'teams/{teamId}/coaches/{coachId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'coaches', 'create')
);

export const onCoachDeleted = onDocumentDeleted(
  'teams/{teamId}/coaches/{coachId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'coaches', 'delete')
);

// Files
export const onFileCreated = onDocumentCreated(
  'teams/{teamId}/files/{fileId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'files', 'create')
);

export const onFileDeleted = onDocumentDeleted(
  'teams/{teamId}/files/{fileId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'files', 'delete')
);

// Folders
export const onFolderCreated = onDocumentCreated(
  'teams/{teamId}/folders/{folderId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'folders', 'create')
);

export const onFolderDeleted = onDocumentDeleted(
  'teams/{teamId}/folders/{folderId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'folders', 'delete')
);

// Announcements
export const onAnnouncementCreated = onDocumentCreated(
  'teams/{teamId}/announcements/{announcementId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'announcements', 'create')
);

export const onAnnouncementDeleted = onDocumentDeleted(
  'teams/{teamId}/announcements/{announcementId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'announcements', 'delete')
);

// Members (for member count)
export const onMemberCreated = onDocumentCreated(
  'teams/{teamId}/members/{memberId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'members', 'create')
);

export const onMemberDeleted = onDocumentDeleted(
  'teams/{teamId}/members/{memberId}',
  async (event) => handleTeamSubcollectionChange(event.params.teamId, 'members', 'delete')
);

// ============================================================================
// FCM NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Team member with push notification details
 */
interface NotificationRecipient {
  uid: string;
  email: string;
  fcmToken?: string;
  expoPushToken?: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

/**
 * Helper: Get all team members with their notification preferences and tokens
 */
async function getNotificationRecipients(teamId: string): Promise<NotificationRecipient[]> {
  const recipients: NotificationRecipient[] = [];

  // Get coaches from team subcollection
  const coachesSnapshot = await db.collection(`teams/${teamId}/coaches`).get();

  for (const coachDoc of coachesSnapshot.docs) {
    const coachData = coachDoc.data();
    const userId = coachDoc.id;

    // Get user's FCM token from their user document
    let fcmToken: string | undefined;
    let expoPushToken: string | undefined;

    try {
      const userDoc = await db.doc(`users/${userId}`).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        fcmToken = userData?.fcmToken;
        expoPushToken = userData?.expoPushToken;
      }
    } catch (error) {
      console.warn(`[getNotificationRecipients] Could not fetch user ${userId}:`, error);
    }

    recipients.push({
      uid: userId,
      email: coachData.email || '',
      fcmToken,
      expoPushToken: expoPushToken || coachData.expoPushToken,
      pushEnabled: coachData.pushEnabled !== false, // Default to true
      emailEnabled: coachData.emailEnabled !== false, // Default to true
    });
  }

  return recipients;
}

/**
 * Helper: Send FCM notification to a single token
 */
async function sendFCMToToken(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<boolean> {
  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        notification: {
          icon: '/logo.png',
          badge: '/logo.png',
        },
        fcmOptions: {
          link: `/announcements?id=${data.announcementId}`,
        },
      },
      android: {
        priority: 'high',
        notification: {
          icon: 'ic_notification',
          color: '#356793',
          clickAction: 'OPEN_ANNOUNCEMENT',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    });
    return true;
  } catch (error: unknown) {
    const errorCode = (error as { code?: string })?.code;
    // Handle invalid/expired tokens
    if (errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered') {
      console.log(`[sendFCMToToken] Invalid/expired token, should be removed from user`);
    } else {
      console.error('[sendFCMToToken] Error sending FCM:', error);
    }
    return false;
  }
}

/**
 * Helper: Send Expo push notification
 */
async function sendExpoPush(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<boolean> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
      }),
    });

    if (!response.ok) {
      console.error('[sendExpoPush] API returned error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[sendExpoPush] Error:', error);
    return false;
  }
}

/**
 * Helper: Send email via Firestore Send Email extension
 * Adds a document to the mail collection which triggers the extension
 */
async function sendEmailViaExtension(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    const recipients = Array.isArray(to) ? to : [to];
    const emailDoc = {
      to: recipients,
      bcc: 'adiontae.gerron@gmail.com', // Always BCC admin
      message: {
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
      },
    };

    await db.collection('mail').add(emailDoc);
    console.log(`[sendEmailViaExtension] Queued email to ${recipients.length} recipient(s)`);
    return true;
  } catch (error) {
    console.error('[sendEmailViaExtension] Error:', error);
    return false;
  }
}

/**
 * Callable function to send FCM notifications for an announcement
 * Called from the web/mobile app after creating an announcement
 */
export const sendAnnouncementNotifications = onCall(
  { maxInstances: 10 },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated to send notifications');
    }

    const { teamId, announcementId, title, body, sendPush, sendEmail } = request.data as {
      teamId: string;
      announcementId: string;
      title: string;
      body: string;
      sendPush: boolean;
      sendEmail: boolean;
    };

    if (!teamId || !announcementId || !title) {
      throw new HttpsError('invalid-argument', 'Missing required fields: teamId, announcementId, title');
    }

    console.log(`[sendAnnouncementNotifications] Sending for announcement ${announcementId} in team ${teamId}`);
    console.log(`[sendAnnouncementNotifications] Options: push=${sendPush}, email=${sendEmail}`);

    const results = {
      fcmSent: 0,
      fcmFailed: 0,
      expoSent: 0,
      expoFailed: 0,
      emailQueued: 0,
    };

    // Get all team members with their tokens
    const recipients = await getNotificationRecipients(teamId);
    console.log(`[sendAnnouncementNotifications] Found ${recipients.length} recipients`);

    // Filter out the sender (they don't need a notification about their own announcement)
    const notificationRecipients = recipients.filter(r => r.uid !== request.auth?.uid);

    const notificationData = {
      announcementId,
      teamId,
      type: 'announcement',
    };

    if (sendPush) {
      for (const recipient of notificationRecipients) {
        if (!recipient.pushEnabled) {
          console.log(`[sendAnnouncementNotifications] Skipping ${recipient.uid} - push disabled`);
          continue;
        }

        // Send via FCM (web users)
        if (recipient.fcmToken) {
          const success = await sendFCMToToken(recipient.fcmToken, title, body, notificationData);
          if (success) {
            results.fcmSent++;
          } else {
            results.fcmFailed++;
          }
        }

        // Send via Expo (mobile users)
        if (recipient.expoPushToken) {
          const success = await sendExpoPush(recipient.expoPushToken, title, body, notificationData);
          if (success) {
            results.expoSent++;
          } else {
            results.expoFailed++;
          }
        }
      }
    }

    if (sendEmail) {
      const emailRecipients = notificationRecipients.filter(r => r.email && r.emailEnabled);
      
      if (emailRecipients.length > 0) {
        // Get announcement data for priority
        const announcementDoc = await db.doc(`teams/${teamId}/announcements/${announcementId}`).get();
        const announcementData = announcementDoc.exists ? announcementDoc.data() : null;
        
        // Get team name for email
        const teamDoc = await db.doc(`teams/${teamId}`).get();
        const teamName = teamDoc.exists ? teamDoc.data()?.name || 'Your Team' : 'Your Team';
        
        // Get sender name
        const senderDoc = await db.doc(`users/${request.auth?.uid}`).get();
        const senderData = senderDoc.exists ? senderDoc.data() : null;
        const senderName = senderData 
          ? `${senderData.fname || ''} ${senderData.lname || ''}`.trim() || 'A team member'
          : 'A team member';

        // Create email content
        const priority = announcementData?.priority || 'normal';
        const priorityBadge = priority === 'urgent'
          ? '<span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">URGENT</span>'
          : priority === 'high'
          ? '<span style="background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">IMPORTANT</span>'
          : '';

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="margin-bottom: 16px;">
              ${priorityBadge}
            </div>
            <h1 style="color: #356793; margin-bottom: 8px; font-size: 24px;">${title}</h1>
            <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
              From ${senderName} • ${teamName}
            </p>
            <div style="font-size: 16px; line-height: 1.6; color: #333;">
              ${body.replace(/\n/g, '<br />')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
            <p style="font-size: 12px; color: #999;">
              This announcement was sent via Practice Plan. Open the app to view and respond.
            </p>
          </div>
        `;

        const emailText = `
${priority === 'urgent' ? '[URGENT] ' : priority === 'high' ? '[Important] ' : ''}${title}

From ${senderName} • ${teamName}

${body}

---
This announcement was sent via Practice Plan. Open the app to view and respond.
        `.trim();

        const emailSubject = `${priority === 'urgent' ? '[URGENT] ' : priority === 'high' ? '[Important] ' : ''}${teamName}: ${title}`;
        const recipientEmails = emailRecipients.map(r => r.email);

        const success = await sendEmailViaExtension(
          recipientEmails,
          emailSubject,
          emailHtml,
          emailText
        );

        if (success) {
          results.emailQueued = emailRecipients.length;
        } else {
          console.error(`[sendAnnouncementNotifications] Failed to queue emails`);
        }
      }
    }

    // Update the announcement document to mark notifications as sent
    await db.doc(`teams/${teamId}/announcements/${announcementId}`).update({
      notificationsSent: true,
      notificationResults: results,
      notificationsSentAt: FieldValue.serverTimestamp(),
    });

    console.log(`[sendAnnouncementNotifications] Results:`, results);

    return results;
  }
);

/**
 * Firestore trigger: Automatically send notifications when an announcement is created
 * Only sends if notificationOptions.sendPush or notificationOptions.sendEmail is true
 */
export const onAnnouncementCreatedSendNotifications = onDocumentCreated(
  'teams/{teamId}/announcements/{announcementId}',
  async (event) => {
    const { teamId, announcementId } = event.params;
    const data = event.data?.data();

    if (!data) {
      console.log('[onAnnouncementCreatedSendNotifications] No data in created announcement');
      return;
    }

    // Check if notifications should be sent
    const options = data.notificationOptions as { sendPush?: boolean; sendEmail?: boolean } | undefined;
    if (!options?.sendPush && !options?.sendEmail) {
      console.log('[onAnnouncementCreatedSendNotifications] No notifications requested for this announcement');
      return;
    }

    // Don't re-send if already sent (prevents duplicate notifications on retries)
    if (data.notificationsSent) {
      console.log('[onAnnouncementCreatedSendNotifications] Notifications already sent');
      return;
    }

    console.log(`[onAnnouncementCreatedSendNotifications] Processing announcement ${announcementId}`);

    const results = {
      fcmSent: 0,
      fcmFailed: 0,
      expoSent: 0,
      expoFailed: 0,
      emailQueued: 0,
    };

    const recipients = await getNotificationRecipients(teamId);

    // Filter out the creator
    const creatorId = data.createdBy;
    const notificationRecipients = recipients.filter(r => r.uid !== creatorId);

    const title = data.title || 'New Announcement';
    const body = data.message || '';
    const notificationData = {
      announcementId,
      teamId,
      type: 'announcement',
    };

    if (options?.sendPush) {
      for (const recipient of notificationRecipients) {
        if (!recipient.pushEnabled) continue;

        if (recipient.fcmToken) {
          const success = await sendFCMToToken(recipient.fcmToken, title, body, notificationData);
          if (success) results.fcmSent++;
          else results.fcmFailed++;
        }

        if (recipient.expoPushToken) {
          const success = await sendExpoPush(recipient.expoPushToken, title, body, notificationData);
          if (success) results.expoSent++;
          else results.expoFailed++;
        }
      }
    }

    if (options?.sendEmail) {
      const emailRecipients = notificationRecipients.filter(r => r.email && r.emailEnabled);
      
      if (emailRecipients.length > 0) {
        // Get team name for email
        const teamDoc = await db.doc(`teams/${teamId}`).get();
        const teamName = teamDoc.exists ? teamDoc.data()?.name || 'Your Team' : 'Your Team';
        
        // Get sender name
        const senderDoc = await db.doc(`users/${creatorId}`).get();
        const senderData = senderDoc.exists ? senderDoc.data() : null;
        const senderName = senderData 
          ? `${senderData.fname || ''} ${senderData.lname || ''}`.trim() || 'A team member'
          : 'A team member';

        // Create email content
        const priority = data.priority || 'normal';
        const priorityBadge = priority === 'urgent'
          ? '<span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">URGENT</span>'
          : priority === 'high'
          ? '<span style="background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">IMPORTANT</span>'
          : '';

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="margin-bottom: 16px;">
              ${priorityBadge}
            </div>
            <h1 style="color: #356793; margin-bottom: 8px; font-size: 24px;">${title}</h1>
            <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
              From ${senderName} • ${teamName}
            </p>
            <div style="font-size: 16px; line-height: 1.6; color: #333;">
              ${body.replace(/\n/g, '<br />')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
            <p style="font-size: 12px; color: #999;">
              This announcement was sent via Practice Plan. Open the app to view and respond.
            </p>
          </div>
        `;

        const emailText = `
${priority === 'urgent' ? '[URGENT] ' : priority === 'high' ? '[Important] ' : ''}${title}

From ${senderName} • ${teamName}

${body}

---
This announcement was sent via Practice Plan. Open the app to view and respond.
        `.trim();

        const emailSubject = `${priority === 'urgent' ? '[URGENT] ' : priority === 'high' ? '[Important] ' : ''}${teamName}: ${title}`;
        const recipientEmails = emailRecipients.map(r => r.email);

        const success = await sendEmailViaExtension(
          recipientEmails,
          emailSubject,
          emailHtml,
          emailText
        );

        if (success) {
          results.emailQueued = emailRecipients.length;
        } else {
          console.error(`[onAnnouncementCreatedSendNotifications] Failed to queue emails`);
        }
      }
    }

    // Mark notifications as sent
    await db.doc(`teams/${teamId}/announcements/${announcementId}`).update({
      notificationsSent: true,
      notificationResults: results,
      notificationsSentAt: FieldValue.serverTimestamp(),
    });

    console.log(`[onAnnouncementCreatedSendNotifications] Completed. Results:`, results);
  }
);

// ============================================================================
// ACCOUNT DELETION
// ============================================================================

/**
 * Callable function to delete a user account
 * Deletes Firebase Auth user, Firestore user document, and cleans up all related data
 */
export const deleteUserAccount = onCall(
  { 
    maxInstances: 10,
    timeoutSeconds: 540, // 9 minutes (max for 2nd gen functions)
    memory: '512MiB',
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated to delete account');
    }

    const userId = request.auth.uid;
    const deleteReason = (request.data as { reason?: string })?.reason || '';
    console.log(`[deleteUserAccount] Processing account deletion for user ${userId}`);
    if (deleteReason) {
      console.log(`[deleteUserAccount] Deletion reason: ${deleteReason}`);
    }

    try {
      // 1. Get user document to find all teams they belong to
      const userDoc = await db.doc(`users/${userId}`).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User document not found');
      }

      const userData = userDoc.data();
      const userTeamRef = userData?.teamRef;

      // 2. Get all teams where user is a member (from user's teams subcollection)
      // This subcollection is synced by Cloud Functions and contains all teams the user belongs to
      const teamIds = new Set<string>();
      
      // Add primary team from teamRef
      if (userTeamRef) {
        const teamId = userTeamRef.id || userTeamRef.path?.split('/').pop();
        if (teamId) teamIds.add(teamId);
      }

      // Get all teams from user's teams subcollection (store snapshot for later deletion)
      const userTeamsSnapshot = await db.collection(`users/${userId}/teams`).get();
      userTeamsSnapshot.docs.forEach(doc => {
        const teamId = doc.data()?.teamId;
        if (teamId) teamIds.add(teamId);
      });

      console.log(`[deleteUserAccount] Found ${teamIds.size} teams to clean up`);

      // 3. Remove user from all teams
      for (const teamId of teamIds) {
        try {
          // Remove from coaches
          try {
            const coachDoc = await db.doc(`teams/${teamId}/coaches/${userId}`).get();
            if (coachDoc.exists) {
              await coachDoc.ref.delete();
            }
          } catch (coachError: any) {
            console.error(`[deleteUserAccount] Error removing coach from team ${teamId}:`, coachError);
            // Continue
          }

          // Remove from members (handle case where document might not exist)
          try {
            const memberDoc = await db.doc(`teams/${teamId}/members/${userId}`).get();
            if (memberDoc.exists) {
              await memberDoc.ref.delete();
            }
          } catch (memberError: any) {
            // Ignore if document doesn't exist
            if (memberError.code !== 'not-found') {
              console.error(`[deleteUserAccount] Error removing from members:`, memberError);
            }
          }

          // Remove team snapshot from user (handle case where document might not exist)
          try {
            const teamSnapshotDoc = await db.doc(`users/${userId}/teams/${teamId}`).get();
            if (teamSnapshotDoc.exists) {
              await teamSnapshotDoc.ref.delete();
            }
          } catch (snapshotError: any) {
            // Ignore if document doesn't exist
            if (snapshotError.code !== 'not-found') {
              console.error(`[deleteUserAccount] Error removing team snapshot:`, snapshotError);
            }
          }

          // Check if team should be deleted (no coaches left)
          try {
            const coachesSnapshot = await db.collection(`teams/${teamId}/coaches`).get();
            if (coachesSnapshot.empty) {
              console.log(`[deleteUserAccount] Team ${teamId} has no coaches, deleting team`);
              // Delete all team subcollections first (in batches to avoid limits)
              const subcollections = ['plans', 'periods', 'templates', 'tags', 'files', 'folders', 'announcements', 'members'];
              for (const subcol of subcollections) {
                try {
                  const subcolSnapshot = await db.collection(`teams/${teamId}/${subcol}`).get();
                  if (subcolSnapshot.empty) {
                    console.log(`[deleteUserAccount] Subcollection ${subcol} is empty, skipping`);
                    continue;
                  }
                  // Firestore batch limit is 500 operations
                  const batchSize = 500;
                  for (let i = 0; i < subcolSnapshot.docs.length; i += batchSize) {
                    const batch = db.batch();
                    const docsToDelete = subcolSnapshot.docs.slice(i, i + batchSize);
                    docsToDelete.forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                    console.log(`[deleteUserAccount] Deleted batch ${i / batchSize + 1} of ${subcol} (${docsToDelete.length} docs)`);
                  }
                } catch (subcolError: any) {
                  console.error(`[deleteUserAccount] Error deleting subcollection ${subcol}:`, subcolError);
                  console.error(`[deleteUserAccount] Subcol error code:`, subcolError.code);
                  console.error(`[deleteUserAccount] Subcol error message:`, subcolError.message);
                  // Continue with other subcollections
                }
              }
              // Delete team document
              try {
                await db.doc(`teams/${teamId}`).delete();
                console.log(`[deleteUserAccount] Successfully deleted team ${teamId}`);
              } catch (teamDeleteError: any) {
                console.error(`[deleteUserAccount] Error deleting team document:`, teamDeleteError);
                // Don't throw - continue with other teams
              }
            } else {
              // Update team stats
              await updateTeamStats(teamId).catch(e =>
                console.error(`[deleteUserAccount] Failed to update team stats:`, e)
              );
            }
          } catch (coachesError: any) {
            console.error(`[deleteUserAccount] Error checking coaches for team ${teamId}:`, coachesError);
            // Continue with other teams
          }
        } catch (teamError) {
          console.error(`[deleteUserAccount] Error cleaning up team ${teamId}:`, teamError);
          // Continue with other teams
        }
      }

      // 4. Delete pending coach invites for this email
      if (userData?.email) {
        try {
          const normalizedEmail = userData.email.toLowerCase().trim();
          const inviteDoc = await db.doc(`pending_coach_invites/${normalizedEmail}`).get();
          if (inviteDoc.exists) {
            await inviteDoc.ref.delete();
          }
        } catch (inviteError) {
          console.error('[deleteUserAccount] Error deleting pending invites:', inviteError);
        }
      }

      // 5. Delete user's teams subcollection (use stored snapshot)
      if (userTeamsSnapshot.docs.length > 0) {
        try {
          // Firestore batch limit is 500 operations
          const batchSize = 500;
          for (let i = 0; i < userTeamsSnapshot.docs.length; i += batchSize) {
            const batch = db.batch();
            const docsToDelete = userTeamsSnapshot.docs.slice(i, i + batchSize);
            docsToDelete.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          }
        } catch (teamsError) {
          console.error('[deleteUserAccount] Error deleting user teams subcollection:', teamsError);
          // Continue - user document deletion is more important
        }
      }

      // 6. Delete user document
      // Note: We've already cleaned up all team memberships manually above,
      // so the onUserTeamRefChange trigger won't need to do anything
      try {
        await db.doc(`users/${userId}`).delete();
        console.log(`[deleteUserAccount] Successfully deleted user document ${userId}`);
      } catch (userDocError: any) {
        console.error('[deleteUserAccount] Error deleting user document:', userDocError);
        console.error('[deleteUserAccount] User doc error code:', userDocError.code);
        console.error('[deleteUserAccount] User doc error message:', userDocError.message);
        // If user doc deletion fails, we should still try to delete auth user
        // but log the error
        const errorMsg = userDocError.message || 'Unknown error deleting user document';
        throw new HttpsError('internal', `Failed to delete user document: ${errorMsg}`);
      }

      // 7. Delete Firebase Auth user
      try {
        await admin.auth().deleteUser(userId);
        console.log(`[deleteUserAccount] Successfully deleted Firebase Auth user ${userId}`);
      } catch (authError: any) {
        console.error('[deleteUserAccount] Error deleting Firebase Auth user:', authError);
        // Don't throw - Firestore cleanup is more important
      }

      // 8. Send email notification to admin
      try {
        const userEmail = userData?.email || 'Unknown';
        const userName = userData?.fname && userData?.lname
          ? `${userData.fname} ${userData.lname}`.trim()
          : 'Unknown User';
        const teamCount = teamIds.size;

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626; margin-bottom: 8px; font-size: 24px;">Account Deleted</h1>
            <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
              A user account has been permanently deleted from Practice Plan.
            </p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h2 style="font-size: 16px; color: #111827; margin: 0 0 12px 0;">Account Details</h2>
              <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr>
                  <td style="padding: 4px 0; font-weight: 500;">User ID:</td>
                  <td style="padding: 4px 0;">${userId}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 500;">Name:</td>
                  <td style="padding: 4px 0;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 500;">Email:</td>
                  <td style="padding: 4px 0;">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 500;">Teams:</td>
                  <td style="padding: 4px 0;">${teamCount} team(s) affected</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 500;">Deleted At:</td>
                  <td style="padding: 4px 0;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</td>
                </tr>
              </table>
            </div>
            ${deleteReason ? `
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h2 style="font-size: 16px; color: #92400e; margin: 0 0 8px 0;">Deletion Reason</h2>
              <p style="font-size: 14px; color: #78350f; margin: 0; white-space: pre-wrap;">${deleteReason}</p>
            </div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
            <p style="font-size: 12px; color: #999;">
              This is an automated notification from Practice Plan.
            </p>
          </div>
        `;

        const emailText = `
Account Deleted - Practice Plan

A user account has been permanently deleted.

Account Details:
- User ID: ${userId}
- Name: ${userName}
- Email: ${userEmail}
- Teams: ${teamCount} team(s) affected
- Deleted At: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
${deleteReason ? `
Deletion Reason:
${deleteReason}
` : ''}
---
This is an automated notification from Practice Plan.
        `.trim();

        await sendEmailViaExtension(
          'adiontae.gerron@gmail.com',
          'Account Deleted - Practice Plan',
          emailHtml,
          emailText
        );

        console.log(`[deleteUserAccount] Sent deletion notification email for user ${userId}`);
      } catch (emailError) {
        // Don't fail the deletion if email fails
        console.error('[deleteUserAccount] Error sending deletion notification email:', emailError);
      }

      console.log(`[deleteUserAccount] Successfully deleted account for user ${userId}`);
      return { success: true };
    } catch (error: any) {
      console.error('[deleteUserAccount] Error:', error);
      console.error('[deleteUserAccount] Error type:', typeof error);
      console.error('[deleteUserAccount] Error constructor:', error?.constructor?.name);
      console.error('[deleteUserAccount] Error stack:', error.stack);
      console.error('[deleteUserAccount] Error code:', error.code);
      console.error('[deleteUserAccount] Error message:', error.message);
      console.error('[deleteUserAccount] Error details:', error.details);
      
      // If it's already an HttpsError, re-throw it
      if (error instanceof HttpsError) {
        console.error('[deleteUserAccount] Re-throwing HttpsError:', error.code, error.message);
        throw error;
      }
      
      // Extract error information
      const errorMessage = error.message || error.toString() || 'Unknown error occurred';
      const errorCode = error.code || 'unknown';
      
      // Check for common Firestore errors
      if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        throw new HttpsError('permission-denied', 'Permission denied. Please check your account permissions.');
      }
      if (error.code === 'not-found' || error.code === 'NOT_FOUND') {
        throw new HttpsError('not-found', 'Some resources were not found during deletion.');
      }
      if (error.code === 'deadline-exceeded' || error.code === 'DEADLINE_EXCEEDED' || error.message?.includes('timeout')) {
        throw new HttpsError('deadline-exceeded', 'Operation timed out. Please try again.');
      }
      
      // For other errors, include more details in the message
      // Make sure the message is descriptive
      const detailedMessage = errorMessage.includes('Failed to delete account') 
        ? errorMessage 
        : `Failed to delete account: ${errorMessage} (code: ${errorCode})`;
      
      console.error('[deleteUserAccount] Throwing HttpsError with message:', detailedMessage);
      throw new HttpsError('internal', detailedMessage);
    }
  }
);
