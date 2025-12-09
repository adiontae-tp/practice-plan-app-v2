import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, initializeAuth, getAuth } from 'firebase/auth';
// @ts-expect-error: getReactNativePersistence exists in the RN bundle but is missing from TypeScript definitions
// See: https://github.com/firebase/firebase-js-sdk/issues/8332
import { getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded Firebase config - guaranteed to work
const mobileFirebaseConfig = {
  apiKey: 'AIzaSyBNqzWzOWwL2FfkJrJQgNdrxBDMDJ0-A9w',
  authDomain: 'ppa-tp.firebaseapp.com',
  projectId: 'ppa-tp',
  storageBucket: 'ppa-tp.firebasestorage.app',
  messagingSenderId: '49133175250',
  appId: '1:49133175250:web:a3c7612594ab26ff4fc80b',
};

const mobileOldFirebaseConfig = {
  apiKey: 'AIzaSyDryMgkHSrnF42CezSdrIp-3ot3CVWHXAo',
  authDomain: 'mypracticeplan.firebaseapp.com',
  projectId: 'mypracticeplan',
  storageBucket: 'mypracticeplan.appspot.com',
  messagingSenderId: '942155775879',
  appId: '1:942155775879:web:af472f75a5279ad7531d22',
};

const hasMobileOldConfig = Boolean(mobileOldFirebaseConfig.apiKey && mobileOldFirebaseConfig.projectId);

// Initialize NEW Firebase app (primary)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(mobileFirebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore with persistent local cache for offline support
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache()
  });
} catch (error: any) {
  if (error.code === 'failed-precondition') {
    console.warn('Firestore persistence unavailable in React Native');
  } else if (error.code === 'unimplemented') {
    console.warn('Firestore persistence not supported');
  } else {
    console.warn('Firestore initialization error:', error);
  }
  const { getFirestore } = require('firebase/firestore');
  db = getFirestore(app);
}

// Initialize OLD Firebase app (for migration lookups)
let oldApp: FirebaseApp | null = null;
let oldAuth: Auth | null = null;

if (hasMobileOldConfig) {
  try {
    oldApp = initializeApp(mobileOldFirebaseConfig, 'old-firebase');
    oldAuth = getAuth(oldApp);
  } catch (error) {
    console.warn('Failed to initialize old Firebase app:', error);
  }
}

// Old project Firestore and Storage (for data migration)
export const oldDb = hasMobileOldConfig && oldApp ? (() => {
  const { getFirestore } = require('firebase/firestore');
  return getFirestore(oldApp);
})() : null;
export const oldStorage = hasMobileOldConfig && oldApp ? getStorage(oldApp) : null;

// Lazy getters for compatibility with web (though RN uses eager init here for now)
export const getOldApp = () => oldApp;
export const getOldAuth = () => oldAuth;
export const getOldDb = () => oldDb;
export const getOldStorage = () => oldStorage;

// Initialize auth with React Native persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e: unknown) {
  const error = e as { code?: string };
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    console.error('Error initializing auth:', e);
    auth = getAuth(app);
  }
}

export { auth, db };
export const storage = getStorage(app);

// Export old auth for migration purposes
export { oldAuth };
export const isMigrationEnabled = hasMobileOldConfig;

export default app;
