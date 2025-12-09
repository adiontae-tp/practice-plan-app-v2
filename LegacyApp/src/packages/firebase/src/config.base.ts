import { FirebaseOptions } from 'firebase/app';

// Ensure TypeScript knows about `process.env` in environments without Node types
declare const process: {
  env: { [key: string]: string | undefined };
};

// NEW Firebase project configuration (primary - where users will be migrated TO)
export const newFirebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// OLD Firebase project configuration (legacy - where users are migrating FROM)
export const oldFirebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_OLD_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_OLD_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_OLD_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_OLD_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_OLD_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_OLD_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_OLD_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_OLD_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_OLD_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_OLD_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_OLD_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_OLD_FIREBASE_APP_ID,
};

// Check if old Firebase config is provided
export const hasOldFirebaseConfig = Boolean(
  oldFirebaseConfig.apiKey && oldFirebaseConfig.projectId
);
