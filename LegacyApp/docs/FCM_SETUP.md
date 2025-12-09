# Firebase Cloud Messaging (FCM) Setup Guide

This guide covers the setup required to enable push notifications for the Practice Plan App.

📚 **Quick Links**: [Implementation Summary](./FCM_IMPLEMENTATION_SUMMARY.md) | [Setup Checklist](./FCM_CHECKLIST.md)

## Overview

- **Web**: Uses Firebase Cloud Messaging (FCM) with service worker
- **Mobile**: Uses Expo Push Notifications
- **Backend**: Cloud Functions send to both FCM and Expo tokens

---

## Web App Setup

### 1. Get VAPID Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`ppa-tp`)
3. Go to **Project Settings** (gear icon) → **Cloud Messaging** tab
4. Scroll to **Web configuration** section
5. Under **Web Push certificates**, find your **Key pair** (VAPID key)
6. If no key exists, click **Generate key pair**
7. Copy the key (starts with `B...`)

### 2. Add VAPID Key to Environment Variables

Add to `src/apps/web/.env.local`:

```bash
# Firebase Cloud Messaging VAPID Key
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BYourVapidKeyHere...
```

### 3. Verify Other Firebase Environment Variables

Ensure these are set in `src/apps/web/.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ppa-tp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ppa-tp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ppa-tp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=49133175250
NEXT_PUBLIC_FIREBASE_APP_ID=1:49133175250:web:...
```

### 4. Test FCM Token Registration

1. Start the web app: `pnpm web`
2. Open browser DevTools → Console
3. Look for FCM logs:
   - `[FCM] Token retrieved successfully` (success)
   - `[FCM] VAPID key not configured` (missing VAPID key)
   - `[FCM] Firebase Messaging not supported in this browser` (browser issue)

### 5. Grant Notification Permissions

Users must grant notification permissions:
1. Go to Profile page
2. Click **Enable Push Notifications** under Notification Preferences
3. Browser will prompt for permission
4. After granting, FCM token is saved to user's Firestore document

---

## Mobile App Setup

### Current Implementation (Expo Push Notifications)

Already configured and working:
- Uses `expo-notifications` package
- Requires physical device (won't work in Expo Go)
- Tokens saved as `expoPushToken` in Firestore
- Cloud Functions send via Expo Push API

### Future: Native FCM (Optional)

If you want native FCM instead of Expo push:

1. Install dependencies:
   ```bash
   pnpm add @react-native-firebase/app @react-native-firebase/messaging
   ```

2. Update `src/packages/firebase/src/notifications.native.ts` to use FCM SDK

3. Rebuild native apps:
   ```bash
   npx expo prebuild
   eas build --platform ios
   eas build --platform android
   ```

**Note**: Expo push notifications work well for most use cases. Only switch to native FCM if you need advanced features.

---

## Backend (Cloud Functions)

Already implemented:
- `sendAnnouncementNotifications` callable function
- Sends to both FCM tokens (web) and Expo tokens (mobile)
- Handles invalid/expired tokens gracefully

No setup required - works automatically once tokens are saved to Firestore.

---

## Testing Push Notifications

### Web Testing

1. Create a test announcement from the web app
2. Check browser DevTools → Console for FCM logs
3. Look for desktop notification popup
4. Click notification to verify deep linking

### Mobile Testing

1. Build app with EAS: `eas build --profile development --platform ios`
2. Install on physical device
3. Create test announcement
4. Check for push notification on lock screen
5. Tap notification to verify deep linking

### Cloud Function Testing

From Firebase Console:
1. Go to **Functions** tab
2. Find `sendAnnouncementNotifications`
3. Click **Test function**
4. Send test payload:
   ```json
   {
     "data": {
       "teamId": "your-team-id",
       "announcementId": "test-announcement-id",
       "title": "Test Announcement",
       "body": "This is a test notification",
       "sendPush": true,
       "sendEmail": false
     }
   }
   ```

---

## Troubleshooting

### Web: "FCM Token not retrieved"

- Check VAPID key is correct
- Verify notification permissions granted
- Check browser console for errors
- Try in Chrome/Edge (best FCM support)

### Web: Service Worker Not Registering

- Verify `firebase-messaging-sw.js` exists in `public/`
- Check browser DevTools → Application → Service Workers
- Try unregistering and re-registering service worker

### Mobile: No Push Notifications

- Verify using physical device (not simulator/emulator)
- Check Expo project ID is correct in `app.json`
- Verify notification permissions granted on device
- Check `expoPushToken` is saved in Firestore user document

### Cloud Functions: Notifications Not Sending

- Check Cloud Functions logs in Firebase Console
- Verify user has `fcmToken` or `expoPushToken` in Firestore
- Check user's `pushEnabled` preference is `true`
- Verify FCM/Expo API is not rate-limited

---

## Security Notes

- VAPID keys are public - safe to commit in `.env.local.example`
- FCM tokens are user-specific and expire automatically
- Invalid tokens are removed on send failure
- Notification preferences checked before sending

---

## File Locations

- **Web FCM**: `src/packages/firebase/src/notifications.web.ts`
- **Mobile Notifications**: `src/packages/firebase/src/notifications.native.ts`
- **Cloud Functions**: `functions/src/index.ts` (line 652+)
- **Service Worker**: `src/apps/web/public/firebase-messaging-sw.js`
- **Web Provider**: `src/apps/web/components/providers/NotificationProvider.tsx`
- **Mobile Provider**: `src/apps/mobile/contexts/NotificationContext.tsx`
- **Config Injector**: `src/apps/web/components/FirebaseConfigInjector.tsx`




