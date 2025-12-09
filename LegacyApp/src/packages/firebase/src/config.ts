// This file acts as the fallback/default export
// Platform-specific bundlers will resolve:
// - config.native.ts for React Native (Metro)
// - config.web.ts for web (webpack/vite/next)
// - config.ts (this file) as fallback

// Re-export from web config as default (most bundlers will use this)
export { auth, db, storage, getOldAuth, getOldDb, getOldStorage, isMigrationEnabled, firebaseConfig, getMessagingInstance } from './config.web';
export { default } from './config.web';
