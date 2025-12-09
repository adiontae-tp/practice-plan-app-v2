# FCM Implementation Checklist

Quick checklist to verify Firebase Cloud Messaging is properly configured.

📚 **See also**: [FCM Implementation Summary](./FCM_IMPLEMENTATION_SUMMARY.md) | [FCM Setup Guide](./FCM_SETUP.md)

## ✅ Completed Items

- [x] Firebase Cloud Functions with FCM sending logic (`functions/src/index.ts`)
- [x] Web notification implementation (`src/packages/firebase/src/notifications.web.ts`)
- [x] Mobile notification implementation (Expo push notifications)
- [x] Web NotificationProvider integration
- [x] Mobile NotificationProvider integration
- [x] Service worker file (`firebase-messaging-sw.js`)
- [x] Firebase config injector component (`FirebaseConfigInjector.tsx`)
- [x] Service worker config injection in layout
- [x] Console logging for debugging
- [x] FCM setup documentation

## 🔲 Required Setup Steps

- [ ] **Get VAPID key from Firebase Console**
  - Go to Firebase Console → Project Settings → Cloud Messaging
  - Under "Web Push certificates", generate key pair if needed
  - Copy the public key

- [ ] **Add VAPID key to `.env.local`**
  ```bash
  NEXT_PUBLIC_FIREBASE_VAPID_KEY=BYourVapidKeyHere...
  ```

- [ ] **Verify Firebase config in `.env.local`**
  - All `NEXT_PUBLIC_FIREBASE_*` variables are set
  - See `docs/FCM_SETUP.md` for full list

- [ ] **Test notification permissions on web**
  - Start web app
  - Go to Profile page
  - Click "Enable Push Notifications"
  - Grant browser permission when prompted

- [ ] **Test mobile notifications**
  - Build development app: `eas build --profile development --platform ios`
  - Install on physical device
  - Grant notification permissions in app

- [ ] **Send test announcement**
  - Create an announcement
  - Verify push notification received
  - Test notification click → opens announcement

## 🧪 Testing Checklist

### Web Browser
- [ ] Open browser DevTools → Console
- [ ] Look for `[FCM] Messaging initialized successfully`
- [ ] Check for `[FCM] Token retrieved successfully` after granting permissions
- [ ] Verify no errors about missing VAPID key
- [ ] Create test announcement and verify notification appears
- [ ] Click notification and verify it opens correct page

### Mobile Device
- [ ] Install app on physical device (not simulator)
- [ ] Grant notification permissions when prompted
- [ ] Verify Expo push token saved in Firestore
- [ ] Create test announcement from another device
- [ ] Verify push notification received on lock screen
- [ ] Tap notification and verify it opens announcement detail

### Cloud Functions
- [ ] Check Firebase Console → Functions logs
- [ ] Look for successful FCM sends
- [ ] Verify no errors about invalid tokens
- [ ] Check announcement document has `notificationsSent: true`

## 📋 Firestore Data Verification

### User Document (`users/{userId}`)
Check for:
- [ ] `fcmToken` field (web users)
- [ ] `expoPushToken` field (mobile users)
- [ ] `pushEnabled: true` (notification preference)
- [ ] `fcmTokenUpdatedAt` or `expoPushTokenUpdatedAt` timestamp

### Announcement Document
After sending notification:
- [ ] `notificationsSent: true`
- [ ] `sentAt` timestamp

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "VAPID key not configured" | Add `NEXT_PUBLIC_FIREBASE_VAPID_KEY` to `.env.local` |
| Service worker not registering | Check FirebaseConfigInjector in layout.tsx |
| No token in Firestore | User hasn't granted notification permissions |
| Mobile notifications not working | Verify using physical device, not simulator |
| "Firebase Messaging not supported" | Try Chrome/Edge browser instead |

## 📝 Next Steps (Optional)

- [ ] Add notification settings UI to profile page
- [ ] Implement notification history/read status
- [ ] Add support for different notification types
- [ ] Set up notification analytics
- [ ] Configure notification badge counts
- [ ] Add deep linking for different notification types

## 🔗 Resources

- [Firebase Console](https://console.firebase.google.com/)
- [FCM Setup Guide](./FCM_SETUP.md)
- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)




