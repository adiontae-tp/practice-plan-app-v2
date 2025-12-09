import { NextRequest, NextResponse } from 'next/server';

/**
 * Dynamic service worker route
 * Serves firebase-messaging-sw.js with Firebase config injected
 * 
 * This is necessary because service workers run in a separate context
 * and can't access environment variables or page-level JavaScript
 */
export async function GET(request: NextRequest) {
  const serviceWorkerContent = `
// Firebase Cloud Messaging Service Worker (Dynamic)
// Generated with Firebase config injected from environment variables

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config injected at runtime
const firebaseConfig = {
  apiKey: '${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}',
  authDomain: '${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}',
  projectId: '${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}',
  storageBucket: '${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}',
  messagingSenderId: '${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}',
  appId: '${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}',
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('[firebase-messaging-sw.js] Firebase config missing. Check environment variables.');
  console.error('[firebase-messaging-sw.js] Config:', firebaseConfig);
} else {
  console.log('[firebase-messaging-sw.js] Initializing with project:', firebaseConfig.projectId);
}

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Announcement';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.announcementId || 'announcement',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'View',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  event.notification.close();

  const announcementId = event.notification.data?.announcementId;
  const urlToOpen = announcementId 
    ? \`/announcements?id=\${announcementId}\`
    : '/announcements';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/announcements') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
`;

  return new NextResponse(serviceWorkerContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}




