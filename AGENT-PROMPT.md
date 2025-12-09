# Practice Plan App Migration - Agent Instructions

## Your Mission

You are tasked with migrating pages from the Legacy Practice Plan App to the new v10 architecture. This is a multi-agent coordinated effort to rebuild the entire app in a unified Expo codebase.

## 🎯 Getting Started (Required Reading)

**Before you begin, read these files IN ORDER:**

1. **`practice-plan-app/claude.md`** - Complete technical guide (architecture, patterns, conventions)
2. **`MIGRATION-CHECKLIST.md`** - Track your work and see what's available
3. **`practice-plan-app/PROGRESS.md`** - Overall project status and context

## 📁 Project Structure

```
ppa-root/
├── LegacyApp/                    # OLD APP (reference only)
│   └── src/
│       └── apps/
│           ├── mobile/           # Legacy mobile app (Expo)
│           └── web/              # Legacy web app (Next.js)
│
└── practice-plan-app/            # NEW APP (where you work)
    ├── app/                      # Routes (Expo Router)
    │   ├── *.tsx                 # Mobile pages
    │   └── *.web.tsx             # Web pages
    ├── components/
    │   ├── native/               # Mobile components (Gluestack)
    │   └── web/desktop/          # Web components (shadcn/ui)
    └── lib/
        ├── store/                # Zustand state management
        ├── interfaces/           # TypeScript types
        └── firebase/             # Backend services
```

## 🚀 How to Claim and Complete Work

### Step 1: Check What's Available
1. Open `MIGRATION-CHECKLIST.md`
2. Look at the **"Active Work"** table to see what's being worked on
3. Scroll down to find pages with status:
   - 📋 **Placeholder** - Has route file, needs implementation
   - ⏸️ **Not Started** - Needs route file + implementation

### Step 2: Claim Your Work
1. Choose a page from the checklist (prioritize Phase 1-3)
2. Add an entry to the **"Active Work"** table:
   ```
   | Login Page | Mobile | Agent-[YOUR-ID] | 2024-12-09 | Starting implementation | None |
   ```
3. Change the page status in the detailed section from 📋/⏸️ to 🔄

### Step 3: Reference the Legacy Implementation
1. Find the legacy page in `LegacyApp/src/apps/mobile/` or `LegacyApp/src/apps/web/`
2. Study the UI, functionality, and data flow
3. Look for existing components you can reuse
4. Check `lib/interfaces/` for the data structures you'll need

### Step 4: Implement the Page

**For Mobile Pages (*.tsx):**
```tsx
// app/example.tsx
import { View, Text } from 'react-native';
import { Button, ButtonText } from '@/components/native/button';
import { useAppStore } from '@/lib/store';

export default function ExampleScreen() {
  const data = useAppStore(state => state.someData);

  return (
    <View>
      <Text>Mobile Implementation</Text>
      <Button>
        <ButtonText>Click Me</ButtonText>
      </Button>
    </View>
  );
}
```

**For Web Pages (*.web.tsx):**
```tsx
// app/example.web.tsx
import { Button } from '@/components/web/desktop/button';
import { useAppStore } from '@/lib/store';

export default function ExamplePage() {
  const data = useAppStore(state => state.someData);

  return (
    <div>
      <h1>Web Implementation</h1>
      <Button>Click Me</Button>
    </div>
  );
}
```

**CRITICAL RULES:**
- ✅ Use `@/components/native/*` for mobile (React Native components)
- ✅ Use `@/components/web/desktop/*` for web (HTML elements)
- ✅ Use `@/lib/store` for state management
- ✅ Follow the patterns in `practice-plan-app/claude.md`
- ❌ NEVER mix React Native components in `.web.tsx` files
- ❌ NEVER use `View`, `Text` in web files (use `div`, `h1`, `p`, etc.)

### Step 5: Update Your Status
Update your row in the Active Work table as you progress:
```
| Login Page | Mobile | Agent-123 | 2024-12-09 | UI complete, adding validation | Need auth slice |
```

### Step 6: Mark as Complete
When finished:
1. Remove your entry from the **Active Work** table
2. Add an entry to the **Completed Work Log**:
   ```
   | Login Page | Mobile | Agent-123 | 2024-12-09 | Fully functional, tested on iOS |
   ```
3. Change page status from 🔄 to ✅ in the detailed section
4. Update the progress statistics at the top

## 🎨 UI Implementation Guidelines

### Mobile (Native)
- **Base Components:** Gluestack UI v3
- **Location:** `components/native/`
- **Styling:** NativeWind (Tailwind for React Native)
- **Icons:** lucide-react-native
- **Example:**
  ```tsx
  import { Button, ButtonText } from '@/components/native/button';
  import { Card } from '@/components/native/card';
  ```

### Web (Desktop)
- **Base Components:** shadcn/ui + Radix UI
- **Location:** `components/web/desktop/`
- **Styling:** Standard Tailwind CSS
- **Icons:** lucide-react
- **Example:**
  ```tsx
  import { Button } from '@/components/web/desktop/button';
  import { Card } from '@/components/web/desktop/card';
  ```

## 📦 State Management Pattern

All pages should use the Zustand store:

```tsx
import { useAppStore } from '@/lib/store';

export default function MyPage() {
  // Access state
  const items = useAppStore(state => state.items);
  const isLoading = useAppStore(state => state.isLoading);

  // Access actions
  const fetchItems = useAppStore(state => state.fetchItems);
  const setSearchQuery = useAppStore(state => state.setItemsSearchQuery);

  // Use in component
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (/* your UI */);
}
```

## 🔥 Firebase Integration

Backend services are in `lib/firebase/`:
- `auth.ts` - Authentication
- `firestore.ts` - Database operations
- `storage.ts` - File storage
- `notifications.ts` - Push notifications

## ✅ Definition of Done

A page is considered complete when:
- [ ] Mobile version implemented (if applicable)
- [ ] Web version implemented (if applicable)
- [ ] Uses correct component library for platform
- [ ] Integrates with Zustand store correctly
- [ ] Matches Legacy app functionality
- [ ] Follows patterns in `claude.md`
- [ ] No TypeScript errors
- [ ] Tested on target platform (iOS/Android/Web)
- [ ] Status updated in `MIGRATION-CHECKLIST.md`
- [ ] Entry added to Completed Work Log

## 🚨 Common Pitfalls to Avoid

1. **Don't mix component libraries**
   - ❌ Using `<View>` in `.web.tsx` files
   - ✅ Use `<div>` in web, `<View>` in mobile

2. **Don't skip the Active Work table**
   - ❌ Starting work without claiming it
   - ✅ Always add yourself to Active Work before starting

3. **Don't work on dependencies out of order**
   - ❌ Starting plan detail before auth is done
   - ✅ Check Migration Priorities in the checklist

4. **Don't forget platform-specific files**
   - ❌ Only creating `feature.web.tsx`
   - ✅ Create both `feature.tsx` AND `feature.web.tsx`

5. **Don't skip the Legacy reference**
   - ❌ Guessing how features should work
   - ✅ Study the Legacy implementation first

## 🤝 Multi-Agent Coordination

**If you see a blocker:**
1. Note it in your Active Work row
2. Check if another agent is working on the dependency
3. Consider working on a different page while waiting

**If another agent needs your work:**
1. Prioritize completing your current page
2. Update your status frequently so they know progress
3. Communicate any breaking changes

**Best practices:**
- Work on different platforms in parallel (one agent on mobile, another on web for same feature)
- Complete one page fully before starting another
- Test your changes before marking complete
- Don't make breaking changes to shared code without coordination

## 📋 Recommended Starting Points

**Easy (Start here if new):**
- Tags mobile/web
- Profile mobile/web
- Help page mobile

**Medium (Need some context):**
- Coaches mobile/web
- Files mobile/web
- Announcements mobile/web
- Reports mobile/web

**Complex (Require dependencies):**
- Login/Register (need auth slice)
- Dashboard (needs multiple data slices)
- Plans (complex state management)
- Calendar (complex UI)

## 🎯 Your Task

**Now that you've read this:**

1. Open `MIGRATION-CHECKLIST.md`
2. Review the Active Work section
3. Choose an available page (start with Phase 1-2 items)
4. Claim it in the Active Work table
5. Study the Legacy implementation
6. Implement the page following the guidelines above
7. Mark it complete when done

**Let me know when you've claimed a page and I'll provide any additional guidance you need!**

## 📚 Quick Reference Links

- **Architecture Guide:** `practice-plan-app/claude.md`
- **Migration Checklist:** `MIGRATION-CHECKLIST.md`
- **Progress Tracker:** `practice-plan-app/PROGRESS.md`
- **Legacy Mobile:** `LegacyApp/src/apps/mobile/`
- **Legacy Web:** `LegacyApp/src/apps/web/`
- **Interfaces:** `practice-plan-app/lib/interfaces/`
- **Store:** `practice-plan-app/lib/store/`

---

**Remember:** You're part of a coordinated team effort. Communication and following the process is just as important as the code you write. Good luck! 🚀
