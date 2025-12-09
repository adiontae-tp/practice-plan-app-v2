'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { useAppStore } from '@ppa/store';
import { initializeMessaging, registerForPushNotifications, onForegroundMessage } from '@ppa/firebase';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const user = useAppStore((state) => state.user);
  const router = useRouter();

  const initNotifications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await initializeMessaging(user.uid);
    } catch (error) {
      console.error('[NotificationProvider] Failed to initialize messaging:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    initNotifications();
  }, [initNotifications]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || 'New Announcement';
      const body = payload.notification?.body || '';
      const announcementId = payload.data?.announcementId;

      toast(title, {
        description: body,
        action: announcementId
          ? {
              label: 'View',
              onClick: () => {
                router.push(`/announcements?id=${announcementId}`);
              },
            }
          : undefined,
        duration: 8000,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, router]);

  return (
    <>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
          },
        }}
      />
      {children}
    </>
  );
}

export function useNotificationPermission() {
  const user = useAppStore((state) => state.user);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      const token = await registerForPushNotifications(user.uid);
      if (token) {
        toast.success('Notifications enabled', {
          description: 'You will now receive push notifications.',
        });
      }
      return !!token;
    } catch (error) {
      console.error('[useNotificationPermission] Failed to register:', error);
      toast.error('Failed to enable notifications', {
        description: 'Please check your browser settings.',
      });
      return false;
    }
  }, [user?.uid]);

  return { requestPermission };
}
