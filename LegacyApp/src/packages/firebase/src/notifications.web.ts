import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db, firebaseConfig } from './config';
import type { NotificationOptions } from '@ppa/interfaces';

let messagingInstance: Messaging | null = null;

/**
 * Clean up old service worker registration
 * Removes the old static service worker at /firebase-messaging-sw.js
 */
const cleanupOldServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      // Unregister old static service worker
      if (registration.active?.scriptURL.includes('/firebase-messaging-sw.js')) {
        await registration.unregister();
        console.log('[FCM] Unregistered old service worker');
      }
    }
  } catch (error) {
    console.warn('[FCM] Error cleaning up old service worker:', error);
  }
};

const getMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  if (messagingInstance) return messagingInstance;

  try {
    const { getMessaging: getFirebaseMessaging, isSupported } = await import('firebase/messaging');
    const { default: app } = await import('./config');
    
    const supported = await isSupported();
    if (!supported) {
      console.warn('[FCM] Firebase Messaging not supported in this browser');
      return null;
    }

    messagingInstance = getFirebaseMessaging(app);
    return messagingInstance;
  } catch (error) {
    console.error('[FCM] Error initializing messaging:', error);
    return null;
  }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  if (!('Notification' in window)) {
    console.warn('[FCM] Notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('[FCM] Error requesting permissions:', error);
    return false;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const messaging = await getMessaging();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('[FCM] VAPID key not configured. Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to .env.local');
      console.warn('[FCM] See docs/FCM_SETUP.md for setup instructions');
      return null;
    }

    // Clean up old service worker if it exists
    await cleanupOldServiceWorker();

    // Register service worker from API route (has Firebase config injected)
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw');
    
    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      console.log('[FCM] Token retrieved successfully');
      return currentToken;
    } else {
      console.warn('[FCM] No registration token available');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error getting token:', error);
    return null;
  }
};

export const getExpoPushToken = async (): Promise<string | null> => {
  return getFCMToken();
};

export const updateUserPushToken = async (userId: string, token: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
      fcmTokenUpdatedAt: Date.now(),
      modified: Date.now(),
    });
    console.log('[FCM] Token saved to user profile');
  } catch (error) {
    console.error('[FCM] Error updating push token:', error);
    throw error;
  }
};

export const updateNotificationPreferences = async (
  userId: string,
  preferences: { pushEnabled?: boolean; emailEnabled?: boolean }
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...preferences,
      modified: Date.now(),
    });
  } catch (error) {
    console.error('[FCM] Error updating notification preferences:', error);
    throw error;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void): (() => void) => {
  let unsubscribe: (() => void) | null = null;

  getMessaging().then((messaging) => {
    if (messaging) {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message received:', payload);
        callback(payload);
      });
    }
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
};

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> => {
  console.log('[FCM] sendPushNotification called - requires backend implementation');
  console.log('[FCM] Token:', fcmToken.substring(0, 20) + '...');
  console.log('[FCM] Title:', title);
  console.log('[FCM] Body:', body);
};

export interface TeamMember {
  uid: string;
  email: string;
  fcmToken?: string;
  expoPushToken?: string;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
}

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    const coachesSnapshot = await getDocs(collection(db, 'teams', teamId, 'coaches'));
    const members: TeamMember[] = [];

    for (const coachDoc of coachesSnapshot.docs) {
      const coachData = coachDoc.data();
      
      let userFcmToken: string | undefined;
      let userExpoPushToken: string | undefined;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', coachDoc.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userFcmToken = userData.fcmToken;
          userExpoPushToken = userData.expoPushToken;
        }
      } catch {
      }

      members.push({
        uid: coachDoc.id,
        email: coachData.email || '',
        fcmToken: userFcmToken,
        expoPushToken: userExpoPushToken || coachData.expoPushToken,
        pushEnabled: coachData.pushEnabled !== false,
        emailEnabled: coachData.emailEnabled !== false,
      });
    }

    return members;
  } catch (error) {
    console.error('[FCM] Error fetching team members:', error);
    return [];
  }
};

export const sendAnnouncementNotifications = async (
  teamId: string,
  announcementId: string,
  title: string,
  message: string,
  options: NotificationOptions
): Promise<{ pushSent: number; emailSent: number }> => {
  const result = { pushSent: 0, emailSent: 0 };

  try {
    const members = await getTeamMembers(teamId);

    if (options.sendPush) {
      for (const member of members) {
        if (member.pushEnabled === false) continue;

        if (member.expoPushToken) {
          try {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: member.expoPushToken,
                sound: 'default',
                title,
                body: message,
                data: { announcementId, type: 'announcement' },
              }),
            });
            if (response.ok) result.pushSent++;
          } catch (error) {
            console.error(`[FCM] Failed to send Expo push to ${member.uid}:`, error);
          }
        }

        if (member.fcmToken) {
          console.log(`[FCM] Would send FCM to ${member.uid} (requires Cloud Function)`);
        }
      }
    }

    if (options.sendEmail) {
      const emailRecipients = members
        .filter((member) => member.email && member.emailEnabled !== false)
        .map((member) => member.email);

      if (emailRecipients.length > 0) {
        result.emailSent = emailRecipients.length;
        console.log('[FCM] Email notifications queued for:', emailRecipients);
      }
    }

    return result;
  } catch (error) {
    console.error('[FCM] Error sending announcement notifications:', error);
    return result;
  }
};

export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[FCM] Notification permissions not granted');
      return null;
    }

    const token = await getFCMToken();
    if (token) {
      await updateUserPushToken(userId, token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('[FCM] Error registering for push notifications:', error);
    return null;
  }
};

export const initializeMessaging = async (userId?: string): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const messaging = await getMessaging();
    if (!messaging) return;

    console.log('[FCM] Messaging initialized successfully');

    if (Notification.permission === 'granted' && userId) {
      const token = await getFCMToken();
      if (token) {
        await updateUserPushToken(userId, token);
        console.log('[FCM] Push notifications enabled for user');
      }
    } else if (Notification.permission === 'default') {
      console.log('[FCM] Notification permission not granted yet. User can enable in Profile settings.');
    }

    onForegroundMessage((payload) => {
      if (Notification.permission === 'granted' && payload.notification) {
        new Notification(payload.notification.title || 'New Announcement', {
          body: payload.notification.body,
          icon: '/logo.png',
          tag: payload.data?.announcementId || 'announcement',
        });
      }
    });
  } catch (error) {
    console.error('[FCM] Error initializing messaging:', error);
  }
};

interface NotificationResponse {
  notification: {
    request: {
      content: {
        data?: Record<string, unknown>;
      };
    };
  };
}

export const addNotificationReceivedListener = (
  callback: (notification: any) => void
): { remove: () => void } => {
  return { remove: () => {} };
};

export const addNotificationResponseListener = (
  callback: (response: NotificationResponse) => void
): { remove: () => void } => {
  return { remove: () => {} };
};

export const getLastNotificationResponse = (): Promise<NotificationResponse | null> => {
  return Promise.resolve(null);
};
