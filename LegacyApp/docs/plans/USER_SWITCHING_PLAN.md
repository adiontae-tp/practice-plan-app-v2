# User Switching / Admin Impersonation Feature

## Overview
Add ability for admin (adiontae.gerron@gmail.com) to switch between real Firestore users and trigger migration flows for old project users.

## Requirements
- **Platforms:** Mobile + Web
- **User Source:** Real users from Firestore
- **Access:** Restricted to adiontae.gerron@gmail.com only
- **Migration:** Ability to trigger migration for old project users and require password reset

---

## Architecture

### 1. Admin Access Control

**New file:** `src/packages/firebase/src/admin.ts`
```
- ADMIN_EMAIL constant = 'adiontae.gerron@gmail.com'
- isAdmin(email: string): boolean
- useIsAdmin() hook for components
```

### 2. User Switching Service

**New file:** `src/packages/firebase/src/userSwitching.ts`
```
- fetchAllUsers(): Promise<User[]> - Get all users from Firestore
- fetchUsersByEmail(email: string): Promise<User[]> - Search users
- checkUserInOldProject(email: string): Promise<boolean>
- triggerMigrationForUser(email: string): Promise<MigrationResult>
- switchToUser(targetUser: User): Promise<void>
  - Does NOT change Firebase Auth (stays logged in as admin)
  - Overrides Zustand store with target user's data
  - Subscribes to target user's team data
```

### 3. Store Changes

**New file:** `src/packages/store/src/slices/adminSlice.ts`
```
State:
- isImpersonating: boolean
- impersonatedUser: User | null
- originalUser: User | null (admin's real user)
- availableUsers: User[]
- usersLoading: boolean
- userSearch: string

Actions:
- fetchAvailableUsers()
- searchUsers(query: string)
- startImpersonation(targetUser: User)
- stopImpersonation()
- resetAdminState()
```

### 4. Context Changes

**Mobile:** Update `DataContext.tsx`
- When impersonating, subscribe to impersonated user's team
- Keep track of original subscriptions to restore later
- Add `isImpersonating` check to prevent accidental data writes

**Web:** Update data fetching hooks similarly

---

## UI Components

### Mobile

**New screen:** `src/apps/mobile/app/(main)/admin/index.tsx`
- User list with search
- Each user shows: email, name, team name
- Badge for "Old Project" users
- Tap user → confirmation modal → switch
- "Trigger Migration" button for old project users
- "Stop Impersonating" floating button when active

**Access point:** Add "Admin" option in profile/menu (only visible to admin)

### Web

**New page:** `src/apps/web/app/admin/page.tsx`
- Similar user list with search
- Table view with columns: Email, Name, Team, Status, Actions
- Actions: "Switch", "Trigger Migration" (for old users)
- Banner at top when impersonating with "Exit" button

**Access point:** Add "Admin" link in sidebar (only visible to admin)

---

## Implementation Steps

### Phase 1: Foundation
1. Create `admin.ts` with admin check utilities
2. Create `adminSlice.ts` in Zustand store
3. Create `userSwitching.ts` service

### Phase 2: Data Layer
4. Update `DataContext.tsx` to support impersonation mode
5. Add impersonation-aware guards to prevent writes when impersonating
6. Test switching between users works correctly

### Phase 3: Mobile UI
7. Create admin screen with user list
8. Add search functionality
9. Add switch confirmation modal
10. Add "Stop Impersonating" UI
11. Add admin menu access point

### Phase 4: Web UI
12. Create admin page with user table
13. Add search and actions
14. Add impersonation banner
15. Add admin sidebar link

### Phase 5: Migration Integration
16. Add "Check Old Project" functionality
17. Add "Trigger Migration" button for old users
18. Show migration status/results
19. Handle password reset requirement flag

---

## Security Considerations

1. **Admin check on every sensitive operation**
   - Verify email matches before showing UI
   - Verify email matches before allowing switch
   - Double-check on server if adding cloud functions later

2. **Read-only impersonation (optional safeguard)**
   - Consider making impersonation read-only
   - Prevent creating/updating/deleting data as impersonated user
   - Show warning banner: "Viewing as [user] - Read Only"

3. **Audit logging (future)**
   - Log when admin switches users
   - Log when migration triggered

---

## Files to Create/Modify

### New Files
- `src/packages/firebase/src/admin.ts`
- `src/packages/firebase/src/userSwitching.ts`
- `src/packages/store/src/slices/adminSlice.ts`
- `src/apps/mobile/app/(main)/admin/index.tsx`
- `src/apps/mobile/app/(main)/admin/_layout.tsx`
- `src/apps/web/app/admin/page.tsx`

### Modified Files
- `src/packages/store/src/store.ts` - Add adminSlice
- `src/packages/store/src/slices/index.ts` - Export adminSlice
- `src/apps/mobile/contexts/DataContext.tsx` - Impersonation support
- `src/apps/mobile/app/(main)/profile.tsx` - Add admin link
- `src/apps/web/components/tp/TPSidebar.tsx` - Add admin link

---

## Migration Flow Detail

When admin clicks "Trigger Migration" for an old project user:

1. Verify user exists in old project (`userExistsInOldProject`)
2. Check if already migrated to new project
3. If not migrated:
   - Create user in new project (generate temp password)
   - Copy all Firestore data (user doc, team, subcollections)
   - Copy all Storage files
   - Mark user for password reset
   - Send password reset email
4. Show success/error result
5. Update user list to reflect new status

---

## Testing Checklist

- [ ] Admin check works (only adiontae.gerron@gmail.com sees menu)
- [ ] User list loads all Firestore users
- [ ] Search filters users correctly
- [ ] Switching to user loads their team data
- [ ] Original user data preserved during impersonation
- [ ] "Stop Impersonating" restores original user
- [ ] Old project check works
- [ ] Migration trigger works
- [ ] Password reset email sent after migration
- [ ] Works on mobile
- [ ] Works on web
