# Web App Guide

The web app is built with Next.js 16 (App Router) and uses shadcn/ui for components.

## Location

```
src/apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (marketing)/       # Marketing pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── calendar/          # Calendar page
│   ├── plan/              # Plan pages
│   ├── periods/           # Periods page
│   ├── templates/         # Templates page
│   ├── tags/              # Tags page
│   ├── coaches/           # Coaches page
│   ├── files/             # Files page
│   ├── announcements/     # Announcements page
│   ├── reports/           # Reports page
│   ├── profile/           # Profile page
│   ├── team/              # Team settings page
│   ├── subscription/      # Subscription page
│   ├── help/              # Help page
│   ├── share/             # Public share pages
│   ├── notes/             # Notes page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── tp/                # TP wrapper components
│   └── providers/         # React providers
├── hooks/                 # Web-specific hooks
├── services/              # API services
├── lib/                   # Utilities
├── e2e/                   # Playwright tests
├── public/                # Static assets
├── next.config.ts         # Next.js config
└── tailwind.config.js     # Tailwind config
```

## Running the App

```bash
# Development server
pnpm web

# Or directly
cd src/apps/web
npm run dev

# Build
npm run build

# Production
npm start
```

## App Router Structure

### Route Groups

```
app/
├── (auth)/                  # Login/register pages
│   ├── login/page.tsx
│   └── register/page.tsx
├── (marketing)/             # Public marketing pages
│   ├── page.tsx            # Landing page
│   └── features/page.tsx
├── api/                     # API routes
│   └── stripe/             # Stripe webhooks
├── dashboard/page.tsx       # Main dashboard
├── calendar/page.tsx        # Calendar view
├── plan/
│   ├── page.tsx            # Plans list
│   └── [id]/page.tsx       # Plan detail
└── [feature]/page.tsx       # Feature pages
```

### Page Hierarchy

```
Dashboard (Home)
├── Calendar
├── Announcements
├── Periods
├── Templates
├── Tags
├── Coaches
├── Files
├── Reports
├── Profile
├── Team Settings
├── Subscription
└── Help
```

## Layout & Provider Stack

```tsx
// app/layout.tsx
<html>
  <body>
    <AuthProvider>
      <TPAppShell>
        <AppProvider>
          {children}
        </AppProvider>
      </TPAppShell>
    </AuthProvider>
  </body>
</html>
```

### TPAppShell

The main layout wrapper that provides:
- Top header with logo, team selector, user menu
- Sidebar navigation
- Main content area

```tsx
import { TPAppShell } from '@/components/tp';

function Layout({ children }) {
  return <TPAppShell>{children}</TPAppShell>;
}
```

## Component System

### shadcn/ui Base Components

Located in `components/ui/`:

| Component | Description |
|-----------|-------------|
| `button.tsx` | Button component |
| `dialog.tsx` | Modal dialog |
| `alert-dialog.tsx` | Confirmation dialog |
| `dropdown-menu.tsx` | Dropdown menu |
| `input.tsx` | Text input |
| `tabs.tsx` | Tab navigation |
| `sidebar.tsx` | Sidebar navigation |
| `sheet.tsx` | Slide-out panel |
| `scroll-area.tsx` | Scrollable container |
| `avatar.tsx` | User avatar |
| `separator.tsx` | Divider |
| `switch.tsx` | Toggle switch |
| `tooltip.tsx` | Tooltip |
| `skeleton.tsx` | Loading skeleton |

### Installing shadcn/ui Components

```bash
cd src/apps/web
npx shadcn@latest add button dialog input
```

### TP Wrapper Components

Located in `components/tp/`:

| Component | Description |
|-----------|-------------|
| `TPAppShell` | Main app layout |
| `TPHeader` | Page header |
| `TPSidebar` | Navigation sidebar |
| `TPPaywall` | Subscription paywall |
| `TPRichTextEditor` | Rich text editor |
| `TPRichTextDisplay` | Rich text display |

### Feature Components

Located in `components/tp/[feature]/`:

```
components/tp/
├── announcements/      # Announcement components
├── calendar/           # Calendar components
├── coaches/            # Coach components
├── files/              # File components
├── help/               # Help components
├── pdf/                # PDF components
├── periods/            # Period components
├── plan/               # Plan components
├── profile/            # Profile components
├── reports/            # Report components
├── subscription/       # Subscription components
├── tags/               # Tag components
├── team/               # Team components
└── templates/          # Template components
```

## Responsive Architecture

### Mobile-Web Pattern

The web app uses **platform-specific components** rather than CSS-responsive design for complex pages.

**Detection**: Uses `MWProvider` context (from `@ppa/mobile-web`)
- Breakpoint: 768px (md)
- `isMobile` when viewport < 768px
- `isDesktop` when viewport ≥ 768px

**Component Selection**: `MWViewSwitch` renders appropriate component
```tsx
<MWViewSwitch
  mobile={<MobileOptimizedComponent />}
  desktop={<DesktopComponent />}
/>
```

### Layout System

**Desktop**: Traditional Next.js layout
```
TPAppShell
├── TPHeader (top bar)
├── TPSidebar (left nav)
└── Content (scrollable)
```

**Mobile**: Mobile-web layout
```
MWPage
├── MWHeader (fixed top)
├── MWPageContent (scrollable)
└── MWTabBar (fixed bottom, on tab pages)
```

### Mobile-Web Components

Use these instead of shadcn components in mobile views:

| Purpose | Mobile-Web | Desktop (shadcn) |
|---------|------------|------------------|
| Search | `MWSearchBar` | `Input` |
| List | `MWList` + `MWListItem` | `Table` |
| Icons | `MWListItemIcon` | Custom |
| Modals | `MWModal` / `MWBottomSheet` | `Dialog` |

See `src/packages/mobile-web/src/components/` for full component list.

## Styling

### Tailwind CSS v4

```tsx
function Example() {
  return (
    <div className="flex items-center gap-4 p-6 bg-background">
      <h1 className="text-2xl font-bold text-primary">
        Hello World
      </h1>
    </div>
  );
}
```

### CSS Variables

Defined in `app/globals.css`:

```css
:root {
  --primary: 53 103 147;       /* #356793 */
  --secondary: 239 123 143;    /* #EF7B8F */
  --background: 255 255 255;
  --foreground: 38 38 39;
  /* ... */
}
```

### Colors from Branding

```tsx
// For server components (CSS variables)
<div className="bg-primary text-primary-foreground">

// For client components needing raw values
import { COLORS } from '@ppa/ui/branding';
<div style={{ backgroundColor: COLORS.primary }}>
```

## State Management

Use Zustand store, not local state:

```tsx
'use client';

import { useAppStore } from '@ppa/store';

function TagsPage() {
  const {
    tags,
    tagsLoading,
    tagsSearchQuery,
    setTagsSearchQuery,
    fetchTags,
  } = useAppStore();

  useEffect(() => {
    fetchTags(teamId);
  }, [teamId]);

  return (
    <div>
      <Input
        value={tagsSearchQuery}
        onChange={(e) => setTagsSearchQuery(e.target.value)}
        placeholder="Search tags..."
      />
      {/* ... */}
    </div>
  );
}
```

## Modal Pattern

### Dialog for Modals

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

function TagModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Tag</DialogTitle>
          <DialogDescription>
            Add a new tag to categorize periods.
          </DialogDescription>
        </DialogHeader>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  );
}
```

### Modal Toolbar Pattern

For detail modals, place actions in a toolbar below the header:

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Plan Details</DialogTitle>
  </DialogHeader>

  {/* Action Toolbar */}
  <div className="flex items-center gap-2 border-b pb-3">
    <Button variant="ghost" size="sm">
      <Edit className="w-4 h-4 mr-1.5" />
      Edit
    </Button>
    <Separator orientation="vertical" className="h-4" />
    <Button variant="ghost" size="sm">
      <Download className="w-4 h-4 mr-1.5" />
      PDF
    </Button>
    <Button variant="ghost" size="sm" className="text-red-600">
      <Trash2 className="w-4 h-4 mr-1.5" />
      Delete
    </Button>
  </div>

  {/* Content */}
</DialogContent>
```

### Confirmation Dialogs

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function DeleteConfirmation({ open, onConfirm, onCancel }) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Tables

Use tables for list views (not cards like mobile):

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function TagsTable({ tags }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tags.map((tag) => (
          <TableRow key={tag.id}>
            <TableCell>{tag.name}</TableCell>
            <TableCell>12 periods</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## User Feedback

### Toast Notifications

```tsx
import { toast } from 'sonner';

function Component() {
  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Saved successfully');
    } catch (error) {
      toast.error('Failed to save');
    }
  };
}
```

### Loading States

```tsx
import { Skeleton } from '@/components/ui/skeleton';

function LoadingState() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  );
}
```

## Testing

### Playwright E2E Tests

```bash
# Run all tests
pnpm test:e2e:web

# With UI
pnpm test:e2e:web:ui

# List tests
pnpm test:e2e:web:list
```

Test files in `e2e/`:

```typescript
// e2e/tags.spec.ts
import { test, expect } from '@playwright/test';

test('should create a new tag', async ({ page }) => {
  await page.goto('/tags');
  await page.click('button:has-text("New Tag")');
  await page.fill('input[name="name"]', 'Offense');
  await page.click('button:has-text("Create")');
  await expect(page.locator('text=Offense')).toBeVisible();
});
```

## API Routes

### Stripe Webhook Example

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful checkout
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

## Common Patterns

### Page Template

```tsx
// app/tags/page.tsx
import { TagsTable } from '@/components/tp/tags/TagsTable';
import { TagModal } from '@/components/tp/tags/TagModal';

export default function TagsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button onClick={openModal}>
          <Plus className="w-4 h-4 mr-2" />
          New Tag
        </Button>
      </div>

      <TagsTable />
      <TagModal />
    </div>
  );
}
```

### Data Fetching

```tsx
'use client';

import { useEffect } from 'react';
import { useAppStore } from '@ppa/store';

function TagsPage() {
  const { tags, tagsLoading, fetchTags } = useAppStore();
  const teamId = useTeamId();

  useEffect(() => {
    if (teamId) {
      fetchTags(teamId);
    }
  }, [teamId, fetchTags]);

  if (tagsLoading) return <LoadingSkeleton />;

  return <TagsTable tags={tags} />;
}
```

### Search with Debounce

```tsx
import { useDebouncedCallback } from 'use-debounce';
import { useAppStore } from '@ppa/store';

function SearchInput() {
  const { tagsSearchQuery, setTagsSearchQuery } = useAppStore();

  const handleSearch = useDebouncedCallback((value: string) => {
    setTagsSearchQuery(value);
  }, 300);

  return (
    <Input
      placeholder="Search tags..."
      defaultValue={tagsSearchQuery}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```

## Key Differences from Mobile

| Aspect | Mobile | Web |
|--------|--------|-----|
| Navigation | Bottom tabs | Sidebar |
| Lists | Cards | Tables |
| Modals | Full screen / Bottom sheet | Dialog overlay |
| Layout | Single column | Multi-column |
| Touch | Tap, swipe | Click, hover |
