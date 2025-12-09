# Data Models

All TypeScript interfaces are defined in `@ppa/interfaces` (`src/packages/interfaces/`).

## Core Entities

### User

Represents an authenticated user in the system.

```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  fname: string;                  // First name
  lname: string;                  // Last name
  isAdmin: string;                // Admin status
  tpNews: number;                 // Newsletter subscription
  entitlement: number;            // RevenueCat entitlement level
  stripeEntitlement: number;      // Stripe entitlement level
  created: number;                // Timestamp
  modified: number;               // Timestamp
  path: string;                   // Firestore path
  teamRef: DocumentReference;     // Reference to user's team
  ref: DocumentReference;         // Self reference

  // Migration flags
  dataMigrated?: boolean;
  migratedAt?: number;

  // Notification preferences
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  expoPushToken?: string;
  fcmToken?: string;

  // Profile
  photoUrl?: string;
}
```

### Team

Represents a coaching team/organization.

```typescript
interface Team {
  id?: string;
  uid?: string;
  ref: DocumentReference;
  name: string;                   // Team name
  sport: string;                  // Sport type
  path: string;                   // Firestore path
  col: string;                    // Collection name
  headCoach: DocumentReference;   // Reference to head coach

  // Branding
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  fontUrl?: string;
  fontName?: string;
}
```

### Plan

Represents a practice plan for a specific date/time.

```typescript
interface Plan {
  id: string;
  uid: string;
  ref: DocumentReference;
  startTime: number;              // Unix timestamp
  endTime: number;                // Unix timestamp
  duration: number;               // Total duration in minutes
  activities: Activity[];         // Ordered list of activities/periods
  tags: DocumentReference[] | Tag[];
  notes?: string;
  readonly: boolean;
  col: string;

  // Sharing
  shareToken?: string;
  shareEnabled?: boolean;
}
```

### Activity

Represents a single period/activity within a practice plan.

> **UI Note**: In the interface this is called `Activity`, but in the UI it should always be displayed as "period".

```typescript
interface Activity {
  id: string;
  name: string;                   // Activity/period name
  startTime: number;              // Unix timestamp
  endTime: number;                // Unix timestamp
  duration: number;               // Duration in minutes
  notes: string;
  tags: DocumentReference[] | Tag[];
}
```

### Period

Represents a reusable period in the period library.

```typescript
interface Period {
  id: string;
  name: string;
  duration: number;               // Duration in minutes
  notes: string;
  added: boolean;                 // Whether added to current plan
  col: string;
  tags: string[];                 // Tag IDs
  ref: DocumentReference;
}
```

### Template

Represents a reusable practice plan template.

```typescript
interface Template {
  id: string;
  ref: DocumentReference;
  name: string;
  duration: any;                  // Total duration
  col: string;
  activities: Activity[];         // Pre-defined activities
  tags: DocumentReference[] | Tag[];
}
```

### Tag

Represents a categorization tag for activities and periods.

```typescript
interface Tag {
  id: string;
  ref: DocumentReference;
  name: string;
  path: string;
  col: string;
}
```

## Team Collaboration

### Coach

Represents a coach invited to collaborate on a team.

```typescript
type CoachPermission = 'admin' | 'edit' | 'view';
type CoachStatus = 'active' | 'invited' | 'inactive';

interface Coach {
  id: string;
  email: string;
  ref: DocumentReference;
  col: string;
  permission?: CoachPermission;
  status?: CoachStatus;
  invitedAt?: number;
  joinedAt?: number;
}
```

**Permission Levels**:
- `admin`: Full access, can manage team settings and coaches
- `edit`: Can create/edit plans, periods, templates
- `view`: Read-only access to team content

**Status Values**:
- `invited`: Invitation sent, not yet accepted
- `active`: Actively participating
- `inactive`: Disabled/removed

### Announcement

Represents a team announcement/message.

```typescript
type AnnouncementPriority = 'low' | 'medium' | 'high';

interface NotificationOptions {
  sendPush: boolean;
  sendEmail: boolean;
}

interface Announcement {
  id: string;
  ref: DocumentReference;
  col: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  createdAt: number;
  createdBy: string;              // User ID of creator
  readBy?: string[];              // User IDs who have read
  notificationsSent?: boolean;
  notificationOptions?: NotificationOptions;
  isPinned?: boolean;
  scheduledAt?: number;           // For scheduled announcements
}
```

## File Management

### Folder

Represents a folder for organizing files.

```typescript
interface Folder {
  id: string;
  ref: DocumentReference;
  col: string;
  name: string;
  parentId: string | null;        // null = root folder
  teamId: string;
  createdAt: number;
  createdBy: string;
  updatedAt?: number;
}
```

### File

Represents an uploaded file.

```typescript
type FileCategory = 'playbook' | 'roster' | 'schedule' | 'media' | 'other';
type FileType = 'pdf' | 'image' | 'document' | 'video' | 'audio' | 'other';

interface File {
  id: string;
  ref: DocumentReference;
  col: string;
  name: string;
  type: FileType;
  category: FileCategory;
  size: number;                   // File size in bytes
  url: string;                    // Download URL
  uploadedAt: number;
  uploadedBy: string;
  description?: string;
  folderId?: string | null;       // null = root
  currentVersionId?: string;
  versionCount: number;
  tags: string[];                 // Tag IDs
  isFavorite: boolean;
  lastAccessedAt?: number;
}
```

### FileVersion

Represents a version of a file (for version history).

```typescript
interface FileVersion {
  id: string;
  ref: DocumentReference;
  col: string;
  fileId: string;
  versionNumber: number;
  url: string;
  size: number;
  uploadedAt: number;
  uploadedBy: string;
  note?: string;                  // Version notes
}
```

### FileShare

Represents sharing settings for a file.

```typescript
type ShareType = 'link' | 'member';
type SharePermission = 'view' | 'download' | 'edit';

interface FileShare {
  id: string;
  ref: DocumentReference;
  col: string;
  fileId: string;
  type: ShareType;
  targetId?: string;              // User/team ID (for member shares)
  targetEmail?: string;
  permission: SharePermission;
  expiresAt?: number;
  password?: string;              // For password-protected links
  accessCount: number;
  createdAt: number;
  createdBy: string;
}
```

## Entity Relationships

```
User
 ├── owns → Team (as headCoach)
 └── member of → Team (as Coach)

Team
 ├── has many → Coach
 ├── has many → Plan
 ├── has many → Period
 ├── has many → Template
 ├── has many → Tag
 ├── has many → File
 ├── has many → Folder
 └── has many → Announcement

Plan
 ├── has many → Activity (embedded)
 └── has many → Tag (references)

Activity
 └── has many → Tag (references)

Period
 └── has many → Tag (IDs)

Template
 ├── has many → Activity (embedded)
 └── has many → Tag (references)

File
 ├── belongs to → Folder (optional)
 ├── has many → FileVersion
 ├── has many → FileShare
 └── has many → Tag (IDs)
```

## Common Fields

Most entities share these Firebase-related fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `ref` | DocumentReference | Firestore document reference |
| `col` | string | Collection path |
| `path` | string | Full document path |

## Timestamps

Timestamps are stored as Unix timestamps (milliseconds):

```typescript
const timestamp = Date.now();     // Current time
const date = new Date(timestamp); // Convert to Date
```

## Mock Data

Mock data following these interfaces is available in `@ppa/mock`:

```typescript
import {
  mockUsers,
  mockTeams,
  mockPlans,
  mockPeriods,
  mockTemplates,
  mockTags,
  mockCoaches,
  mockFiles,
  mockAnnouncements
} from '@ppa/mock';
```
