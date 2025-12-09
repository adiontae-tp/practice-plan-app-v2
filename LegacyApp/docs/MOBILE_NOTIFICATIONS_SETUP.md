# Mobile App Push Notifications Setup

## Overview

The mobile app uses **Expo Push Notifications** for both iOS and Android. This is simpler and more reliable than native FCM, and it's already fully implemented!

---

## ✅ Already Configured

The following is already set up and working:

1. **expo-notifications** package installed (`package.json`)
2. **NotificationProvider** integrated in app layout
3. **Automatic registration** on user login
4. **Deep linking** to announcements when tapped
5. **Foreground notifications** with Alert dialog
6. **Background/killed app** notifications work automatically
7. **EAS project ID** configured for push service

---

## How It Works

### Registration Flow
```
1. User logs in
2. NotificationProvider checks if on physical device
3. Requests notification permissions from user
4. Gets Expo Push Token from Expo servers
5. Saves token to Firestore (users/{userId}.expoPushToken)
6. Cloud Functions use this token to send notifications
```

### Notification Flow
```
1. Announcement created in app
2. Cloud Function called: sendAnnouncementNotifications
3. Function reads team members' Expo tokens from Firestore
4. Sends via Expo Push API: https://exp.host/--/api/v2/push/send
5. Expo servers deliver to devices
6. User taps notification → Deep links to announcement detail
```

---

## Testing Push Notifications

### Requirements
- **Physical device** (iOS or Android)
- **Development build** (not Expo Go)
- **Notifications enabled** in device settings

### Build the App

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android

# Both
eas build --profile development --platform all
```

### Install and Test

1. **Install the build** on your physical device
2. **Log in** to the app
3. **Grant notification permissions** when prompted
4. **Verify token saved**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Check `users/{yourUserId}` document
   - Should see `expoPushToken: "ExponentPushToken[...]"`
5. **Create a test announcement** from another device (web or mobile)
6. **Receive push notification** on your device!

---

## Notification States

### Foreground (App Open)
- Alert dialog appears with "View" or "Dismiss" buttons
- Tapping "View" → Opens announcement detail

### Background (App Minimized)
- Standard notification in notification center
- Tapping notification → Opens app to announcement detail

### Killed (App Closed)
- Standard notification in notification center
- Tapping notification → Opens app to announcement detail

---

## Troubleshooting

### "Push notifications only work on physical devices"
- ✅ **Solution**: Install on iPhone/Android device, not simulator/emulator

### "Permission not granted"
- User declined notification permissions
- ✅ **Solution**: Go to device Settings → Practice Plan → Notifications → Enable

### "EAS project ID not configured"
- Missing from `app.json`
- ✅ **Already fixed**: `"projectId": "9e5ae8b0-12df-4be2-927c-dfcd9e1b4a82"`

### No token in Firestore
- Check if using physical device
- Check if permissions were granted
- Check console logs for errors
- ✅ **Solution**: Reinstall app and grant permissions

### Notifications not sending
- Check Cloud Functions logs in Firebase Console
- Verify user has `expoPushToken` in Firestore
- Check user's `pushEnabled` preference is `true`
- ✅ **Solution**: See Cloud Functions logs for errors

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/apps/mobile/contexts/NotificationContext.tsx` | Main notification logic |
| `src/packages/firebase/src/notifications.native.ts` | Expo notification implementation |
| `functions/src/index.ts` | Cloud Function that sends notifications |
| `src/apps/mobile/app.json` | Expo notifications config |
| `src/apps/mobile/assets/images/notification-icon.png` | Notification icon (Android) |

---

## Notification Icon

The notification icon is automatically used on Android devices. It should be:
- **Square transparent PNG**
- **White icon** on transparent background (Android converts to system colors)
- **Simple silhouette** (not photographic)

Currently using the app icon. To customize:
1. Create a square white icon (e.g., 96x96 px)
2. Save as `assets/images/notification-icon.png`
3. Rebuild the app

---

## Environment Variables

No additional environment variables needed! Expo handles everything with the project ID in `app.json`.

---

## Expo Push Notification Limits

- **Free tier**: Unlimited push notifications
- **Rate limits**: 600 requests/min per project
- **Payload size**: 4 KB max per notification
- **Batching**: Up to 100 notifications per request

These limits are more than sufficient for team announcements.

---

## Next Steps (Optional Enhancements)

- [ ] Add custom notification sounds
- [ ] Add notification categories/channels (Android)
- [ ] Implement notification action buttons
- [ ] Add rich media (images) to notifications
- [ ] Track notification delivery receipts
- [ ] Implement notification scheduling

---

## Resources

- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Tool (Test)](https://expo.dev/notifications)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

---

**Status**: ✅ Fully implemented and ready to test!




