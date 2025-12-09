export default ({ config }) => {
  return {
    ...config,
    name: config.name || "Practice Plan",
    slug: config.slug || "practice-plan-app",
    extra: {
      ...config.extra,
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },
      oldFirebase: {
        apiKey: process.env.EXPO_PUBLIC_OLD_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_OLD_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_OLD_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_OLD_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_OLD_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_OLD_FIREBASE_APP_ID,
      }
    },
  };
};