import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';

// ============================================================================
// EMAIL TYPES
// ============================================================================

/**
 * Email message structure for the Firestore Send Email extension
 */
export interface EmailMessage {
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content?: string; // Base64 encoded content
  path?: string; // URL to file
  contentType?: string;
}

export interface EmailDocument {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
  replyTo?: string;
  message: EmailMessage;
  // Extension adds these fields after processing
  delivery?: {
    state: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR' | 'RETRY';
    attempts: number;
    startTime?: Timestamp;
    endTime?: Timestamp;
    error?: string;
    info?: {
      messageId: string;
      accepted: string[];
      rejected: string[];
    };
  };
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
}

// ============================================================================
// EMAIL COLLECTION
// ============================================================================

const MAIL_COLLECTION = 'mail';

// BCC email for all outgoing emails
const ADMIN_BCC_EMAIL = 'adiontae.gerron@gmail.com';

// ============================================================================
// SEND EMAIL FUNCTIONS
// ============================================================================

/**
 * Send an email by adding a document to the mail collection
 * The Firebase extension will pick it up and send via SendGrid
 */
export async function sendEmail(options: SendEmailOptions): Promise<string> {
  const message: EmailMessage = {
    subject: options.subject,
  };

  if (options.html) message.html = options.html;
  if (options.text) message.text = options.text;
  if (options.attachments && options.attachments.length > 0) {
    message.attachments = options.attachments;
  }

  const emailDoc: Omit<EmailDocument, 'delivery'> = {
    to: options.to,
    message,
  };

  if (options.cc) emailDoc.cc = options.cc;
  
  // Always BCC admin email, merge with any existing BCC
  const bccList = Array.isArray(options.bcc) ? options.bcc : options.bcc ? [options.bcc] : [];
  if (!bccList.includes(ADMIN_BCC_EMAIL)) {
    bccList.push(ADMIN_BCC_EMAIL);
  }
  emailDoc.bcc = bccList.length === 1 ? bccList[0] : bccList;
  
  if (options.replyTo) emailDoc.replyTo = options.replyTo;

  const docRef = await addDoc(collection(db, MAIL_COLLECTION), emailDoc);
  return docRef.id;
}

// ============================================================================
// COACH INVITATION EMAILS
// ============================================================================

export interface CoachInviteEmailParams {
  recipientEmail: string;
  teamName: string;
  inviterName: string;
  inviteLink?: string;
}

/**
 * Send a coach invitation email
 */
export async function sendCoachInviteEmail(params: CoachInviteEmailParams): Promise<string> {
  const { recipientEmail, teamName, inviterName, inviteLink } = params;

  const appStoreLink = 'https://apps.apple.com/app/practice-plan/id123456789'; // TODO: Update with real link
  const downloadLink = inviteLink || appStoreLink;

  return sendEmail({
    to: recipientEmail,
    subject: `You've been invited to join ${teamName} on Practice Plan`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #356793; margin-bottom: 24px;">You're Invited!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> on Practice Plan.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Practice Plan helps coaches create, organize, and share practice plans with their team.
        </p>
        <div style="margin: 32px 0;">
          <a href="${downloadLink}" style="background-color: #356793; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Get Started
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">
          If you already have the app, simply sign in with this email address to access your team.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 12px; color: #999;">
          This email was sent by Practice Plan. If you didn't expect this invitation, you can safely ignore it.
        </p>
      </div>
    `,
    text: `
You're Invited!

${inviterName} has invited you to join ${teamName} on Practice Plan.

Practice Plan helps coaches create, organize, and share practice plans with their team.

Get started: ${downloadLink}

If you already have the app, simply sign in with this email address to access your team.
    `.trim(),
  });
}

// ============================================================================
// PLAN SHARING EMAILS
// ============================================================================

export interface PlanShareEmailParams {
  recipientEmail: string;
  planName: string;
  planDate?: string;
  sharedByName: string;
  shareLink: string;
}

/**
 * Send an email when a practice plan is shared
 */
export async function sendPlanShareEmail(params: PlanShareEmailParams): Promise<string> {
  const { recipientEmail, planName, planDate, sharedByName, shareLink } = params;

  const dateText = planDate ? ` for ${planDate}` : '';

  return sendEmail({
    to: recipientEmail,
    subject: `Practice Plan Shared: ${planName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #356793; margin-bottom: 24px;">Practice Plan Shared</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          <strong>${sharedByName}</strong> has shared a practice plan with you.
        </p>
        <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h2 style="margin: 0 0 8px 0; color: #333; font-size: 18px;">${planName}</h2>
          ${planDate ? `<p style="margin: 0; color: #666; font-size: 14px;">${planDate}</p>` : ''}
        </div>
        <div style="margin: 32px 0;">
          <a href="${shareLink}" style="background-color: #356793; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            View Practice Plan
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 12px; color: #999;">
          This email was sent by Practice Plan.
        </p>
      </div>
    `,
    text: `
Practice Plan Shared

${sharedByName} has shared a practice plan with you.

${planName}${dateText}

View the plan: ${shareLink}
    `.trim(),
  });
}

// ============================================================================
// ANNOUNCEMENT EMAILS
// ============================================================================

export interface AnnouncementEmailParams {
  recipientEmails: string[];
  title: string;
  message: string;
  teamName: string;
  senderName: string;
  priority?: 'normal' | 'high' | 'urgent';
}

/**
 * Send announcement notification emails to team members
 */
export async function sendAnnouncementEmail(params: AnnouncementEmailParams): Promise<string> {
  const { recipientEmails, title, message, teamName, senderName, priority } = params;

  const priorityBadge = priority === 'urgent'
    ? '<span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">URGENT</span>'
    : priority === 'high'
    ? '<span style="background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">IMPORTANT</span>'
    : '';

  return sendEmail({
    to: recipientEmails,
    subject: `${priority === 'urgent' ? '[URGENT] ' : priority === 'high' ? '[Important] ' : ''}${teamName}: ${title}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="margin-bottom: 16px;">
          ${priorityBadge}
        </div>
        <h1 style="color: #356793; margin-bottom: 8px; font-size: 24px;">${title}</h1>
        <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
          From ${senderName} • ${teamName}
        </p>
        <div style="font-size: 16px; line-height: 1.6; color: #333;">
          ${message.replace(/\n/g, '<br />')}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 12px; color: #999;">
          This announcement was sent via Practice Plan. Open the app to view and respond.
        </p>
      </div>
    `,
    text: `
${priority === 'urgent' ? '[URGENT] ' : priority === 'high' ? '[Important] ' : ''}${title}

From ${senderName} • ${teamName}

${message}

---
This announcement was sent via Practice Plan. Open the app to view and respond.
    `.trim(),
  });
}

// ============================================================================
// WELCOME EMAIL
// ============================================================================

export interface WelcomeEmailParams {
  recipientEmail: string;
  userName: string;
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<string> {
  const { recipientEmail, userName } = params;

  return sendEmail({
    to: recipientEmail,
    subject: 'Welcome to Practice Plan!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #356793; margin-bottom: 24px;">Welcome to Practice Plan!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hi ${userName},
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for joining Practice Plan! We're excited to help you create better practice plans for your team.
        </p>
        <h2 style="color: #356793; font-size: 18px; margin-top: 32px;">Getting Started</h2>
        <ul style="font-size: 16px; line-height: 1.8; color: #333;">
          <li>Create your first practice plan</li>
          <li>Add periods and activities</li>
          <li>Invite your coaching staff</li>
          <li>Share plans with your team</li>
        </ul>
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 24px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 12px; color: #999;">
          Practice Plan - Plan Better, Practice Better
        </p>
      </div>
    `,
    text: `
Welcome to Practice Plan!

Hi ${userName},

Thank you for joining Practice Plan! We're excited to help you create better practice plans for your team.

Getting Started:
- Create your first practice plan
- Add periods and activities
- Invite your coaching staff
- Share plans with your team

If you have any questions, feel free to reach out to our support team.

---
Practice Plan - Plan Better, Practice Better
    `.trim(),
  });
}

// ============================================================================
// FILE SHARE EMAILS
// ============================================================================

export interface FileShareEmailParams {
  recipientEmail: string;
  fileName: string;
  sharedByName: string;
  shareLink: string;
  expiresAt?: string;
}

/**
 * Send an email when a file is shared
 */
export async function sendFileShareEmail(params: FileShareEmailParams): Promise<string> {
  const { recipientEmail, fileName, sharedByName, shareLink, expiresAt } = params;

  return sendEmail({
    to: recipientEmail,
    subject: `${sharedByName} shared a file with you: ${fileName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #356793; margin-bottom: 24px;">File Shared</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          <strong>${sharedByName}</strong> has shared a file with you.
        </p>
        <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; font-weight: 600; color: #333;">${fileName}</p>
          ${expiresAt ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">Expires: ${expiresAt}</p>` : ''}
        </div>
        <div style="margin: 32px 0;">
          <a href="${shareLink}" style="background-color: #356793; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Download File
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 12px; color: #999;">
          This email was sent by Practice Plan.
        </p>
      </div>
    `,
    text: `
File Shared

${sharedByName} has shared a file with you.

File: ${fileName}
${expiresAt ? `Expires: ${expiresAt}` : ''}

Download: ${shareLink}
    `.trim(),
  });
}
