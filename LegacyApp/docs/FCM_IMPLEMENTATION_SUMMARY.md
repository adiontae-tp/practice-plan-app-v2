# Firebase Cloud Messaging Implementation Summary

## Overview

Firebase Cloud Messaging (FCM) has been implemented for the Practice Plan App to enable push notifications for announcements. This document summarizes the implementation and remaining setup steps.

**Status**: ✅ Code Complete | 🔲 Configuration Required

---

## What's Been Implemented

### 1. Backend (Cloud Functions) ✅

**Location**: `functions/src/index.ts` (lines 652-990)

**Features**:
- `sendAnnouncementNotifications` callable function
- Sends to both FCM tokens (web) and Expo push tokens (mobile)
- Handles invalid/expired tokens gracefully
- Includes retry logic and error handling
- Supports both push and email notifications

**Usage**:
```typescript
const sendNotifications = httpsCallable(functions, 'sendAnnouncementNotifications');
await sendNotifications({
  teamId: 'team-123',
  announcementId: 'announcement-456',
  title: 'Practice Cancelled',
  body: 'Tomorrow's practice is cancelled due to weather',
  sendPush: true,
  sendEmail: false,
});
```

### 2. Web App Implementation ✅

**Files**:
- `src/packages/firebase/src/notifications.web.ts` - FCM logic
- `src/apps/web/components/providers/NotificationProvider.tsx` - React provider
- `src/apps/web/app/firebase-messaging-sw/route.ts` - Dynamic service worker API
- `src/apps/web/public/firebase-messaging-sw.js` - Static service worker (unused)

**Features**:
- Requests notification permissions
- Retrieves FCM token
- Saves token to Firestore user document
- Handles foreground notifications with toast
- Background notifications via service worker
- Deep linking to announcements

**Integration**:
- NotificationProvider wraps entire app in `layout.tsx`
- Service worker served dynamically from API route with config injected
- Initialized automatically when user logs in

### 3. Mobile App Implementation ✅

**Files**:
- `src/packages/firebase/src/notifications.native.ts` - Expo notifications
- `src/apps/mobile/contexts/NotificationContext.tsx` - React provider

**Features**:
- Uses Expo push notifications (proven, reliable)
- Requests permissions automatically on login
- Saves Expo token to Firestore
- Handles foreground notifications with Alert dialog
- Deep linking to announcements
- Android notification channel configuration

**Note**: Mobile uses Expo push notifications instead of native FCM. This is simpler and works reliably on both iOS and Android.

### 4. Notification Flow ✅

```
1. User creates announcement in app
2. App calls Cloud Function: sendAnnouncementNotifications()
3. Function queries team members from Firestore
4. For each member:
   - If web user → Send via FCM (admin.messaging().send)
   - If mobile user → Send via Expo Push API
5. Notification delivered to device
6. User taps notification → Deep link opens announcement
```

### 5. Data Model ✅

**User Document** (`users/{userId}`):
```typescript
{
  uid: string;
  email: string;
  fcmToken?: string;              // Web push token
  fcmTokenUpdatedAt?: number;     // Token timestamp
  expoPushToken?: string;         // Mobile push token
  expoPushTokenUpdatedAt?: number;
  pushEnabled?: boolean;          // Notification preference (default: true)
  emailEnabled?: boolean;         // Email preference (default: true)
}
```

**Announcement Document** (`teams/{teamId}/announcements/{id}`):
```typescript
{
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  createdAt: number;
  notificationsSent?: boolean;
  sentAt?: number;
}
```

---

## What Needs Configuration

### 1. VAPID Key (Required for Web) 🔲

The VAPID (Voluntary Application Server Identification) key is required for web push notifications.

**How to get it**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ppa-tp`
3. Click ⚙️ Settings → **Project settings**
4. Go to **Cloud Messaging** tab
5. Scroll to **Web configuration** section
6. Under **Web Push certificates**, click **Generate key pair** (if not exists)
7. Copy the key (starts with `B...`)

**Add to environment**:
```bash
# src/apps/web/.env.local
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BYourVapidKeyHere...
```

### 2. Verify Firebase Config (Should Already Exist) ✓

Check that these are in `src/apps/web/.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBNqzWzOWwL2FfkJrJQgNdrxBDMDJ0-A9w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ppa-tp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ppa-tp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ppa-tp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=49133175250
NEXT_PUBLIC_FIREBASE_APP_ID=1:49133175250:web:a3c7612594ab26ff4fc80b
```

### 3. User Permissions (Runtime) 🔲

Users must grant notification permissions:

**Web**: 
- Go to Profile page
- Click "Enable Push Notifications" 
- Grant browser permission when prompted

**Mobile**:
- Permission requested automatically on login
- Can also enable in device Settings → Practice Plan → Notifications

---

## Testing Instructions

### 1. Web Testing

```bash
# Start web app
pnpm web

# Open in browser and check console for:
# ✓ [FCM] Messaging initialized successfully
# ✓ [FCM] Token retrieved successfully

# If you see errors:
# ✗ [FCM] VAPID key not configured → Add to .env.local
# ✗ Service worker not registered → Check browser DevTools → Application
```

**Test Flow**:
1. Log in to web app
2. Open DevTools → Console
3. Go to Profile page
4. Click "Enable Push Notifications"
5. Grant permission when browser prompts
6. Console should show: `[FCM] Push notifications enabled for user`
7. Create a test announcement
8. You should receive a desktop notification
9. Click notification → should open announcement page

### 2. Mobile Testing

```bash
# Mobile requires physical device
eas build --profile development --platform ios
# Install on device

# Check for Expo token in Firestore:
# users/{userId}.expoPushToken should be set
```

**Test Flow**:
1. Install app on physical device
2. Log in
3. Grant notification permissions when prompted
4. Create test announcement from another device
5. Push notification should appear on lock screen
6. Tap notification → should open announcement detail

### 3. Debug Panel (Development Only)

Temporarily add to any web page:

```tsx
import { FCMDebugPanel } from '@/components/FCMDebugPanel';

export default function Page() {
  return (
    <>
      {process.env.NODE_ENV === 'development' && <FCMDebugPanel />}
      {/* rest of page */}
    </>
  );
}
```

This shows:
- VAPID key status
- Service worker status
- Permission status
- Current FCM token
- Test notification button

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER DEVICES                         │
├──────────────────────────┬──────────────────────────────────┤
│      Web Browser         │       Mobile Device              │
│  ┌────────────────────┐  │   ┌────────────────────┐        │
│  │ React App          │  │   │ React Native App   │        │
│  │ - NotificationProv │  │   │ - NotificationProv │        │
│  │ - getFCMToken()    │  │   │ - getExpoPushToken │        │
│  └────────┬───────────┘  │   └────────┬───────────┘        │
│           │              │            │                     │
│  ┌────────▼───────────┐  │            │                     │
│  │ Service Worker     │  │            │                     │
│  │ firebase-messaging │  │            │                     │
│  │    -sw.js         │  │            │                     │
│  └────────┬───────────┘  │            │                     │
└───────────┼──────────────┴────────────┼─────────────────────┘
            │                           │
            │ FCM Token                 │ Expo Token
            │                           │
            ▼                           ▼
┌───────────────────────────────────────────────────────────────┐
│                      FIRESTORE                                 │
│  users/{uid}                                                   │
│    - fcmToken: "ey..."                                        │
│    - expoPushToken: "ExponentPushToken[...]"                 │
│    - pushEnabled: true                                        │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ Read tokens
                            ▼
┌───────────────────────────────────────────────────────────────┐
│              FIREBASE CLOUD FUNCTIONS                          │
│  sendAnnouncementNotifications()                              │
│    1. Get team members from Firestore                        │
│    2. For each member:                                        │
│       - FCM token → admin.messaging().send()                 │
│       - Expo token → POST https://exp.host/--/api/v2/push   │
└───────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                 ┌──────────────────┐
│  Firebase Cloud  │                 │  Expo Push API   │
│    Messaging     │                 │                  │
└────────┬─────────┘                 └────────┬─────────┘
         │                                    │
         │ Push to device                    │ Push to device
         │                                    │
         ▼                                    ▼
   [Web Browser]                        [Mobile Device]
```

---

## File Reference

### Core Implementation
| File | Purpose |
|------|---------|
| `functions/src/index.ts` | Cloud Functions - send notifications |
| `src/packages/firebase/src/notifications.web.ts` | Web FCM implementation |
| `src/packages/firebase/src/notifications.native.ts` | Mobile Expo push implementation |
| `src/apps/web/app/firebase-messaging-sw/route.ts` | Dynamic service worker with config injection |

### React Integration
| File | Purpose |
|------|---------|
| `src/apps/web/components/providers/NotificationProvider.tsx` | Web React provider |
| `src/apps/mobile/contexts/NotificationContext.tsx` | Mobile React provider |
| `src/apps/web/components/FCMDebugPanel.tsx` | Debug panel (dev only) |

### Documentation
| File | Purpose |
|------|---------|
| `docs/FCM_SETUP.md` | Detailed setup guide |
| `docs/FCM_CHECKLIST.md` | Quick checklist |
| `docs/FCM_IMPLEMENTATION_SUMMARY.md` | This file |

---

## Next Steps

1. ✅ Code implementation (DONE)
2. 🔲 Add VAPID key to `.env.local`
3. 🔲 Test on web browser
4. 🔲 Test on mobile device
5. 🔲 Send test announcements
6. 🔲 Verify notifications received
7. 🔲 Test deep linking

---

## Support

If you encounter issues:

1. Check browser console for FCM logs
2. Use `FCMDebugPanel` component to verify configuration
3. Check Firestore for user tokens
4. Review Cloud Functions logs in Firebase Console
5. See `docs/FCM_SETUP.md` for troubleshooting

---

**Last Updated**: January 2025  
**Status**: Ready for VAPID key configuration and testing




