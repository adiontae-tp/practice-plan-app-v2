/**
 * Native mobile notification implementation using expo-notifications
 *
 * Requires a development build - won't work in Expo Go
 * Run `npx expo prebuild` and build with EAS or locally
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from './config';
import type { NotificationOptions } from '@ppa/interfaces';
import Constants from 'expo-constants';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications only work on physical devices');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#356793',
      });
    }

    return true;
  } catch (error) {
    console.error('[Notifications] Error requesting permissions:', error);
    return false;
  }
};

/**
 * Get Expo push token for this device
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.warn('[Notifications] Push tokens only available on physical devices');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn('[Notifications] EAS project ID not configured');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('[Notifications] Expo push token retrieved:', token.data.substring(0, 20) + '...');
    return token.data;
  } catch (error) {
    console.error('[Notifications] Error getting push token:', error);
    return null;
  }
};

/**
 * Save Expo push token to user's Firestore document
 */
export const updateUserPushToken = async (userId: string, token: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      expoPushToken: token,
      expoPushTokenUpdatedAt: Date.now(),
      modified: Date.now(),
    });
    console.log('[Notifications] Token saved to user profile');
  } catch (error) {
    console.error('[Notifications] Error updating push token:', error);
    throw error;
  }
};

/**
 * Update user's notification preferences
 */
export const updateNotificationPreferences = async (
  userId: string,
  preferences: { pushEnabled?: boolean; emailEnabled?: boolean }
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...preferences,
      modified: Date.now(),
    });
    console.log('[Notifications] Preferences updated');
  } catch (error) {
    console.error('[Notifications] Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Send a push notification (for testing purposes)
 * In production, notifications are sent via Cloud Functions
 */
export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> => {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
      }),
    });
    console.log('[Notifications] Push notification sent');
  } catch (error) {
    console.error('[Notifications] Error sending push notification:', error);
    throw error;
  }
};

/**
 * Team member interface for notifications
 */
export interface TeamMember {
  uid: string;
  email: string;
  expoPushToken?: string;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
}

/**
 * Get team members with their notification preferences
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    const coachesSnapshot = await getDocs(collection(db, 'teams', teamId, 'coaches'));
    const members: TeamMember[] = [];

    for (const coachDoc of coachesSnapshot.docs) {
      const coachData = coachDoc.data();

      let userExpoPushToken: string | undefined;

      try {
        const userDoc = await getDoc(doc(db, 'users', coachDoc.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userExpoPushToken = userData.expoPushToken;
        }
      } catch (error) {
        console.warn('[Notifications] Could not fetch user data:', error);
      }

      members.push({
        uid: coachDoc.id,
        email: coachData.email || '',
        expoPushToken: userExpoPushToken || coachData.expoPushToken,
        pushEnabled: coachData.pushEnabled !== false,
        emailEnabled: coachData.emailEnabled !== false,
      });
    }

    return members;
  } catch (error) {
    console.error('[Notifications] Error fetching team members:', error);
    return [];
  }
};

/**
 * Send announcement notifications to team members
 * This is a client-side helper - actual sending happens via Cloud Functions
 */
export const sendAnnouncementNotifications = async (
  teamId: string,
  announcementId: string,
  title: string,
  message: string,
  options: NotificationOptions
): Promise<{ pushSent: number; emailSent: number }> => {
  console.log('[Notifications] Triggering announcement notifications via Cloud Function');
  console.log(`[Notifications] Team: ${teamId}, Announcement: ${announcementId}`);
  console.log(`[Notifications] Options: push=${options.sendPush}, email=${options.sendEmail}`);

  // In production, this would call the Cloud Function
  // For now, just return the expected structure
  return { pushSent: 0, emailSent: 0 };
};

/**
 * Register for push notifications and save token
 */
export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[Notifications] Notification permissions not granted');
      return null;
    }

    const token = await getExpoPushToken();
    if (token) {
      await updateUserPushToken(userId, token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('[Notifications] Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Add listener for notifications received while app is in foreground
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add listener for notification responses (user taps notification)
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Get the notification that opened the app (if any)
 */
export const getLastNotificationResponse = (): Promise<Notifications.NotificationResponse | null> => {
  return Notifications.getLastNotificationResponseAsync();
};

/**
 * Initialize messaging - compatibility stub for web
 */
export const initializeMessaging = async (_userId?: string): Promise<void> => {
  console.log('[Notifications] Mobile messaging initialized');
};

/**
 * Foreground message handler - compatibility stub for web
 */
export const onForegroundMessage = (callback: (payload: unknown) => void): (() => void) => {
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    const payload = {
      notification: {
        title: notification.request.content.title,
        body: notification.request.content.body,
      },
      data: notification.request.content.data,
    };
    callback(payload);
  });

  return () => subscription.remove();
};

/**
 * Get FCM token - compatibility stub (returns Expo token instead)
 */
export const getFCMToken = async (): Promise<string | null> => {
  return getExpoPushToken();
};
