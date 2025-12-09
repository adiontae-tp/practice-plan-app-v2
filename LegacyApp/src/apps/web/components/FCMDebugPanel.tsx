'use client';

import { useState, useEffect } from 'react';
import { getFCMToken, requestNotificationPermissions } from '@ppa/firebase';

/**
 * FCM Debug Panel - Development only
 * Shows FCM configuration status and allows testing
 * 
 * Usage: Add to any page temporarily for debugging
 * <FCMDebugPanel />
 */
export function FCMDebugPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [swRegistered, setSWRegistered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check VAPID key
    setVapidKey(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || null);

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js').then((registration) => {
        setSWRegistered(!!registration);
      });
    }

    // Try to get existing token if permission granted
    if (Notification.permission === 'granted') {
      getFCMToken().then(setToken).catch(console.error);
    }
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermissions();
      if (granted) {
        setPermission('granted');
        const newToken = await getFCMToken();
        setToken(newToken);
      }
    } catch (error) {
      console.error('[FCMDebugPanel] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from FCM Debug Panel',
        icon: '/logo.png',
        tag: 'test',
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">FCM Debug Panel</h3>
        <span className="text-xs text-gray-500">DEV ONLY</span>
      </div>

      <div className="space-y-2 text-sm">
        {/* VAPID Key Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">VAPID Key:</span>
          <span className={vapidKey ? 'text-green-600' : 'text-red-600'}>
            {vapidKey ? '✓ Configured' : '✗ Missing'}
          </span>
        </div>

        {/* Service Worker Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Service Worker:</span>
          <span className={swRegistered ? 'text-green-600' : 'text-red-600'}>
            {swRegistered ? '✓ Registered' : '✗ Not Registered'}
          </span>
        </div>

        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Permission:</span>
          <span
            className={
              permission === 'granted'
                ? 'text-green-600'
                : permission === 'denied'
                  ? 'text-red-600'
                  : 'text-yellow-600'
            }
          >
            {permission}
          </span>
        </div>

        {/* FCM Token */}
        <div className="flex flex-col gap-1">
          <span className="text-gray-600">FCM Token:</span>
          {token ? (
            <code className="overflow-hidden text-ellipsis whitespace-nowrap rounded bg-gray-100 px-2 py-1 text-xs">
              {token.substring(0, 50)}...
            </code>
          ) : (
            <span className="text-gray-400">Not generated</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleRequestPermission}
            disabled={loading || permission === 'granted'}
            className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Loading...' : 'Request Permission'}
          </button>
          <button
            onClick={handleSendTestNotification}
            disabled={permission !== 'granted'}
            className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600 disabled:bg-gray-300"
          >
            Test Notification
          </button>
        </div>

        {/* Warnings */}
        {!vapidKey && (
          <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-700">
            Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to .env.local
          </div>
        )}
        {!swRegistered && (
          <div className="mt-2 rounded bg-yellow-50 p-2 text-xs text-yellow-700">
            Service worker not registered. Check browser console.
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-gray-200 pt-2 text-xs text-gray-500">
        See <code>docs/FCM_SETUP.md</code> for setup instructions
      </div>
    </div>
  );
}




