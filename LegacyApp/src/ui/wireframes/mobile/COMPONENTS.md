# Mobile App Component List

This document lists all reusable UI components identified from the mobile wireframes, organized by category with their usage locations.

**GlueStack v3 Column**: Indicates if the component exists in [GlueStack UI v3](https://gluestack.io/ui/docs/components/all-components)

---

## Layout Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **ScreenContainer** | Base wrapper with safe area, background color | All screens | [ ] (use Box) |
| **HeaderBar** | Top navigation bar with title, back button, actions | All screens | [ ] |
| **BottomTabBar** | Bottom navigation with 3 tabs | Practice, Calendar, Menu tabs | [ ] |
| **TabBarItem** | Individual tab with icon and label | BottomTabBar | [ ] |
| **ModalContainer** | Full-screen modal wrapper with header | All modals | [x] Modal |
| **ModalHeader** | Header for modals (close, title, action) | All modals | [ ] |
| **SectionHeader** | Uppercase label for grouping content | Menu, Periods, Reports, Profile, Coaches | [x] Heading |
| **TPFooterButtons** | **REQUIRED** - Sticky footer with Cancel/Save or Close/Edit buttons | All CRUD modals/screens | [x] Custom |

---

## Navigation Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **BackButton** | Arrow + text back navigation | Menu screens, Auth screens, Modals | [x] Pressable + Icon |
| **MenuItemCard** | Tappable row with icon, title, description, badge | Menu tab | [x] Pressable |
| **FloatingActionButton (FAB)** | Circular action button (bottom-right) | Practice, Calendar, Periods, Templates, Files, Tags, Coaches | [x] Fab |
| **FABMenu** | Action sheet with multiple options from FAB | Practice tab (with existing plan) | [x] Actionsheet |

---

## Form Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **TextInput** | Single-line text input with label | Login, Register, Contact, Team Setup, Announcement Create, Tag Modal, Coach Modal | [x] Input |
| **PasswordInput** | Text input with visibility toggle | Login, Register | [x] Input |
| **TextArea** | Multi-line text input with character count | Contact, Announcement Create | [x] Textarea |
| **SearchBar** | Input with search icon | Periods, Templates, Files, Tags, Coaches, Period Selector, Template Selector, Sport Select | [x] Input + Icon |
| **SegmentedControl** | Toggle between 2-3 options | Plan New (schedule type), Announcement Create (priority), Team Setup (create/join), Contact (type) | [x] TPSegmentedControl |
| **Dropdown/Select** | Picker with label | Reports (time period), Team Settings (sport, team selector) | [x] Select |
| **Checkbox** | Selectable square with checkmark | Period Selector | [x] Checkbox |
| **ToggleSwitch** | On/off toggle | Profile (notifications), Contact (device info) | [x] Switch |
| **DatePickerTrigger** | Tappable field that opens date picker | Plan New, Plan Edit | [x] TPDatePicker |
| **TimePickerTrigger** | Tappable field that opens time picker | Plan New, Plan Edit | [x] TPTimePicker |
| **DurationStepper** | Increment/decrement buttons with value | Plan Edit (activity duration), Practice Tab | [ ] |

---

## Button Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **PrimaryButton** | Full-width blue button | All forms, modals | [x] Button |
| **SecondaryButton** | Outline or lighter button | Various | [x] Button |
| **TextButton/Link** | Text-only tappable link | Login, Register, Forgot Password | [x] Link |
| **IconButton** | Icon-only button (delete, edit, etc.) | Cards with actions | [x] Button + Icon |
| **ActionButton** | Small action in header (Save, Edit, Post) | Modal headers | [x] Button |
| **DangerButton** | Red destructive action button | Profile (logout), Team (delete) | [x] Button |

---

## Card Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **PeriodCard** | Period name, duration, tags, delete action | Periods screen, Period Selector | [x] Card |
| **TemplateCard** | Template name, duration, activity count, tags | Templates screen, Template Selector | [x] Card |
| **AnnouncementCard** | Title, preview, author, timestamp, priority badge, unread indicator | Announcements screen | [x] Card |
| **FileCard** | File type icon, filename, size, date, delete action | Files screen | [x] Card |
| **TagCard** | Tag icon, name, delete action | Tags screen | [x] Card |
| **CoachCard** | Email-derived name, email, permission badge, status badge, delete action | Coaches screen | [x] Card |
| **ActivityCard** | Activity name, time range, duration, tags, notes | Practice Tab, Plan New, Plan Edit | [x] Card |
| **DraggableActivityCard** | ActivityCard with drag handle and reorder controls | Plan New, Plan Edit (edit mode) | [ ] |
| **PracticeListCard** | Date avatar, date, time range, duration, options menu | Calendar screen | [x] Card |
| **StatCard** | Large number, label | Reports screen | [x] Card |
| **SubscriptionPlanCard** | Plan name, price, description, features summary | Subscription screen | [x] Card |

---

## Display Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **Badge** | Small pill with text (tag, status, priority) | Throughout - activities, periods, coaches, announcements | [x] Badge |
| **TagBadge** | Colored pill for activity/period tags | Periods, Templates, Activities, Plan screens | [x] Badge |
| **PriorityBadge** | HIGH/MED/LOW indicator | Announcements | [x] Badge |
| **StatusBadge** | Active/Invited/Inactive outline badge | Coaches | [x] Badge |
| **PermissionBadge** | Admin/Edit/View filled badge | Coaches | [x] Badge |
| **UnreadDot** | Blue dot indicator | Announcements, Menu item | [x] Box |
| **Avatar** | Circle with initials or image | Profile | [x] Avatar |
| **DateAvatar** | Square with day abbreviation and date number | Calendar (practice cards) | [ ] |
| **ProgressBar** | Horizontal fill indicator | Active activity timer, Reports | [x] Progress |
| **Timer** | Countdown/elapsed time display | Practice Tab (active activity) | [ ] |
| **EmptyState** | Icon, title, description for empty lists | All list screens | [ ] |
| **LoadingSpinner** | Centered spinner | Loading states throughout | [x] Spinner |
| **VersionInfo** | App version and build info | Menu tab | [x] Text |
| **CharacterCount** | (X/XXX) counter for text inputs | Contact, Announcement Create | [x] Text |

---

## Dialog & Modal Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **ConfirmationDialog** | Title, message, cancel/confirm buttons | Delete confirmations throughout | [x] AlertDialog |
| **AlertBanner** | Inline error/warning message | Form errors, network errors | [x] Alert |
| **ActionSheet** | Bottom slide-up menu with options | FAB options, three-dot menus, file upload options | [x] Actionsheet |
| **SuccessView** | Checkmark icon, title, description | Forgot Password success, Contact success | [ ] |

---

## Calendar Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **WeekDaysRow** | 7-day row with day names, dates, practice count badges | Calendar screen | [ ] |
| **WeekNavigation** | Previous/next week arrows with date range | Calendar screen | [ ] |
| **CalendarGrid** | Month view with selectable days | Date Picker modal | [ ] |
| **CalendarDayCell** | Individual day with various states (today, selected, disabled) | Date Picker modal | [ ] |
| **MonthNavigation** | Previous/next month arrows with month/year | Date Picker modal | [ ] |

---

## Time Picker Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **TimeSelector** | Hour/minute/AM-PM columns with arrows or scroll | Time Picker modal | [ ] |
| **TimeColumn** | Single scrollable/steppable value column | Time Picker modal | [ ] |

---

## Chart Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **HorizontalBarChart** | Horizontal bars with labels and percentages | Reports (Activity Breakdown) | [ ] |
| **LineChart** | Line graph with day labels | Reports (Weekly Trend) | [ ] |
| **RankedList** | Numbered list with items and counts | Reports (Top Tags) | [ ] |

---

## Auth & Onboarding Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **AppLogo** | App logo image | Login, Register | [x] Image |
| **AuthHeading** | Large title + subtitle combo | Login, Register, Forgot Password | [x] Heading + Text |
| **AuthDivider** | Line with "OR" text | Login, Register | [x] Divider |
| **ProgressIndicator** | Step X of Y with progress bar | Onboarding screens | [x] Progress |
| **RoleSelectionCard** | Large tappable card with icon, title, description, checkmark | Onboarding Role Select | [x] Pressable + Card |
| **SportGridItem** | Square cell with sport icon and name | Onboarding Sport Select | [x] Pressable |
| **SportGrid** | 4-column grid of SportGridItems | Onboarding Sport Select | [x] Grid |

---

## Profile & Settings Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **ProfilePhotoSection** | Large avatar with edit options | Profile screen | [x] Avatar |
| **InfoCard** | Card with label/value pairs | Profile, Team Settings | [x] Card |
| **EditableInfoCard** | InfoCard with edit mode inputs | Profile (edit mode), Team Settings (edit mode) | [x] Card + Input |
| **NotificationToggleRow** | Label, description, toggle switch | Profile screen | [x] Switch + HStack |

---

## Subscription Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **ActivePlanBanner** | Gradient banner with current plan info | Subscription screen | [x] Box |
| **PlanFeatureList** | Checkmark/X list of features | Subscription Plan Detail modal | [x] VStack + Icon |
| **RevenueCatStatusBanner** | Loading/error state for purchases | Subscription screen | [x] Alert |

---

## Announcement Banner Component

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **UnreadAnnouncementBanner** | Tappable banner when unread announcements exist | Main layout (all authenticated screens) | [x] Pressable + Alert |

---

## Utility/Shared Components

| Component | Description | Used On | GlueStack v3 |
|-----------|-------------|---------|:------------:|
| **ThreeDotsMenu** | Vertical dots that open action sheet | Calendar cards, Practice Tab | [x] Menu |
| **CopyButton** | Small button to copy text to clipboard | Profile (Team ID, User ID), Team Settings (Team ID) | [x] Button + Icon |
| **ResendButton** | Link to resend invite/email | Coaches (invited status), Forgot Password | [x] Link |

---

## GlueStack v3 Coverage Summary

| Status | Count | Percentage |
|--------|-------|------------|
| Available in GlueStack v3 or TP Components | ~58 | ~66% |
| Custom Build Required | ~30 | ~34% |
| **TOTAL** | **~88** | 100% |

### TP Components (built with GlueStack/custom implementations):
- `TPBottomSheet` - Bottom sheet modals (uses GlueStack Actionsheet)
- `TPSegmentedControl` - Toggle groups (custom Pressable implementation)
- `TPSwitch` - Boolean toggles (uses GlueStack Switch)
- `TPSlider` - Range inputs (uses GlueStack Slider)
- `TPDatePicker` - Date selection (custom picker with Actionsheet)
- `TPTimePicker` - Time selection (custom picker with Actionsheet)
- `TPProgress` - Progress bars (uses GlueStack Progress)
- `TPGauge` - Circular progress (custom SVG implementation)
- `TPContextMenu` - Long-press menus (uses Actionsheet)

### Components NOT in GlueStack v3 (must build custom):
- ScreenContainer (layout wrapper)
- HeaderBar / BottomTabBar / TabBarItem (navigation)
- ModalHeader
- DurationStepper
- DraggableActivityCard
- DateAvatar / Timer / EmptyState / SuccessView
- All Calendar components (WeekDaysRow, CalendarGrid, etc.)
- All Chart components

---

## Component Count Summary

| Category | Count |
|----------|-------|
| Layout | 8 |
| Navigation | 4 |
| Form | 11 |
| Button | 6 |
| Card | 11 |
| Display | 14 |
| Dialog/Modal | 4 |
| Calendar | 5 |
| Time Picker | 2 |
| Chart | 3 |
| Auth/Onboarding | 7 |
| Profile/Settings | 4 |
| Subscription | 3 |
| Announcement Banner | 1 |
| Utility/Shared | 3 |
| **TOTAL** | **~88 components** |

---

## Implementation Priority Recommendations

### High Priority (Core Components)
These are used across many screens and should be built first:

1. ScreenContainer
2. HeaderBar
3. BottomTabBar
4. PrimaryButton / SecondaryButton
5. TextInput
6. SearchBar
7. Badge / TagBadge
8. EmptyState
9. LoadingSpinner
10. ConfirmationDialog
11. ModalContainer / ModalHeader
12. FloatingActionButton (FAB)

### Medium Priority (Feature Components)
Build these for specific feature screens:

1. ActivityCard / DraggableActivityCard
2. PeriodCard
3. TemplateCard
4. PracticeListCard
5. CalendarGrid / WeekDaysRow
6. DatePickerTrigger / TimePickerTrigger
7. SegmentedControl
8. ActionSheet

### Lower Priority (Specialized Components)
Build these as you implement specific features:

1. Chart components (Reports)
2. Subscription components
3. Onboarding components
4. Profile edit components

---

## TPFooterButtons Pattern (CRITICAL)

**TPFooterButtons is REQUIRED for ALL mobile screens and modals with CRUD operations.**

### Component Import
```tsx
import { TPFooterButtons } from '@/components/tp';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'view' \| 'edit'` | `'edit'` | Determines button labels and actions |
| `onCancel` | `() => void` | required | Cancel/Close action |
| `onSave` | `() => void` | - | Save action (edit mode) |
| `onEdit` | `() => void` | - | Edit action (view mode) |
| `saveLabel` | `string` | `'Save'` | Label for save button |
| `cancelLabel` | `string` | `'Cancel'` | Label for cancel button |
| `editLabel` | `string` | `'Edit'` | Label for edit button |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `saveDisabled` | `boolean` | `false` | Disables save button |
| `canEdit` | `boolean` | `true` | Whether user can edit (view mode) |

### Visual Layout
```
+------------------------------------------+
|  [Cancel]                   [Save/Edit]  |  <- TPFooterButtons
+------------------------------------------+
```

### Mode: Edit (Forms, Create, Edit screens)
- Left button: "Cancel" (outline style)
- Right button: Save label (filled primary)
- Used on: Create/Edit modals, form screens

### Mode: View (Detail screens)
- Left button: "Close" (outline style)
- Right button: "Edit" (filled primary, if canEdit=true)
- Used on: Detail view screens before entering edit mode

### Screens/Modals Requiring TPFooterButtons
| Screen/Modal | Mode | Save Label | Notes |
|--------------|------|------------|-------|
| Plan New | edit | "Create" | Create practice plan |
| Plan Edit | view → edit | "Save" | Toggle between view/edit |
| Tag Modal | edit | "Create"/"Save" | Create or edit tag |
| Coach Modal | edit | "Send Invite"/"Save" | Invite or edit coach |
| Period Modal | edit | "Create"/"Save" | Create or edit period |
| Template Modal | edit | "Create"/"Save" | Create or edit template |
| File Modal | edit | "Upload"/"Save" | Upload or edit file |
| Activity Modal | edit | "Add"/"Save" | Add or edit activity |
| Announcement Create | edit | "Post" | Create announcement |
| Profile (edit mode) | edit | "Save" | Edit profile info |
| Team Settings (edit) | edit | "Save" | Edit team settings |

### Wireframe Notation
In wireframes, TPFooterButtons should appear at the bottom of the screen:
```
+------------------------------------------+
|            SCREEN CONTENT                |
|                                          |
+------------------------------------------+
|  TPFooterButtons                         |
|  mode="edit" | saveLabel="Create"        |
|  [Cancel]                   [Create]     |
+------------------------------------------+
```
