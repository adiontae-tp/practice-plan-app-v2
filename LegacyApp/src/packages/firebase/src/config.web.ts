import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore, getFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

// Hardcoded Firebase config - guaranteed to work (same as native)
const webFirebaseConfig = {
  apiKey: 'AIzaSyBNqzWzOWwL2FfkJrJQgNdrxBDMDJ0-A9w',
  authDomain: 'ppa-tp.firebaseapp.com',
  projectId: 'ppa-tp',
  storageBucket: 'ppa-tp.firebasestorage.app',
  messagingSenderId: '49133175250',
  appId: '1:49133175250:web:a3c7612594ab26ff4fc80b',
};

const webOldFirebaseConfig = {
  apiKey: 'AIzaSyDryMgkHSrnF42CezSdrIp-3ot3CVWHXAo',
  authDomain: 'mypracticeplan.firebaseapp.com',
  projectId: 'mypracticeplan',
  storageBucket: 'mypracticeplan.appspot.com',
  messagingSenderId: '942155775879',
  appId: '1:942155775879:web:af472f75a5279ad7531d22',
};

const hasOldFirebaseConfig = Boolean(webOldFirebaseConfig.apiKey && webOldFirebaseConfig.projectId);

// Initialize NEW Firebase app (primary)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(webFirebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore with persistent local cache for offline support
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (error: any) {
  if (error.code === 'failed-precondition') {
    console.warn('Firestore persistence unavailable: multiple tabs open or browser incompatible');
  } else if (error.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser');
  } else {
    console.warn('Firestore initialization error:', error);
  }
  db = getFirestore(app);
}

// Initialize Firebase Cloud Messaging (lazy, only when supported)
let messaging: Messaging | null = null;

export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const supported = await isSupported();
    if (supported && !messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.warn('Firebase Messaging not supported:', error);
    return null;
  }
};

// Initialize OLD Firebase app (for migration lookups)
let oldApp: FirebaseApp | null = null;

// Old project Firestore and Storage (for data migration)
// Lazy initialization function for migration tools
export const getOldApp = () => {
  if (!hasOldFirebaseConfig) return null;

  if (!oldApp) {
    try {
      oldApp = initializeApp(webOldFirebaseConfig, 'old-firebase');
    } catch (error) {
      console.warn('Failed to initialize old Firebase app:', error);
      return null;
    }
  }
  return oldApp;
};

// Export getters that initialize on demand
export const getOldAuth = () => {
  const app = getOldApp();
  return app ? getAuth(app) : null;
};

export const getOldDb = () => {
  const app = getOldApp();
  if (!app) return null;
  const { getFirestore } = require('firebase/firestore');
  return getFirestore(app);
};

export const getOldStorage = () => {
  const app = getOldApp();
  return app ? getStorage(app) : null;
};

// Initialize auth with browser persistence
const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);

// Set browser local persistence for web
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Failed to set auth persistence:', error);
});

export { auth, db, storage };
export { webFirebaseConfig as firebaseConfig };

// Export old auth for migration purposes
export const isMigrationEnabled = hasOldFirebaseConfig;

export default app;
