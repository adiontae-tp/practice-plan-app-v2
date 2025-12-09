# Resend Email Setup Guide

## Overview

This project uses the Firebase Trigger Email extension with Resend SMTP to send transactional emails. The extension automatically sends emails when documents are added to the `mail` collection in Firestore.

## Configuration

### 1. Extension Configuration

The extension is configured in `extensions/firestore-send-email.env`:

- **API Key**: Already configured with your Resend API key
- **Default From**: `noreply@practiceplan.app` (must be verified in Resend)
- **Reply-To**: `support@practiceplan.app`
- **Mail Collection**: `mail` (monitored by extension)
- **Location**: `us-central1`

### 2. Verify Email Domain in Resend

Before deploying, you must verify your email domain in Resend:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add and verify `practiceplan.app` domain
3. Configure DNS records (SPF, DKIM, DMARC) as instructed

**Important**: The extension will not work until your domain is verified in Resend.

### 3. Deploy the Extension

If the extension is not yet installed:

```bash
# Install the extension
firebase ext:install firebase/firestore-send-email

# When prompted, use the configuration from extensions/firestore-send-email.env
```

If the extension is already installed, update the configuration:

```bash
# Update extension configuration
firebase ext:configure firestore-send-email

# Or manually update via Firebase Console:
# Extensions > firestore-send-email > Configuration
```

### 4. Deploy Cloud Functions

After updating the code, deploy the functions:

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## How It Works

### Email Flow

1. **Cloud Function** creates a document in the `mail` collection
2. **Firebase Extension** detects the new document
3. **Extension** sends email via Resend SMTP
4. **Extension** updates the document with delivery status

### Email Document Structure

```typescript
{
  to: string | string[],
  cc?: string | string[],
  bcc?: string | string[],
  from?: string, // Optional, uses DEFAULT_FROM if not provided
  replyTo?: string, // Optional, uses DEFAULT_REPLY_TO if not provided
  message: {
    subject: string,
    html: string,
    text?: string,
    attachments?: Array<{
      filename: string,
      content?: string, // Base64 encoded
      path?: string, // URL to file
      contentType?: string
    }>
  },
  // Extension adds these fields after processing:
  delivery?: {
    state: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR' | 'RETRY',
    attempts: number,
    startTime?: Timestamp,
    endTime?: Timestamp,
    error?: string,
    info?: {
      messageId: string,
      accepted: string[],
      rejected: string[]
    }
  }
}
```

## Usage in Code

### Client-Side (Web/Mobile)

Use the email utility from `@ppa/firebase`:

```typescript
import { sendEmail, sendAnnouncementEmail } from '@ppa/firebase';

// Simple email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome</h1>',
  text: 'Welcome'
});

// Announcement email
await sendAnnouncementEmail({
  recipientEmails: ['user@example.com'],
  title: 'Team Meeting',
  message: 'We have a meeting tomorrow',
  teamName: 'Basketball Team',
  senderName: 'Coach Smith',
  priority: 'normal'
});
```

### Server-Side (Cloud Functions)

The Cloud Functions automatically send emails for announcements when:
- An announcement is created with `notificationOptions.sendEmail: true`
- The `sendAnnouncementNotifications` callable function is called with `sendEmail: true`

## Email Types

### 1. Announcement Emails

Automatically sent when:
- Announcement created with email notifications enabled
- Includes priority badges (URGENT, IMPORTANT)
- Includes team name and sender name

### 2. Coach Invitation Emails

Use `sendCoachInviteEmail()` from `@ppa/firebase`:
- Sent when inviting a coach to join a team
- Includes team name, inviter name, and invite link

### 3. Plan Share Emails

Use `sendPlanShareEmail()` from `@ppa/firebase`:
- Sent when sharing a practice plan
- Includes plan name, date, and share link

### 4. File Share Emails

Use `sendFileShareEmail()` from `@ppa/firebase`:
- Sent when sharing a file
- Includes file name and download link

### 5. Welcome Emails

Use `sendWelcomeEmail()` from `@ppa/firebase`:
- Sent to new users
- Includes getting started information

## Monitoring

### Check Email Status

Query the `mail` collection to see delivery status:

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

const mailQuery = query(
  collection(db, 'mail'),
  where('delivery.state', '==', 'ERROR')
);
const failedEmails = await getDocs(mailQuery);
```

### Firebase Console

1. Go to **Firestore Database** > `mail` collection
2. View documents to see delivery status
3. Check `delivery.state` and `delivery.error` fields

### Extension Logs

```bash
# View extension logs
firebase functions:log --only firestore-send-email
```

## Troubleshooting

### Emails Not Sending

1. **Check domain verification**: Ensure `practiceplan.app` is verified in Resend
2. **Check API key**: Verify the API key in `extensions/firestore-send-email.env`
3. **Check Firestore rules**: Ensure authenticated users can create documents in `mail` collection
4. **Check extension status**: Go to Firebase Console > Extensions > firestore-send-email
5. **Check delivery status**: Query `mail` collection for documents with `delivery.state: 'ERROR'`

### Common Errors

- **"Domain not verified"**: Add and verify domain in Resend dashboard
- **"Invalid API key"**: Check API key in extension configuration
- **"Permission denied"**: Check Firestore security rules for `mail` collection
- **"SMTP connection failed"**: Check Resend service status

## Testing

### Test Email Sending

1. Create a test document in Firestore Console:
   ```json
   {
     "to": "your-email@example.com",
     "message": {
       "subject": "Test Email",
       "html": "<h1>Test</h1>",
       "text": "Test"
     }
   }
   ```

2. Add to `mail` collection
3. Check email delivery status in the document
4. Verify email received

### Test in Development

Use Firebase Emulators:

```bash
firebase emulators:start --only firestore,functions
```

Note: The extension does not run in emulators. You'll need to test in a deployed environment or use the Resend API directly for local testing.

## Security

### Firestore Rules

The `mail` collection rules allow:
- ✅ Authenticated users can create mail documents
- ❌ No client-side reads/updates/deletes (extension handles this)

### API Key Security

- API key is stored in extension configuration (encrypted by Firebase)
- Never commit API keys to version control
- Rotate keys if compromised

## Next Steps

1. ✅ API key configured
2. ⏳ Verify domain in Resend
3. ⏳ Deploy extension (if not already deployed)
4. ⏳ Deploy updated Cloud Functions
5. ⏳ Test email sending
6. ⏳ Monitor email delivery




