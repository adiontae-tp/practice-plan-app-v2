import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import {
  registerForPushNotifications,
  addNotificationResponseListener,
  getLastNotificationResponse,
  onForegroundMessage,
  getAnnouncements,
} from '@ppa/firebase';
import { useAppStore } from '@ppa/store';
import { useData } from './DataContext';

interface NotificationContextValue {
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue>({
  requestPermission: async () => false,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, team } = useData();
  const router = useRouter();
  const setAnnouncementsSelectedAnnouncement = useAppStore(
    (state) => state.setAnnouncementsSelectedAnnouncement
  );

  const handleNotificationNavigation = useCallback(
    async (announcementId?: string) => {
      if (!announcementId || !team?.id) {
        router.push(`/(main)/announcements` as never);
        return;
      }

      try {
        const announcements = await getAnnouncements(team.id);
        const announcement = announcements.find((a) => a.id === announcementId);
        if (announcement) {
          setAnnouncementsSelectedAnnouncement(announcement);
          router.push('/(main)/announcement-detail' as never);
        } else {
          router.push(`/(main)/announcements` as never);
        }
      } catch (error) {
        console.error('[NotificationProvider] Failed to fetch announcement:', error);
        router.push(`/(main)/announcements` as never);
      }
    },
    [router, team?.id, setAnnouncementsSelectedAnnouncement]
  );

  useEffect(() => {
    if (!user?.uid) return;

    registerForPushNotifications(user.uid).catch((error) => {
      console.error('[NotificationProvider] Failed to register:', error);
    });
  }, [user?.uid]);

  useEffect(() => {
    getLastNotificationResponse().then((response) => {
      if (response) {
        const announcementId = response.notification.request.content.data?.announcementId as
          | string
          | undefined;
        handleNotificationNavigation(announcementId);
      }
    });

    const subscription = addNotificationResponseListener((response) => {
      const announcementId = response.notification.request.content.data?.announcementId as
        | string
        | undefined;
      handleNotificationNavigation(announcementId);
    });

    return () => {
      subscription.remove();
    };
  }, [handleNotificationNavigation]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || 'New Announcement';
      const body = payload.notification?.body || '';
      const announcementId = payload.data?.announcementId;

      Alert.alert(title, body, [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
        {
          text: 'View',
          onPress: () => handleNotificationNavigation(announcementId),
        },
      ]);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, handleNotificationNavigation]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      const token = await registerForPushNotifications(user.uid);
      return !!token;
    } catch (error) {
      console.error('[NotificationProvider] Failed to register:', error);
      return false;
    }
  }, [user?.uid]);

  return (
    <NotificationContext.Provider value={{ requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationPermission() {
  const context = useContext(NotificationContext);
  return context;
}
