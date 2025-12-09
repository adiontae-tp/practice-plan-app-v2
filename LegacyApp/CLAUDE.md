# Practice Plan App - Agent Guidelines

**Documentation Format:** Use concise line items only. No prose, no code examples, no elaboration. Keep it scannable.

## Documentation Index

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview, quick start, monorepo structure |
| [docs/FEATURES.md](./docs/FEATURES.md) | All user-facing features, subscription tiers |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture, data flow, package dependencies |
| [docs/DATA_MODELS.md](./docs/DATA_MODELS.md) | TypeScript interfaces, entity relationships |
| [docs/STATE_MANAGEMENT.md](./docs/STATE_MANAGEMENT.md) | Zustand store patterns, slices, usage examples |
| [docs/MOBILE_APP.md](./docs/MOBILE_APP.md) | Expo/React Native app guide, TP components |
| [docs/WEB_APP.md](./docs/WEB_APP.md) | Next.js app guide, shadcn/ui components |
| [docs/DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) | Coding standards, conventions, workflows |
| [docs/COMPONENT_LIBRARY.md](./docs/COMPONENT_LIBRARY.md) | TP component system, platform comparison |
| [docs/CODEBASE_PATTERNS.md](./docs/CODEBASE_PATTERNS.md) | Grep patterns, slice signatures, naming conventions |
| [src/ui/wireframes/mobile/COMPONENTS.md](./src/ui/wireframes/mobile/COMPONENTS.md) | Mobile component inventory |
| [src/ui/wireframes/web/COMPONENTS.md](./src/ui/wireframes/web/COMPONENTS.md) | Web component inventory |

---

## Quick File Finder

### By Feature
| Feature | Mobile Screen | Web Page | Store Slice | Interface |
|---------|--------------|----------|-------------|-----------|
| Plans | `(main)/plan/` | `app/plan/` | `planSlice` | `plan.ts` |
| Periods | `(main)/period-templates.tsx` | `app/periods/` | `periodSlice` | `period.ts` |
| Templates | `(main)/practice-templates.tsx` | `app/templates/` | `templateSlice` | `template.ts` |
| Tags | `(main)/tags.tsx` | `app/tags/` | `tagSlice`, `tagsUISlice` | `tag.ts` |
| Coaches | `(main)/coaches.tsx` | `app/coaches/` | `coachSlice`, `coachesUISlice` | `coach.ts` |
| Files | `(main)/files.tsx` | `app/files/` | `fileSlice`, `filesUISlice` | `file.ts` |
| Announcements | `(main)/announcements.tsx` | `app/announcements/` | `announcementSlice` | `announcement.ts` |
| Calendar | `(tabs)/calendar.tsx` | `app/calendar/` | `calendarUISlice` | - |
| Profile | `(main)/profile.tsx` | `app/profile/` | `profileUISlice` | `user.ts` |
| Team | `(main)/team-settings.tsx` | `app/team/` | `teamSlice` | `team.ts` |
| Reports | `(main)/reports.tsx` | `app/reports/` | `reportsUISlice` | - |
| Subscription | `(main)/subscription.tsx` | `app/subscription/` | `subscriptionSlice` | - |

### Common File Paths
| Looking For | Path |
|-------------|------|
| TypeScript interfaces | `src/packages/interfaces/src/` |
| Zustand slices | `src/packages/store/src/slices/` |
| Mock data | `src/packages/mock/src/` |
| Mobile TP components | `src/apps/mobile/components/tp/` |
| Mobile screens | `src/apps/mobile/app/(main)/` |
| Mobile tabs | `src/apps/mobile/app/(main)/(tabs)/` |
| Web TP components | `src/apps/web/components/tp/` |
| Web shadcn components | `src/apps/web/components/ui/` |
| Web pages | `src/apps/web/app/` |
| Branding/colors | `src/ui/branding/colors.ts` |
| Wireframes | `src/ui/wireframes/` |

---

## Import Cheat Sheet

### Packages (Both Platforms)
```
@ppa/interfaces  → User, Team, Plan, Period, Template, Tag, Coach, File, Announcement, Activity
@ppa/store       → useAppStore
@ppa/mock        → mockUsers, mockTeams, mockPlans, mockPeriods, mockTemplates, mockTags, mockCoaches, mockFiles, mockAnnouncements
@ppa/ui/branding → COLORS, HEADER_STYLE, TAB_BAR_STYLE, lightTheme, darkTheme
```

### Mobile Imports
```
@/components/tp  → TPButton, TPCard, TPInput, TPFooterButtons, TPAlert, TPBottomSheet, TPToast, useToast, etc.
@/components/ui  → GlueStack wrappers (Box, Text, VStack, HStack, etc.)
lucide-react-native → Icons (Plus, Trash2, Edit, ChevronRight, etc.)
expo-router      → useRouter, useLocalSearchParams, Stack, Link
```

### Web Imports
```
@/components/tp  → TPAppShell, TPHeader, TPSidebar, TPPaywall, TPRichTextEditor
@/components/ui  → Button, Dialog, Input, Table, etc. (shadcn)
lucide-react     → Icons (Plus, Trash2, Edit, ChevronRight, etc.)
next/navigation  → useRouter, useParams, useSearchParams
sonner           → toast
```

---

## Slice Quick Reference

### Data Slices (Entity CRUD)
| Slice | State | Key Actions |
|-------|-------|-------------|
| `userSlice` | `user` | `setUser` |
| `teamSlice` | `team` | `setTeam` |
| `planSlice` | `plans`, `plan` | `fetchPlans`, `createPlan`, `updatePlan`, `deletePlan` |
| `periodSlice` | `periods` | `fetchPeriods`, `createPeriod`, `updatePeriod`, `deletePeriod` |
| `templateSlice` | `templates` | `fetchTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate` |
| `tagSlice` | `tags` | `fetchTags`, `createTag`, `updateTag`, `deleteTag` |
| `coachSlice` | `coaches` | `fetchCoaches`, `inviteCoach`, `updateCoach`, `removeCoach` |
| `fileSlice` | `files` | `fetchFiles`, `uploadFile`, `updateFile`, `deleteFile` |
| `folderSlice` | `folders` | `fetchFolders`, `createFolder`, `updateFolder`, `deleteFolder` |
| `announcementSlice` | `announcements` | `fetchAnnouncements`, `createAnnouncement`, `deleteAnnouncement` |
| `subscriptionSlice` | `subscription`, `entitlements` | `fetchSubscription`, `checkEntitlement` |

### UI Slices (Screen State)
| Slice | Prefix | State Examples |
|-------|--------|----------------|
| `tagsUISlice` | `tags` | `tagsSearchQuery`, `tagsShowCreateModal`, `tagsSelectedTag` |
| `coachesUISlice` | `coaches` | `coachesSearchQuery`, `coachesShowInviteModal` |
| `filesUISlice` | `files` | `filesViewMode`, `filesSearchQuery`, `filesSortBy` |
| `calendarUISlice` | `calendar` | `calendarViewMode`, `calendarSelectedDate` |
| `periodsUISlice` | `periods` | `periodsSearchQuery`, `periodsShowModal` |
| `templatesUISlice` | `templates` | `templatesSearchQuery`, `templatesShowModal` |
| `announcementsUISlice` | `announcements` | `announcementsSearchQuery` |
| `reportsUISlice` | `reports` | `reportsTab`, `reportsDateRange` |
| `profileUISlice` | `profile` | `profileEditMode` |
| `pdfUISlice` | `pdf` | `pdfTemplate`, `pdfShowPreview` |

---

## Interface Quick Reference

| Interface | File | Key Fields |
|-----------|------|------------|
| `User` | `user.ts` | `uid`, `email`, `fname`, `lname`, `teamRef`, `entitlement` |
| `Team` | `team.ts` | `id`, `name`, `sport`, `headCoach`, `primaryColor`, `logoUrl` |
| `Plan` | `plan.ts` | `id`, `startTime`, `endTime`, `duration`, `activities[]`, `tags[]` |
| `Activity` | `activity.ts` | `id`, `name`, `startTime`, `endTime`, `duration`, `notes`, `tags[]` |
| `Period` | `period.ts` | `id`, `name`, `duration`, `notes`, `tags[]` |
| `Template` | `template.ts` | `id`, `name`, `duration`, `activities[]`, `tags[]` |
| `Tag` | `tag.ts` | `id`, `name` |
| `Coach` | `coach.ts` | `id`, `email`, `permission`, `status`, `invitedAt`, `joinedAt` |
| `File` | `file.ts` | `id`, `name`, `type`, `category`, `size`, `url`, `folderId` |
| `Folder` | `file.ts` | `id`, `name`, `parentId` |
| `Announcement` | `announcement.ts` | `id`, `title`, `message`, `priority`, `createdAt`, `readBy[]` |

---

## Current Mode: UI CREATION ONLY

- Building UI only right now - no backend integration
- Use mock data from `@ppa/mock` package (`src/packages/mock/`)
- Complete ALL UI elements for each screen: loading states, empty states, error states, alerts, toasts, confirmations
- Every user action needs feedback (success/error messages, loading indicators)
- Do not skip edge cases - implement the full user experience

### Follow-Through Requirement (CRITICAL)
- **NEVER leave placeholder actions** (e.g., `alert('TODO')`, `console.log('coming soon')`)
- When a screen has buttons/actions that open modals or forms, implement them fully
- Before implementing: search codebase for existing modals/forms - reuse if they exist
- If modal/form doesn't exist: create it as part of the same task
- Every clickable element must have a working destination or action

### User Feedback (CRITICAL)
- **ALL actions MUST show user feedback** - no silent operations
- Success actions: Show success toast/banner (e.g., "File uploaded successfully")
- Delete/Remove actions: Show confirmation dialog first, then success message
- Form submissions: Close modal + show success message
- Downloads/Opens: Show feedback like "Download started" or "Opening..."
- Use auto-dismissing toasts (3 seconds) with manual dismiss option
- Pattern: green success toast with CheckCircle icon, positioned top-right

### Wireframes (CRITICAL)
- ALWAYS follow the wireframes at `src/ui/wireframes/`
- Before deviating from a wireframe, ASK for confirmation
- If design changes are approved, UPDATE the wireframe file to reflect the new design
- Wireframes are the source of truth - keep them in sync with implementation

## Before Creating Anything

1. Search codebase for existing similar code
2. Check wireframes at `src/ui/wireframes/`
3. For web pages with mobile view: Use MWViewSwitch with mobile-web components (MWList, MWSearchBar)
4. Check shared UI package at `src/ui/`
5. Extend existing patterns instead of creating new

## Key Locations

- `src/ui/` - Shared UI package (@ppa/ui) with components, branding, wireframes
- `src/ui/branding/colors.ts` - COLORS, HEADER_STYLE, TAB_BAR_STYLE
- `src/ui/wireframes/mobile/COMPONENTS.md` - Mobile component inventory
- `src/ui/wireframes/web/COMPONENTS.md` - Web component inventory
- `src/apps/mobile/components/ui/` - Gluestack UI wrappers (mobile)
- `src/apps/web/components/ui/` - shadcn/ui base components (web)
- `src/apps/web/components/tp/` - TP wrapper components (web)
- `src/packages/mock/` - Mock data package (@ppa/mock)
- `legacy/` - Reference only, don't copy directly

## Web Component Pattern (shadcn + TP wrappers)

### Structure
- `components/ui/` - Raw shadcn/ui components (install via CLI)
- `components/tp/` - TP-prefixed wrapper components that standardize props and styling

### Rules
- Always use shadcn/ui as the base for web components
- Create TP wrapper components to reduce prop complexity and enforce design system
- TP components wrap shadcn components with preset styles/variants
- Name wrappers with TP prefix: `TPButton`, `TPCard`, `TPSidebar`, etc.

## Mobile-Web Component Pattern (CRITICAL)

### Standard Pattern

**ALWAYS use MWViewSwitch for pages with different mobile/desktop layouts**

```tsx
import { MWViewSwitch } from '@ppa/mobile-web';

// ✅ Correct
<MWViewSwitch
  mobile={<PageMobileView />}
  desktop={<PageDesktopView />}
/>

// ❌ Wrong - CSS-only responsive
<div className="md:hidden">Mobile view</div>
<div className="hidden md:block">Desktop view</div>
```

### Mobile Component Requirements

When building mobile views, ALWAYS use mobile-web library components:

**Search**: Use `MWSearchBar` instead of `Input`
```tsx
import { MWSearchBar } from '@ppa/mobile-web';

// ✅ Correct
<MWSearchBar value={query} onChange={setQuery} placeholder="Search..." />

// ❌ Wrong
<Input placeholder="Search..." />
```

**Lists**: Use `MWList` and `MWListItem` instead of custom divs
```tsx
import { MWList, MWListItem, MWListItemIcon } from '@ppa/mobile-web';

// ✅ Correct
<MWList variant="inset" header="Items">
  {items.map(item => (
    <MWListItem
      key={item.id}
      title={item.name}
      subtitle={item.description}
      showChevron
      onPress={() => handleClick(item)}
      left={<MWListItemIcon color="blue"><Icon /></MWListItemIcon>}
    />
  ))}
</MWList>

// ❌ Wrong
<div className="divide-y">
  {items.map(item => (
    <div className="flex items-center p-4" onClick={() => handleClick(item)}>
      {item.name}
    </div>
  ))}
</div>
```

### Component Structure

**File Organization**:
```
/components/tp/[feature]/
├── [Feature]MobileView.tsx    # Mobile-web components
├── [Feature]DesktopTable.tsx  # Desktop shadcn components
└── index.ts                   # Exports
```

**Mobile Component Template**:
```tsx
'use client';

import { MWList, MWListItem, MWSearchBar } from '@ppa/mobile-web';

export interface FeatureMobileViewProps {
  items: Item[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onItemClick: (item: Item) => void;
  onAdd: () => void;
}

export function FeatureMobileView({
  items,
  searchQuery,
  onSearchChange,
  onItemClick,
  onAdd,
}: FeatureMobileViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <MWSearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search..."
      />

      <Button onClick={onAdd}>Add New</Button>

      <MWList variant="inset" header={`Items (${items.length})`}>
        {items.map(item => (
          <MWListItem
            key={item.id}
            title={item.name}
            showChevron
            onPress={() => onItemClick(item)}
          />
        ))}
      </MWList>
    </div>
  );
}
```

### When to Use This Pattern

**Use MWViewSwitch when:**
- Page has different layouts for mobile/desktop (list vs table)
- Mobile needs different interactions (touch vs mouse)
- Desktop has features not available on mobile (complex tables)

**Don't use MWViewSwitch when:**
- Page is naturally responsive (forms, settings)
- Same component works on both platforms
- Content is identical, just reflowed

### Layout Compatibility

Mobile-web components are designed to work inside `MWPageContent`:
- No height/layout issues (unlike desktop components)
- Proper scrolling behavior
- Safe area handling built-in

See `MOBILE_WEB_REFACTOR_TRACKING.md` for pages that need refactoring.

## Mobile Component Pattern (GlueStack)

- Use GlueStack UI as base for mobile components
- All TP components use GlueStack or custom React Native implementations internally
- Wrapper components follow same TP prefix pattern
- **PRIORITIZE TP components over raw GlueStack/UI components**

### Available TP Components (USE THESE FIRST)
- `TPButton` - All buttons
- `TPFooterButtons` - CRUD screen footers
- `TPAlert` - Confirmation dialogs (delete, remove, discard)
- `TPSegmentedControl` - Toggle groups (custom Pressable implementation)
- `TPSwitch` - Boolean toggles (GlueStack Switch)
- `TPSlider` - Range inputs (GlueStack Slider)
- `TPDatePicker` - Date selection (custom picker with Actionsheet)
- `TPTimePicker` - Time selection (custom picker with Actionsheet)
- `TPProgress` - Progress bars (GlueStack Progress)
- `TPGauge` - Circular progress (custom SVG implementation)
- `TPContextMenu` - Long-press menus (Actionsheet-based)
- `TPBottomSheet` - Bottom sheet modals (GlueStack Actionsheet)

Import from: `@/components/tp`

### Mobile Modals (CRITICAL)
- **NEVER use GlueStack Modal component on mobile**
- For full forms/screens: Use **Expo Router modal** (`router.push('/modal-name')`)
- For small data/quick actions: Use **TPBottomSheet** (wraps GlueStack Actionsheet)
- For confirmations/alerts: Use **TPAlert** (standardized alert dialog)

## State Management (Zustand Store) - STANDARD

- **NEVER use local `useState` for screen/component state**
- All state must go through Zustand slices in `@ppa/store`
- Includes: modal visibility, form data, loading states, selected items, search queries

### Store Location
- Package: `@ppa/store` (`src/packages/store/`)
- Hook: `useAppStore`
- Slices: `src/packages/store/src/slices/`

### Data Slices
- `userSlice`, `teamSlice`, `planSlice`, `periodSlice`, `templateSlice`, `tagSlice`

### UI Slices (Screen State)
- `tagsUISlice` - Tags screen state (search, modals, selected item, form data, loading)
- `coachesUISlice` - Coaches screen state
- `filesUISlice` - Files screen state

### Creating New UI Slices
- Create `[screen]UISlice.ts` in slices folder
- Export from `slices/index.ts`
- Add to `AppStore` type and `useAppStore` in `store.ts`
- Prefix all state/actions with screen name (e.g., `tagsSearchQuery`, `setTagsShowModal`)
- Include `reset[Screen]UI` action to clear all screen state

## Rules

### Tables & Lists (CRITICAL)
- **NO row numbers or index counts** - Never add "#" columns to tables or numbered indices to list items
- Tables display data columns only (e.g., Name, Email, Status, Actions)
- Use grey badges/chips for status indicators - avoid multiple colors

### Terminology (CRITICAL)
- Internal code uses `Activity` interface - this is correct for TypeScript/interfaces
- **In the UI, ALWAYS use "periods" instead of "activities"**
- Example: "3 periods" not "3 activities", "Add periods" not "Add activities"
- The `plan.activities` array contains periods - the interface name doesn't change the UI terminology

### Data & Interfaces (CRITICAL)
- **ONLY use fields that exist in the TypeScript interfaces** - never invent props
- Before building forms/cards/displays, READ the interface definition first
- If a field doesn't exist (e.g., `title`, `location`), DO NOT add it to UI
- Check `src/packages/interfaces/` for interface definitions
- When in doubt, ask - don't assume fields exist

### Styling
- Never inline styles in layout files
- Import colors/styles from `@ppa/ui/branding`
- No hardcoded hex colors - use design tokens/CSS variables

### Accessibility & Color Contrast (CRITICAL)
- All text must meet WCAG AA contrast ratio (4.5:1 normal text, 3:1 large text)
- Never use opacity-based colors for text (e.g., `text-white/70`) - use solid colors
- Active/hover states must maintain proper contrast
- On dark backgrounds: use pure `text-white`, not `text-white/80`
- On light backgrounds: use `text-gray-700` for text, `text-gray-500` for icons minimum
- Test: gray-500 on white = 4.6:1 (passes), gray-400 = 3:1 (fails for small text)

### Navigation Active States
- Use `group` class on parent for hover transitions on child elements
- Active items: solid background with contrasting text (e.g., `bg-[#356793] text-white`)
- Icons must match text color - use wrapper span with conditional class
- Add `data-[active=true]` selectors to override component library defaults
- Inactive icons: `text-gray-500 group-hover:text-gray-700`
- Active icons: `text-white` (same as text)

### Components
- Never define components inline in screen files
- One component per file
- If used in 2+ places, make it reusable
- TypeScript interfaces for all props

### Imports
- Use `@ppa/ui/branding` for shared styles
- Use `@/` aliases, not relative paths

## Icons

- Mobile: Lucide React Native
- Web: Lucide React

### Icon Styling (CRITICAL)
- Keep icons subtle - avoid colorful icons everywhere
- Standard pattern: Light gray background (`bg-background-100` or `bg-gray-100`) with dark gray icon (`text-gray-600`)
- Primary accent (sparingly): Light primary background (`bg-primary-100`) with primary icon (`text-primary-500`)
- Use primary accent only when highlighting important items or active states
- Never use different colored icons for each item in a list
- Never use rainbow of icon colors on a single screen
- Never use bright/saturated icon colors as default

## Web Modal Pattern (CRITICAL)

### Modal Layout
- Use shadcn Dialog component as base
- Title + subtitle in DialogHeader
- Actions in a toolbar below header, NOT in the top-right corner
- Use ghost buttons with icons in toolbar for actions (Edit, PDF, Share, Delete)
- Separate action groups with `<Separator orientation="vertical" />`
- Delete button always last, styled with `text-red-600`

### Modal Toolbar Pattern
- Place all actions (Edit, PDF, Share, Delete) in a horizontal toolbar
- Toolbar sits below title/subtitle, separated by light border
- Use `variant="ghost" size="sm"` for toolbar buttons
- Icons 4x4 with 1.5 margin-right
- Group related actions, separate groups with vertical Separator

### Detail Modals (Viewing Records)
- No footer - all actions in toolbar
- Content area scrollable if needed
- Tables: simple grid, no row numbers, gray header background

## Mobile CRUD Screens Pattern

### TPFooterButtons (Required for CRUD operations)
- All mobile screens/modals with Create, Edit, or Delete operations MUST use `TPFooterButtons` at the bottom
- Props: `mode` ('view' | 'edit'), `onCancel`, `onSave`, `onEdit`, `saveLabel`, `cancelLabel`, `editLabel`, `loading`, `saveDisabled`, `canEdit`
- View mode: Close/Edit buttons
- Edit mode: Cancel/Save buttons
- Sticky to bottom with safe area padding
- Side-by-side buttons on mobile
- Cancel = outline style, Save/Edit = filled primary
- Disabled state = gray background

## Before Finishing Any Task

- No inline component definitions in screens
- No hardcoded colors/spacing
- Proper import aliases used
- TypeScript interfaces defined
- All UI states implemented (loading, empty, error, success)
- User feedback for all actions (toasts, alerts, confirmations)

---

*Ask for clarification if anything is unclear.*
