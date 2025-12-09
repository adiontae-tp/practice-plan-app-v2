// Firebase Cloud Messaging Service Worker
// This service worker handles background push notifications for the PWA

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config should be injected by FirebaseConfigInjector component
// via self.FIREBASE_* variables before service worker loads
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY || '',
  authDomain: self.FIREBASE_AUTH_DOMAIN || '',
  projectId: self.FIREBASE_PROJECT_ID || '',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: self.FIREBASE_APP_ID || '',
};

// Validate config before initializing
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('[firebase-messaging-sw.js] Firebase config not properly injected. Check FirebaseConfigInjector.');
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
    ? `/announcements?id=${announcementId}` 
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
