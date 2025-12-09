# WebV2 App Architecture

## Overview

WebV2 is a responsive web application that provides native-like mobile experience using Framework7 and desktop experience using shadcn/ui components. The app automatically switches between mobile and desktop layouts based on viewport size.

## Technology Stack

- **Build Tool**: Vite
- **Framework**: React 19
- **Mobile UI**: Framework7 (native iOS/Android look and feel)
- **Desktop UI**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand (`@ppa/store`)
- **Routing**: Framework7 Router (mobile) / Client-side routing (desktop)
- **Icons**: Lucide React

## Responsive Architecture

### Viewport Breakpoint
- **Mobile**: `< 768px` (md breakpoint)
- **Desktop**: `≥ 768px`

### Two-Level Responsive Switching

#### 1. App-Level Layout Switching

The app switches between two complete layout systems based on viewport:

**Mobile Layout (< 768px)**:
- Framework7 App wrapper
- Framework7 View with routing
- Framework7 Toolbar with bottom tabs (Practice, Calendar, Menu)
- iOS/Android native feel

**Desktop Layout (≥ 768px)**:
- Sidebar navigation (collapsible)
- Header bar
- Main content area
- shadcn/ui components

#### 2. Page-Level Component Switching

Each route has both mobile and desktop implementations:

**Mobile Pages**:
- Use Framework7 components: `Page`, `Navbar`, `List`, `Block`, `Button`, etc.
- Native mobile patterns (swipe, pull-to-refresh, action sheets)
- Optimized for touch

**Desktop Pages**:
- Use shadcn/ui components: `Table`, `Dialog`, `Card`, `Button`, etc.
- Desktop patterns (hover states, right-click menus, modals)
- Optimized for mouse/keyboard

## File Structure

```
src/apps/webv2/
├── src/
│   ├── App.tsx                    # Main app with viewport detection
│   ├── components/
│   │   ├── shared/
│   │   │   ├── ViewportSwitch.tsx # Responsive component switcher
│   │   │   ├── DesktopSidebar.tsx # Desktop sidebar navigation
│   │   │   ├── DesktopHeader.tsx  # Desktop header
│   │   │   └── DesktopContent.tsx # Desktop content router
│   │   └── ui/                    # shadcn/ui components
│   ├── pages/
│   │   ├── mobile/                # Framework7 pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── MenuPage.tsx
│   │   │   ├── PeriodsPage.tsx
│   │   │   └── ...
│   │   └── desktop/               # shadcn pages (TBD)
│   │       ├── DashboardPage.tsx
│   │       ├── PeriodsPage.tsx
│   │       └── ...
│   ├── hooks/
│   │   └── useDevice.tsx          # Viewport detection hook
│   └── lib/
│       └── routes.ts              # Framework7 routes
```

## Component Patterns

### ViewportSwitch Component

Used at the page level to automatically switch between mobile and desktop components:

```tsx
import { ViewportSwitch } from '@/components/shared/ViewportSwitch';

export default function PeriodsPage() {
  return (
    <ViewportSwitch
      mobile={<PeriodsMobile />}    // Framework7 components
      desktop={<PeriodsDesktop />}  // shadcn components
    />
  );
}
```

### Mobile Page Pattern (Framework7)

```tsx
import { Page, Navbar, List, ListItem, Block, Button } from 'framework7-react';
import { Plus } from 'lucide-react';

export default function PeriodsMobile() {
  return (
    <Page name="periods">
      <Navbar title="Period Templates" backLink="Back" />

      <Block className="!mt-4">
        <Button fill large className="!bg-primary-500">
          <Plus className="w-5 h-5 mr-2" />
          New Period
        </Button>
      </Block>

      <List mediaList inset>
        <ListItem title="Warm-up" subtitle="10 min" />
        <ListItem title="Drills" subtitle="15 min" />
      </List>
    </Page>
  );
}
```

### Desktop Page Pattern (shadcn/ui)

```tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PeriodsDesktop() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Period Templates</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Period
        </Button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        {/* Table or grid of periods */}
      </div>
    </div>
  );
}
```

## Navigation Structure

### Mobile Navigation (Framework7 Tabs)

Bottom tab bar with 3 tabs:
- **Practice** (`/`) - Today's practice plan
- **Calendar** (`/calendar/`) - Week/month view of all practices
- **Menu** (`/menu/`) - Access to all features

From Menu, users navigate to:
- Period Templates
- Practice Templates
- Tags
- Coaches
- Files
- Announcements
- Reports
- Profile
- Team Settings
- Subscription

### Desktop Navigation (Sidebar)

Collapsible sidebar with sections:
- **Planning**: Dashboard, Calendar, Period Templates, Practice Templates
- **Communication**: Announcements
- **Management**: Files, Tags, Coaches, Reports
- **Settings**: Profile, Team Settings, Subscription

## Framework7 Configuration

```tsx
const f7params = {
  name: 'Practice Plan App',
  theme: 'ios',           // iOS theme for consistent native feel
  routes,                 // Lazy-loaded routes
};
```

## Styling

### Design System
- Uses shared design tokens from `@ppa/ui/branding`
- CSS variables defined in `src/styles/globals.css`
- Tailwind CSS for utility classes

### Mobile Styling (Framework7)
- Framework7's built-in iOS theme
- Custom Tailwind classes for spacing/colors
- Background: `bg-[#e0e0e0]` (light gray)
- Cards: white with rounded corners and shadows

### Desktop Styling (shadcn/ui)
- shadcn/ui component defaults
- Tailwind utility classes
- Background: `bg-background-50`
- Sidebar: `bg-white` with border

## State Management

All state is managed through Zustand store (`@ppa/store`):

```tsx
import { useAppStore } from '@ppa/store';

// Data slices
const plans = useAppStore((state) => state.plans);
const createPlan = useAppStore((state) => state.createPlan);

// UI slices (screen state)
const periodsSearchQuery = useAppStore((state) => state.periodsSearchQuery);
const setPeriodsSearchQuery = useAppStore((state) => state.setPeriodsSearchQuery);
```

**Never use local `useState` for screen state** - always use Zustand UI slices.

## Current Implementation Status

### ✅ Completed
- App shell with viewport detection
- Framework7 setup with routing
- Bottom tab bar (Practice, Calendar, Menu)
- shadcn/ui component installation
- Desktop layout structure (sidebar, header, content)
- Design system variables

### 🚧 In Progress
- ViewportSwitch component
- Mobile pages with Framework7 components
- Desktop pages with shadcn components

### ❌ Not Started
- Store integration in pages
- CRUD modals/dialogs (both mobile and desktop)
- User feedback (toasts, alerts, confirmations)
- Loading/empty/error states

## Implementation Workflow - CRITICAL

**NEVER half-ass the implementation. Always follow this exact workflow:**

---

## For Mobile Views (Framework7)

### Step 1: Study the Native Mobile App (REQUIRED)

Before touching ANY code for mobile views, you MUST:

1. **Read the native mobile component** at `src/apps/mobile/app/(main)/[feature].tsx` or `src/apps/mobile/components/screens/[feature]/[Feature]Mobile.tsx`
   - Understand EVERY line of code
   - Note exact colors, spacing, borders, shadows
   - Identify ALL user interactions (tap, long-press, swipe)
   - List ALL modals, alerts, action sheets, toasts
   - Document state management (what uses store, what's local)
   - Understand loading/empty/error states

2. **Identify all sub-components and helpers**
   - What TP components does it use? (TPButton, TPCard, TPAlert, TPFab, etc.)
   - What hooks does it use? (useAppStore, useRouter, custom hooks)
   - What helper functions? (formatTime, formatDuration, etc.)
   - What icons from lucide-react-native?

3. **Map out the user flow**
   - What happens when user taps each button?
   - What modals open? What forms appear?
   - What confirmation dialogs show?
   - What success/error messages display?
   - How does navigation work?

4. **Document the exact styling**
   - Background colors (hex codes like `#e0e0e0`, `#356793`)
   - Border colors and widths (`border-gray-200`)
   - Shadow styles (`shadow-sm`)
   - Font sizes and weights (`text-lg font-semibold`)
   - Spacing (padding, margins like `px-5 py-3`)
   - Border radius values (`rounded-xl`)

### Step 2: Plan the Framework7 Implementation

Only AFTER studying the mobile app:

1. **Map TP components to Framework7 equivalents**
   - TPButton → Framework7 Button
   - TPCard → Framework7 Card or custom div with same styling
   - TPAlert → Framework7 Dialog or Actions
   - TPFab → Framework7 Fab
   - TPBottomSheet → Framework7 Sheet or Actions
   - etc.

2. **Plan state management**
   - What needs Zustand store? (use same slices as mobile)
   - What can be local state?
   - What UI state exists in store?

3. **Plan modals and interactions**
   - Framework7 Sheet for bottom sheets
   - Framework7 Actions for action menus
   - Framework7 Dialog for alerts
   - Framework7 Toast for success messages

### Step 3: Implement Mobile Component

1. **Start with exact structure from mobile app**
   - Same sections in same order
   - Same conditional rendering logic
   - Same empty/loading states

2. **Use exact colors and spacing from mobile app**
   - Copy hex codes exactly (e.g., `!bg-[#e0e0e0]` for background)
   - Match Tailwind classes exactly (e.g., `!px-5 !py-3`)
   - Use same border radius, shadows

3. **Implement ALL interactions**
   - Every button must do something
   - Every modal must exist
   - Every confirmation must work
   - Every success message must show

4. **Connect to store identically**
   - Use same store slices
   - Same actions
   - Same selectors

### Step 4: Verify Code Against Mobile App

**Read both files and verify they match:**

- [ ] **Same colors used** - Compare hex codes and color classes in code
- [ ] **Same Tailwind spacing classes** - Verify padding/margin classes match
- [ ] **Same font classes** - text-* and font-* classes identical
- [ ] **Same border/shadow classes** - border-*, shadow-* classes match
- [ ] **Same icon sizes** - Icon size props match (20, 24, etc.)
- [ ] **Same store slices used** - useAppStore selectors identical
- [ ] **Same store actions called** - createX, updateX, deleteX match
- [ ] **Same conditional logic** - if/else conditions identical
- [ ] **All interactions implemented** - onClick/onPress for every button
- [ ] **All modals referenced** - Sheet/Dialog/Actions components present
- [ ] **All toasts called** - Success/error toast messages present
- [ ] **Loading states present** - Spinners or skeletons in code
- [ ] **Empty states present** - Empty state UI in code

---

## For Desktop Views (shadcn/ui)

### Step 1: Study the Web App (REQUIRED)

Before touching ANY code for desktop views, you MUST:

1. **Read the web app page** at `src/apps/web/app/[feature]/page.tsx`
   - Understand EVERY line of code
   - Note exact colors, spacing, borders, shadows
   - Identify ALL user interactions (click, hover, keyboard)
   - List ALL modals, dialogs, dropdowns, toasts
   - Document state management (what uses store, what's local)
   - Understand loading/empty/error states

2. **Identify all shadcn components and TP wrappers**
   - What shadcn/ui components are used? (Button, Dialog, Table, etc.)
   - What TP wrapper components exist? (TPHeader, TPSidebar, etc.)
   - What hooks does it use? (useAppStore, useRouter, custom hooks)
   - What helper functions? (formatTime, formatDate, etc.)
   - What icons from lucide-react?

3. **Map out the user flow**
   - What happens when user clicks each button?
   - What modals/dialogs open? What forms appear?
   - What confirmation dialogs show?
   - What success/error messages display?
   - How does navigation work? (sidebar, breadcrumbs, etc.)

4. **Document the exact styling**
   - Background colors (design tokens: `bg-background-50`, `bg-white`)
   - Border colors (design tokens: `border-outline-100`)
   - Shadow styles (`shadow-sm`, `shadow-md`)
   - Font sizes and weights (`text-sm`, `text-2xl`, `font-semibold`)
   - Spacing (`p-4`, `p-6`, `gap-6`)
   - Border radius values (`rounded-lg`, `rounded-xl`)

### Step 2: Plan the shadcn/ui Implementation

Only AFTER studying the web app:

1. **Use exact shadcn components from web app**
   - Don't reinvent - copy the pattern
   - Same component variants and sizes
   - Same prop combinations

2. **Plan state management**
   - What needs Zustand store? (use same slices as web)
   - What can be local state?
   - What UI state exists in store?

3. **Plan modals and interactions**
   - shadcn Dialog for modals
   - shadcn DropdownMenu for context menus
   - shadcn AlertDialog for confirmations
   - sonner toast for success messages

### Step 3: Implement Desktop Component

1. **Start with exact structure from web app**
   - Same sections in same order
   - Same conditional rendering logic
   - Same empty/loading states

2. **Use exact Tailwind classes from web app**
   - Copy design token classes exactly (`bg-background-50`, `text-typography-700`)
   - Match spacing classes exactly (`p-6`, `gap-4`)
   - Use same border radius, shadows

3. **Implement ALL interactions**
   - Every button must do something
   - Every modal must exist
   - Every confirmation must work
   - Every success message must show

4. **Connect to store identically**
   - Use same store slices
   - Same actions
   - Same selectors

### Step 4: Verify Code Against Web App

**Read both files and verify they match:**

- [ ] **Same design tokens used** - bg-*, text-*, border-* classes match
- [ ] **Same Tailwind spacing classes** - p-*, gap-*, space-* classes identical
- [ ] **Same font classes** - text-* and font-* classes match
- [ ] **Same border/shadow classes** - border-*, shadow-* utilities match
- [ ] **Same icon sizes** - Icon className props match (w-4, w-5, etc.)
- [ ] **Same shadcn components** - Button, Dialog, Table variants identical
- [ ] **Same store slices used** - useAppStore selectors match
- [ ] **Same store actions called** - createX, updateX, deleteX match
- [ ] **Same conditional logic** - if/else conditions identical
- [ ] **All interactions implemented** - onClick for every button
- [ ] **All modals/dialogs present** - Dialog, AlertDialog components in code
- [ ] **All toasts called** - toast() calls for success/error
- [ ] **Loading states present** - Spinners or skeletons in code
- [ ] **Empty states present** - Empty state UI in code
- [ ] **Hover states present** - hover:* classes on interactive elements

## Implementation Checklist

When building a new feature page:

- [ ] **STUDY mobile app first** (complete Step 1 above)
- [ ] **PLAN Framework7 implementation** (complete Step 2 above)
- [ ] Create mobile component in `pages/mobile/[Feature]Page.tsx`
  - [ ] Use Framework7 components matching TP component behavior
  - [ ] Match exact colors, spacing, styling from mobile app
  - [ ] Connect to same Zustand store slices
  - [ ] Implement ALL modals, alerts, sheets
  - [ ] Add loading/empty/error states
  - [ ] Wire up ALL user interactions

- [ ] Create desktop component in `pages/desktop/[Feature]Page.tsx`
  - [ ] Study `src/apps/web/app/[feature]/page.tsx` first
  - [ ] Use shadcn/ui components
  - [ ] Match exact styling from web app
  - [ ] Connect to same Zustand store slices
  - [ ] Implement ALL modals, dialogs
  - [ ] Add loading/empty/error states

- [ ] Create wrapper page with ViewportSwitch
  - [ ] Import both mobile and desktop components
  - [ ] Use ViewportSwitch to toggle between them

- [ ] Add route to Framework7 routes (for mobile navigation)
- [ ] Add page to desktop content router (for desktop navigation)

## Key Principles

1. **Mobile-First for Mobile, Desktop-First for Desktop** - Don't compromise either experience
2. **Framework7 for Native Feel** - Use Framework7's components as intended for mobile
3. **No Compromises** - Each platform gets its optimal UX
4. **Shared State** - Use Zustand store for all data and UI state
5. **Consistent Branding** - Use shared design tokens from `@ppa/ui/branding`
6. **Complete Features** - Always implement loading, empty, error, and success states

## References

- Framework7 React Docs: https://framework7.io/react/
- shadcn/ui Docs: https://ui.shadcn.com/
- Mobile App: `src/apps/mobile/` (reference for mobile patterns)
- Web App: `src/apps/web/` (reference for desktop patterns)
