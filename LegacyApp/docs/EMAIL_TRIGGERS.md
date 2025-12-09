# Email Send Triggers

This document describes all the events and actions that trigger email sends via Resend.

## Automatic Triggers (Cloud Functions)

### 1. Announcement Emails (Automatic)

**Trigger**: Firestore document creation  
**Location**: `functions/src/index.ts` - `onAnnouncementCreatedSendNotifications`

**When it fires:**
- An announcement is created in `teams/{teamId}/announcements/{announcementId}`
- The announcement document has `notificationOptions.sendEmail: true`

**What happens:**
1. Cloud Function automatically detects the new announcement
2. Fetches all team coaches with `emailEnabled: true`
3. Filters out the announcement creator
4. Creates formatted HTML email with:
   - Priority badge (URGENT/IMPORTANT if applicable)
   - Team name and sender name
   - Announcement title and message
5. Adds document to `mail` collection
6. Extension picks it up and sends via Resend
7. Updates announcement with `notificationsSent: true` and delivery results

**Email fields:**
- **To**: All team coaches (except creator) with email enabled
- **Subject**: `[PRIORITY] Team Name: Announcement Title`
- **From**: `noreply@practiceplan.app`
- **Reply-To**: `support@practiceplan.app`
- **BCC**: `adiontae.gerron@gmail.com`

---

### 2. Announcement Emails (Manual Callable)

**Trigger**: Callable Cloud Function  
**Location**: `functions/src/index.ts` - `sendAnnouncementNotifications`

**When it fires:**
- Client calls the `sendAnnouncementNotifications` function
- Passes `sendEmail: true` in the request

**What happens:**
- Same process as automatic trigger above
- Used for resending notifications or when notifications weren't sent on creation

**Client usage:**
```typescript
// From web/mobile app
import { httpsCallable } from 'firebase/functions';
const sendNotifications = httpsCallable(functions, 'sendAnnouncementNotifications');

await sendNotifications({
  teamId: '...',
  announcementId: '...',
  title: '...',
  body: '...',
  sendPush: true,
  sendEmail: true
});
```

---

## Manual Triggers (Client-Side)

### 3. Coach Invitation Emails

**Trigger**: `inviteCoach()` function call  
**Location**: `src/packages/firebase/src/firestore.ts`

**When it fires:**
- A team admin calls `inviteCoach()` to invite a coach to join their team
- Automatically sends invitation email as part of the invite process

**What happens:**
1. Creates coach record with `status: 'invited'`
2. Creates pending invite record
3. Calls `sendCoachInviteEmail()` which adds document to `mail` collection
4. Extension sends email via Resend

**Email fields:**
- **To**: Invited coach's email address
- **Subject**: `You've been invited to join {teamName} on Practice Plan`
- **Content**: Includes inviter name, team name, and invite link
- **BCC**: `adiontae.gerron@gmail.com`

**Client usage:**
```typescript
import { inviteCoach } from '@ppa/firebase';

await inviteCoach({
  teamId: '...',
  email: 'coach@example.com',
  permission: 'edit',
  teamName: 'Basketball Team',
  inviterName: 'Coach Smith'
});
```

---

## Available But Not Currently Used

These email functions are available in the codebase but are not currently triggered anywhere:

### 4. Plan Share Emails

**Function**: `sendPlanShareEmail()`  
**Location**: `src/packages/firebase/src/email.ts`

**When it would fire:**
- When a practice plan is shared with someone
- Currently not implemented in the UI

**Usage (when implemented):**
```typescript
import { sendPlanShareEmail } from '@ppa/firebase';

await sendPlanShareEmail({
  recipientEmail: 'user@example.com',
  planName: 'Practice Plan 1',
  planDate: '2025-12-07',
  sharedByName: 'Coach Smith',
  shareLink: 'https://...'
});
```

---

### 5. File Share Emails

**Function**: `sendFileShareEmail()`  
**Location**: `src/packages/firebase/src/email.ts`

**When it would fire:**
- When a file is shared with someone
- Currently not implemented in the UI

**Usage (when implemented):**
```typescript
import { sendFileShareEmail } from '@ppa/firebase';

await sendFileShareEmail({
  recipientEmail: 'user@example.com',
  fileName: 'document.pdf',
  sharedByName: 'Coach Smith',
  shareLink: 'https://...',
  expiresAt: '2025-12-14'
});
```

---

### 6. Welcome Emails ✅

**Function**: `sendWelcomeEmail()`  
**Location**: `src/packages/firebase/src/email.ts`

**When it fires:**
- Automatically when a new user signs up via `signUpWithUserCreation()`
- Triggered after successful user and team creation

**What happens:**
1. User signs up with email, password, first name, last name
2. User account and team are created
3. Welcome email is automatically sent
4. Email includes getting started information

**Email fields:**
- **To**: New user's email address
- **Subject**: `Welcome to Practice Plan!`
- **From**: `noreply@practiceplan.app`
- **BCC**: `adiontae.gerron@gmail.com` (all emails are BCC'd)

**Note**: If email sending fails, signup still succeeds (email is non-blocking)

---

## Firebase Auth Emails (Not via Resend)

These emails are sent by Firebase Auth directly, not through the Resend extension:

### 7. Password Reset Emails

**Trigger**: `sendPasswordResetEmail()`  
**Location**: Firebase Auth

**When it fires:**
- User requests password reset
- Called from forgot password screen

**Note**: These are sent by Firebase Auth, not Resend.

---

### 8. Email Sign-In Links

**Trigger**: `sendEmailSignInLink()`  
**Location**: `src/packages/firebase/src/auth.ts`

**When it fires:**
- User requests passwordless sign-in link
- Called from passwordless auth screen

**Note**: These are sent by Firebase Auth, not Resend.

---

## Email Flow Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Email Triggers                        │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   Automatic          Manual Callable      Client-Side
   (Firestore         (Cloud Function)     (Direct Call)
    Trigger)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  sendEmailViaExtension  │
              │  (Cloud Functions)     │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   mail collection       │
              │   (Firestore)           │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Firebase Extension     │
              │  (firestore-send-email)  │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │      Resend SMTP        │
              │   (smtp.resend.com)     │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Recipient's Email     │
              └─────────────────────────┘
```

---

## Currently Active Email Types

✅ **Active:**
1. Announcement emails (automatic + manual)
2. Coach invitation emails
3. Welcome emails (automatic on signup)

⏳ **Available but not used:**
4. Plan share emails
5. File share emails

## BCC Configuration

**All emails are automatically BCC'd to:** `adiontae.gerron@gmail.com`

This is configured in:
- Client-side: `src/packages/firebase/src/email.ts` - `sendEmail()` function
- Server-side: `functions/src/index.ts` - `sendEmailViaExtension()` function

The BCC is added automatically to every email sent, regardless of type.

---

## Testing Email Sends

### Test Announcement Email

1. Create an announcement in the app
2. Enable "Send Email" notification option
3. Save the announcement
4. Check Firestore `mail` collection for the queued email
5. Check email delivery status in the document's `delivery` field

### Test Coach Invitation

1. Go to Coaches screen
2. Click "Invite Coach"
3. Enter email and send invitation
4. Check Firestore `mail` collection
5. Verify email received

### Monitor Email Delivery

Query the `mail` collection:
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

// Check failed emails
const failedQuery = query(
  collection(db, 'mail'),
  where('delivery.state', '==', 'ERROR')
);

// Check pending emails
const pendingQuery = query(
  collection(db, 'mail'),
  where('delivery.state', '==', 'PENDING')
);
```

---

## Important Notes

1. **Domain Verification Required**: `practiceplan.app` must be verified in Resend before emails will send
2. **Email Preferences**: Users can disable emails via `emailEnabled: false` in their coach record
3. **Delivery Status**: Check `mail` collection documents for delivery status and errors
4. **Extension Status**: Monitor extension status in Firebase Console > Extensions
5. **Rate Limits**: Resend has rate limits - check Resend dashboard for usage




