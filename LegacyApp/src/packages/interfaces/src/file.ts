import { DocumentReference } from 'firebase/firestore';

export type FileCategory = 'playbook' | 'roster' | 'schedule' | 'media' | 'other';
export type FileType = 'pdf' | 'image' | 'document' | 'video' | 'audio' | 'other';
export type ShareType = 'link' | 'member';
export type SharePermission = 'view' | 'download' | 'edit';

export interface Folder {
  id: string;
  ref: DocumentReference;
  col: string;
  name: string;
  parentId: string | null;
  teamId: string;
  createdAt: number;
  createdBy: string;
  updatedAt?: number;
}

export interface FileVersion {
  id: string;
  ref: DocumentReference;
  col: string;
  fileId: string;
  versionNumber: number;
  url: string;
  size: number;
  uploadedAt: number;
  uploadedBy: string;
  note?: string;
}

export interface FileShare {
  id: string;
  ref: DocumentReference;
  col: string;
  fileId: string;
  type: ShareType;
  targetId?: string;
  targetEmail?: string;
  permission: SharePermission;
  expiresAt?: number;
  password?: string;
  accessCount: number;
  createdAt: number;
  createdBy: string;
}

export interface File {
  id: string;
  ref: DocumentReference;
  col: string;
  name: string;
  type: FileType;
  category: FileCategory;
  size: number;
  url: string;
  uploadedAt: number;
  uploadedBy: string;
  description?: string;
  folderId?: string | null;
  currentVersionId?: string;
  versionCount: number;
  tags: string[];
  isFavorite: boolean;
  lastAccessedAt?: number;
}
