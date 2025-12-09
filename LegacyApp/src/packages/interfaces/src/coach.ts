import { DocumentReference } from 'firebase/firestore';

export type CoachPermission = 'admin' | 'edit' | 'view';
export type CoachStatus = 'active' | 'invited' | 'inactive';

export interface Coach {
  id: string;
  email: string;
  ref: DocumentReference;
  col: string;
  userId?: string; // User ID - used as document ID for active coaches
  permission?: CoachPermission;
  status?: CoachStatus;
  invitedAt?: number;
  joinedAt?: number;
}
