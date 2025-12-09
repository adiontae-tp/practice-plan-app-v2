# Codebase Patterns Reference

Quick lookup for function signatures, naming conventions, and import patterns.

---

## Regex Patterns for Grepping

```bash
# Find files by type
Mobile screens:        src/apps/mobile/app/**/*.tsx
Web pages:             src/apps/web/app/**/page.tsx
Mobile TP components:  src/apps/mobile/components/tp/TP*.tsx
Web modals:            src/apps/web/components/tp/**/*Modal.tsx
Web dialogs:           src/apps/web/components/tp/**/*Dialog.tsx
Web skeletons:         src/apps/web/components/tp/**/*Skeleton.tsx
Zustand slices:        src/packages/store/src/slices/*Slice.ts
UI slices:             src/packages/store/src/slices/*UISlice.ts
Interfaces:            src/packages/interfaces/src/*.ts
Hooks:                 src/apps/*/hooks/use*.ts
Firebase services:     src/packages/firebase/src/*.ts
```

---

## Naming Conventions

| Category | Pattern | Examples |
|----------|---------|----------|
| Mobile screens | `kebab-case.tsx` | `coaches.tsx`, `activity-edit.tsx` |
| Web pages | `feature/page.tsx` | `coaches/page.tsx`, `plan/[id]/page.tsx` |
| Mobile TP components | `TPPascalCase.tsx` | `TPButton.tsx`, `TPBottomSheet.tsx` |
| Web TP components | `FeatureAction.tsx` | `CoachInviteModal.tsx`, `TagsTable.tsx` |
| Data slices | `entitySlice.ts` | `planSlice.ts`, `tagSlice.ts` |
| UI slices | `featureUISlice.ts` | `tagsUISlice.ts`, `filesUISlice.ts` |
| Interfaces | `entity.ts` | `plan.ts`, `coach.ts` |
| Mock data | `entity.ts` → `mockEntitys` | `coach.ts` → `mockCoaches` |

### Web Component Suffixes

| Suffix | Purpose |
|--------|---------|
| `*Modal.tsx` | Create/Edit forms |
| `*Dialog.tsx` | Confirmations (delete, remove) |
| `*Skeleton.tsx` | Loading states |
| `*EmptyState.tsx` | Empty list states |
| `*Table.tsx` | Data tables |
| `*Card.tsx` | Card displays |

---

## Slice Function Signatures

### Common CRUD Pattern (All Data Slices)

```typescript
// State shape
entity: Entity | null
entitys: Entity[]
entitysLoading: boolean
entitysCreating: boolean
entitysUpdating: boolean
entitysDeleting: boolean
entitysError: string | null

// Actions
setEntity(entity: Entity | null): void
setEntitys(entitys: Entity[]): void
createEntity(teamId: string, data: CreateEntityInput): Promise<Entity>
updateEntity(teamId: string, entityId: string, updates: UpdateEntityInput): Promise<void>
deleteEntity(teamId: string, entityId: string): Promise<void>
setEntitysError(error: string | null): void
clearEntitysError(): void
```

### Input Type Pattern

```typescript
CreateEntityInput = Omit<Entity, 'id' | 'ref'>
UpdateEntityInput = Partial<Omit<Entity, 'id' | 'ref'>>
```

### Specific Slice Signatures

#### planSlice
```typescript
// Extra state
selectedPeriodActivities: Activity[]
editingActivity: EditingActivityData | null
selectedTag: Tag | null

// Extra actions
fetchPlan(teamId: string, planId: string): Promise<Plan | null>
fetchPlans(teamId: string, startDate?: Date, endDate?: Date): Promise<Plan[]>
subscribePlans(teamId: string, startDate?: Date, endDate?: Date): () => void  // returns unsubscribe
getPlansInSeries(seriesId: string): Plan[]
updatePlanSeries(teamId: string, seriesId: string, updates: UpdatePlanInput): Promise<void>
deletePlanSeries(teamId: string, seriesId: string): Promise<void>
```

#### fileSlice
```typescript
// Extra state
favoriteFiles: File[]
recentFiles: File[]
uploadProgress: number
storageUsedBytes: number
storageLimitBytes: number

// Extra actions
uploadFile(teamId: string, fileBlob: Blob, metadata: CreateFileInput, progressCallback?: (p: number) => void): Promise<File>
toggleFavorite(teamId: string, fileId: string): Promise<void>
updateLastAccessed(teamId: string, fileId: string): Promise<void>
moveFile(teamId: string, fileId: string, folderId: string | null): Promise<void>
bulkDeleteFiles(teamId: string, fileIds: string[]): Promise<void>
bulkMoveFiles(teamId: string, fileIds: string[], folderId: string | null): Promise<void>
computeFavorites(): void
computeRecentFiles(): void
```

#### folderSlice
```typescript
// Extra state
currentFolderId: string | null
folderPath: Folder[]

// Extra actions
navigateToFolder(folderId: string | null): void
navigateUp(): void
getFolderById(folderId: string): Folder | undefined
getChildFolders(parentId: string | null): Folder[]
getFolderBreadcrumbs(folderId: string): Folder[]
moveFolder(teamId: string, folderId: string, newParentId: string | null): Promise<void>
```

#### subscriptionSlice
```typescript
// State
subscription: { tier, entitlement, source, isActive, expiresAt, willRenew, lastVerified }
offerings: PackageOffering[]
subscriptionShowPaywall: boolean
subscriptionPaywallFeature: string | null

// Actions
setSubscriptionFromCustomerInfo(customerInfo: CustomerInfo): void
cacheSubscription(userId: string): void
loadCachedSubscription(userId: string): boolean
fetchSubscriptionViaApi(userId: string): Promise<void>
refreshSubscriptionIfStale(userId: string, maxAgeMs?: number): Promise<boolean>
showPaywall(feature?: string): void
hidePaywall(): void
```

#### authSlice
```typescript
signUpUser(email: string, password: string, displayName?: string): Promise<void>
signInUser(email: string, password: string): Promise<void>
logoutUser(): Promise<void>
resetPassword(email: string): Promise<void>
updateProfile(displayName?: string, photoURL?: string): Promise<void>
updateEmail(newEmail: string): Promise<void>
updatePassword(newPassword: string): Promise<void>
initializeAuth(): void
```

### UI Slice Pattern

All UI slices follow this pattern:
```typescript
// State (all prefixed with feature name)
[feature]SearchQuery: string
[feature]ShowCreateModal: boolean
[feature]ShowEditModal: boolean
[feature]ShowDeleteAlert: boolean
[feature]Selected[Entity]: Entity | null
[feature]Form[Field]: string | number | type[]
[feature]IsLoading: boolean

// Actions
set[Feature]SearchQuery(query: string): void
set[Feature]ShowCreateModal(show: boolean): void
// ... setter for each state field
reset[Feature]UI(): void
```

---

## Package Exports

### @ppa/store
```typescript
// Hooks (runtime)
useAppStore        // Main store hook
useAppInit         // App initialization
useLazyFiles       // Lazy load files
useLazyFolders     // Lazy load folders
useLazyAnnouncements // Lazy load announcements
```

### @ppa/interfaces
```typescript
// Types only - no runtime exports
User, Team, Plan, Activity, Period, Template, Tag
Coach, CoachPermission, CoachStatus
File, FileCategory, FileType, Folder, FileVersion, FileShare
Announcement, AnnouncementPriority
```

### @ppa/mock
```typescript
// Runtime mock data
mockUser, mockTeam, mockPlan, mockPlans
mockPeriod, mockPeriods, mockTemplate, mockTemplates
mockTag, mockTags, mockCoach, mockCoaches
mockFiles, mockAnnouncements, mockCalendarPlans, mockActivity

// Types
MockPlan, MockFile, MockCoachWithDetails, MockAnnouncement
```

### @ppa/ui/branding
```typescript
COLORS             // Color palette
HEADER_STYLE       // Header styling constants
TAB_BAR_STYLE      // Tab bar styling constants
lightTheme, darkTheme, themeConfig
```

### Mobile TP Components (@/components/tp)
```typescript
// Layout
TPScreen, TPContainer, TPHeader, TPCard, TPKeyboardAvoidingView

// Forms
TPInput, TPTextarea, TPSelect, TPCheckbox, TPButton, TPFooterButtons
TPDatePicker, TPTimePicker, TPSwitch, TPSlider, TPSegmentedControl
TPRichTextEditor, TPRichTextDisplay

// Lists & Data
TPList, TPEmpty, TPLoading, TPSearch, TPTag, TPAvatar, TPDivider, TPPeriodCard

// Feedback
TPAlert, TPProgress, TPGauge, TPBadge, TPCountBadge, TPToast, useToast

// Actions
TPFab, TPBottomSheet, BottomSheetScrollView, TPActionSheet, TPContextMenu

// Subscription
TPPermissionGuard, TPPaywall, TPUpgradeBanner, TPSubscriptionBanner
```

### Web TP Components (@/components/tp)
```typescript
TPAppShell, TPHeader, TPSidebar, TPPaywall
TPRichTextEditor, TPRichTextDisplay
```

---

## Import Patterns

### Typical Mobile Screen
```typescript
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import type { Tag } from '@ppa/interfaces';
import { TPButton, TPFooterButtons, useToast } from '@/components/tp';
```

### Typical Web Page
```typescript
'use client';
import { useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle } from 'lucide-react';
import { useAppStore } from '@ppa/store';
import type { Tag } from '@ppa/interfaces';
import { Button, Dialog, Input } from '@/components/ui';
import { TagsTable, TagCreateModal, TagDeleteDialog } from '@/components/tp/tags';
```

### Package Dependency Chain
```
Screen/Page
├── @ppa/store (state)
├── @ppa/interfaces (types)
├── @ppa/ui/branding (design tokens)
├── @ppa/firebase (persistence)
├── @ppa/subscription (tier logic)
├── @/components/tp/* (UI components)
└── lucide-react(-native) (icons)
```

---

## File Organization

### Web TP Component Folders
Each feature has its own folder with consistent file names:
```
src/apps/web/components/tp/
├── tags/
│   ├── index.ts              # Re-exports all
│   ├── TagsTable.tsx
│   ├── TagCreateModal.tsx
│   ├── TagEditModal.tsx
│   ├── TagDeleteDialog.tsx
│   └── TagsPageSkeleton.tsx
├── coaches/
│   ├── CoachesTable.tsx
│   ├── CoachInviteModal.tsx
│   └── ...
```

### Slice Files
```
src/packages/store/src/slices/
├── index.ts                  # Re-exports all creators and types
├── appSlice.ts               # App initialization, subscriptions
├── authSlice.ts              # Authentication
├── userSlice.ts              # User CRUD
├── teamSlice.ts              # Team CRUD
├── planSlice.ts              # Plan CRUD + series
├── periodSlice.ts            # Period CRUD
├── templateSlice.ts          # Template CRUD
├── tagSlice.ts               # Tag CRUD
├── coachSlice.ts             # Coach CRUD
├── fileSlice.ts              # File CRUD + upload
├── folderSlice.ts            # Folder CRUD + navigation
├── announcementSlice.ts      # Announcement CRUD
├── subscriptionSlice.ts      # Subscription state
├── adminSlice.ts             # Admin/impersonation
├── tagsUISlice.ts            # Tags screen UI state
├── coachesUISlice.ts         # Coaches screen UI state
├── filesUISlice.ts           # Files screen UI state
├── calendarUISlice.ts        # Calendar UI state
├── periodsUISlice.ts         # Periods screen UI state
├── templatesUISlice.ts       # Templates screen UI state
├── announcementsUISlice.ts   # Announcements screen UI state
├── reportsUISlice.ts         # Reports UI state
├── profileUISlice.ts         # Profile screen UI state
└── pdfUISlice.ts             # PDF generation UI state
```
