# Component Library

This document provides an overview of the component systems used in Practice Plan App.

## Overview

| Platform | Base Library | Wrapper Pattern |
|----------|--------------|-----------------|
| Mobile | GlueStack UI v3 | TP Components |
| Web | shadcn/ui (Radix) | TP Components |

Both platforms use TP-prefixed wrapper components that:
- Enforce consistent styling
- Simplify APIs
- Apply project-specific defaults

## Mobile Components

### Location

```
src/apps/mobile/components/
├── tp/          # TP wrapper components
├── ui/          # GlueStack UI wrappers
├── screens/     # Screen-specific components
├── forms/       # Form components
├── calendar/    # Calendar components
└── navigation/  # Navigation components
```

### TP Components (Mobile)

Import from `@/components/tp`:

#### Core Layout

| Component | Description | Base |
|-----------|-------------|------|
| `TPScreen` | Screen wrapper with safe area | View |
| `TPContainer` | Content container | Box |
| `TPHeader` | Screen header | Custom |
| `TPCard` | Content card | Box |
| `TPKeyboardAvoidingView` | Keyboard-aware wrapper | RN |

#### Lists & Data Display

| Component | Description | Base |
|-----------|-------------|------|
| `TPList` | Scrollable list | FlatList |
| `TPEmpty` | Empty state display | Custom |
| `TPLoading` | Loading spinner | Spinner |
| `TPSearch` | Search input | Input |
| `TPTag` | Tag badge | Badge |
| `TPAvatar` | User avatar | Avatar |
| `TPDivider` | Horizontal divider | Divider |
| `TPPeriodCard` | Period item card | Card |

#### Forms

| Component | Description | Base |
|-----------|-------------|------|
| `TPInput` | Text input | Input |
| `TPTextarea` | Multi-line input | Textarea |
| `TPRichTextEditor` | Rich text editor | Custom |
| `TPRichTextDisplay` | Rich text display | Custom |
| `TPSelect` | Dropdown select | Actionsheet |
| `TPCheckbox` | Checkbox input | Checkbox |
| `TPButton` | Button | Button |
| `TPFooterButtons` | CRUD footer buttons | Custom |
| `TPDatePicker` | Date picker | Custom |
| `TPTimePicker` | Time picker | Custom |
| `TPSwitch` | Toggle switch | Switch |
| `TPSlider` | Range slider | Slider |
| `TPSegmentedControl` | Toggle group | Custom |

#### Feedback & Status

| Component | Description | Base |
|-----------|-------------|------|
| `TPAlert` | Confirmation dialog | AlertDialog |
| `TPProgress` | Progress bar | Progress |
| `TPGauge` | Circular progress | SVG |
| `TPBadge` | Badge | Badge |
| `TPCountBadge` | Count badge | Badge |
| `TPToast` | Toast notifications | Toast |

#### Actions & Navigation

| Component | Description | Base |
|-----------|-------------|------|
| `TPFab` | Floating action button | Fab |
| `TPBottomSheet` | Bottom sheet modal | Actionsheet |
| `TPActionSheet` | Action menu | Actionsheet |
| `TPContextMenu` | Long-press menu | Actionsheet |

#### Special

| Component | Description | Base |
|-----------|-------------|------|
| `TPPermissionGuard` | Permission-based rendering | Custom |
| `TPPaywall` | Subscription paywall | Custom |
| `TPUpgradeBanner` | Upgrade prompt | Custom |
| `TPPdfTemplateSheet` | PDF template selector | Actionsheet |

### Usage Example (Mobile)

```tsx
import {
  TPScreen,
  TPHeader,
  TPInput,
  TPButton,
  TPFooterButtons,
  TPAlert,
  useToast,
} from '@/components/tp';

function TagDetailScreen() {
  const { showToast } = useToast();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <TPScreen>
      <TPHeader title="Edit Tag" />

      <TPInput
        label="Name"
        value={name}
        onChangeText={setName}
      />

      <TPFooterButtons
        mode="edit"
        onCancel={handleCancel}
        onSave={handleSave}
      />

      <TPAlert
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Tag?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </TPScreen>
  );
}
```

## Web Components

### Location

```
src/apps/web/components/
├── ui/          # shadcn/ui base components
├── tp/          # TP wrapper components
│   ├── announcements/
│   ├── calendar/
│   ├── coaches/
│   ├── files/
│   ├── periods/
│   ├── plan/
│   ├── profile/
│   ├── reports/
│   ├── subscription/
│   ├── tags/
│   ├── team/
│   └── templates/
└── providers/   # React providers
```

### shadcn/ui Base Components

Located in `components/ui/`:

| Component | Description |
|-----------|-------------|
| `button` | Button variants |
| `dialog` | Modal dialog |
| `alert-dialog` | Confirmation dialog |
| `dropdown-menu` | Dropdown menu |
| `input` | Text input |
| `tabs` | Tab navigation |
| `sidebar` | Sidebar navigation |
| `sheet` | Slide-out panel |
| `scroll-area` | Scrollable container |
| `avatar` | User avatar |
| `separator` | Divider |
| `switch` | Toggle switch |
| `tooltip` | Tooltip |
| `skeleton` | Loading skeleton |

### TP Components (Web)

Import from `@/components/tp`:

| Component | Description | Base |
|-----------|-------------|------|
| `TPAppShell` | Main app layout | Custom |
| `TPHeader` | Page header | Custom |
| `TPSidebar` | Navigation sidebar | Sidebar |
| `TPPaywall` | Subscription paywall | Dialog |
| `TPRichTextEditor` | Rich text editor | Tiptap |
| `TPRichTextDisplay` | Rich text display | Tiptap |

### Feature Components (Web)

Each feature has its own component folder:

```
components/tp/tags/
├── TagsTable.tsx
├── TagModal.tsx
├── TagRow.tsx
└── TagDeleteDialog.tsx
```

### Usage Example (Web)

```tsx
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function TagModal({ open, onClose }) {
  const handleSave = async () => {
    try {
      await createTag({ name });
      toast.success('Tag created');
      onClose();
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Tag name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Mobile-Web Components (@ppa/mobile-web)

Platform-specific components for mobile viewport (< 768px). Used in web app mobile views.

### Layout Components

#### MWPage
Full-screen page container with safe area handling.

**Props**:
- `hasHeader` - Add top padding for fixed header
- `hasFooter` - Add bottom padding for tab bar
- `variant` - 'default' | 'gray' | 'white'
- `safeArea` - Enable safe area insets (default: true)

#### MWPageContent
Scrollable content area within MWPage.

**Props**:
- `padding` - 'none' | 'sm' | 'md' | 'lg'
- `scroll` - Enable scrolling (default: true)

### List Components

#### MWList
iOS-style grouped list container.

**Props**:
- `variant` - 'default' | 'inset' | 'plain'
- `header` - Optional section header text
- `footer` - Optional section footer text

**Usage**:
```tsx
<MWList variant="inset" header="Settings">
  <MWListItem title="Account" />
  <MWListItem title="Privacy" />
</MWList>
```

#### MWListItem
Individual list item with icon, text, and chevron.

**Props**:
- `title` - Primary text (required)
- `subtitle` - Secondary text
- `left` - Left icon/element
- `right` - Custom right element (overrides chevron)
- `showChevron` - Show right chevron for navigation
- `onPress` - Click handler
- `destructive` - Red text for delete actions
- `disabled` - Disabled state

**Usage**:
```tsx
<MWListItem
  title="Period Name"
  subtitle="35 min"
  showChevron
  onPress={handleClick}
  left={<MWListItemIcon color="blue"><Clock /></MWListItemIcon>}
/>
```

#### MWListItemIcon
Colored icon container for list items.

**Props**:
- `color` - 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'purple'
- `size` - 'sm' | 'md'

### Input Components

#### MWSearchBar
iOS-style search with cancel button.

**Props**:
- `value` - Current search value
- `onChange` - Change handler
- `placeholder` - Placeholder text
- `showCancel` - Show cancel button (default: true)
- `onCancel` - Cancel handler

**Usage**:
```tsx
<MWSearchBar
  value={query}
  onChange={setQuery}
  placeholder="Search periods..."
/>
```

### View Switching

#### MWViewSwitch
Renders mobile or desktop component based on viewport.

**Props**:
- `mobile` - Component for mobile view
- `desktop` - Component for desktop view
- `fallback` - Loading state component

**Usage**:
```tsx
<MWViewSwitch
  mobile={<PeriodsMobileView {...props} />}
  desktop={<PeriodsDesktopTable {...props} />}
/>
```

### See Also

- Full API: `src/packages/mobile-web/src/components/`
- Example: `src/apps/web/components/tp/periods/PeriodsMobileView.tsx`

## Component Comparison

### Layout

| Mobile | Web |
|--------|-----|
| `TPScreen` | Page component |
| `TPHeader` | `TPHeader` |
| `TPCard` | `Card` |
| Bottom tabs | `TPSidebar` |

### Forms

| Mobile | Web |
|--------|-----|
| `TPInput` | `Input` |
| `TPTextarea` | `Textarea` |
| `TPButton` | `Button` |
| `TPSelect` | `Select` |
| `TPSwitch` | `Switch` |
| `TPDatePicker` | Date picker |
| `TPTimePicker` | Time picker |

### Dialogs

| Mobile | Web |
|--------|-----|
| Expo Router modal | `Dialog` |
| `TPBottomSheet` | `Sheet` |
| `TPAlert` | `AlertDialog` |
| `TPActionSheet` | `DropdownMenu` |

### Feedback

| Mobile | Web |
|--------|-----|
| `TPToast` + `useToast` | `toast` (sonner) |
| `TPLoading` | `Skeleton` |
| `TPEmpty` | Custom empty state |
| `TPProgress` | `Progress` |

## Icons

### Mobile (Lucide React Native)

```tsx
import { Plus, Trash2, Edit } from 'lucide-react-native';

<Plus size={24} color={COLORS.primary} />
```

### Web (Lucide React)

```tsx
import { Plus, Trash2, Edit } from 'lucide-react';

<Plus className="w-4 h-4" />
```

### Icon Styling Guidelines

- Keep icons subtle (gray on gray background)
- Standard: `bg-gray-100` + `text-gray-600`
- Primary accent (sparingly): `bg-primary-100` + `text-primary-500`
- Never use rainbow of colors
- Never use bright/saturated colors as default

## Accessibility

### Color Contrast

- All text must meet WCAG AA (4.5:1 ratio)
- Never use opacity for text (e.g., `text-white/70`)
- On dark backgrounds: use `text-white`
- On light backgrounds: use `text-gray-700` minimum

### Active States

```tsx
// Mobile
<Pressable
  className={cn(
    'p-3 rounded-lg',
    isActive ? 'bg-primary-500' : 'bg-gray-100'
  )}
>
  <Text className={isActive ? 'text-white' : 'text-gray-700'}>
    Item
  </Text>
</Pressable>

// Web
<button
  className={cn(
    'p-3 rounded-lg',
    isActive ? 'bg-[#356793] text-white' : 'bg-gray-100 text-gray-700'
  )}
>
  Item
</button>
```

## Adding New Components

### Mobile

1. Create in `components/tp/TPNewComponent.tsx`
2. Export from `components/tp/index.ts`
3. Use GlueStack UI as base when possible

### Web

1. Install shadcn component: `npx shadcn@latest add component-name`
2. Create wrapper if needed in `components/tp/`
3. Export from `components/tp/index.ts`

## Component Documentation

For detailed component inventories, see:

- [Mobile Components](../src/ui/wireframes/mobile/COMPONENTS.md)
- [Web Components](../src/ui/wireframes/web/COMPONENTS.md)
