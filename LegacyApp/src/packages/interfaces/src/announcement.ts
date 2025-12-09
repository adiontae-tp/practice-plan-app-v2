import { DocumentReference } from 'firebase/firestore';

export type AnnouncementPriority = 'low' | 'medium' | 'high';

export interface NotificationOptions {
  sendPush: boolean;
  sendEmail: boolean;
}

export interface Announcement {
  id: string;
  ref: DocumentReference;
  col: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  createdAt: number;
  createdBy: string;
  readBy?: string[];
  notificationsSent?: boolean;
  notificationOptions?: NotificationOptions;
  isPinned?: boolean;
  scheduledAt?: number;
}
