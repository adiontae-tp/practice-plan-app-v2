# Web App Component List

This document lists all reusable UI components identified from the web/desktop wireframes, organized by category with their usage locations.

**shadcn/ui Column**: Indicates if the component exists in [shadcn/ui](https://ui.shadcn.com/docs/components)

---

## Layout Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **AppShell** | Main layout wrapper with header, sidebar, content area | All authenticated screens | [ ] |
| **TopHeader** | Full-width header with logo, team selector, user menu | All authenticated screens | [ ] |
| **AppSidebar** | Left navigation with collapsible sections | All authenticated screens | [x] Sidebar |
| **SidebarSection** | Collapsible section with header (Planning, Communication, etc.) | AppSidebar | [x] Collapsible |
| **SidebarNavItem** | Clickable nav item with icon and label | AppSidebar | [x] Navigation Menu |
| **ContentArea** | Main content container with background | All screens | [ ] |
| **PageHeader** | Page title with optional subtitle and action buttons | All screens | [ ] |
| **ModalOverlay** | Centered modal wrapper with backdrop | All modals | [x] Dialog |
| **ModalContainer** | Modal content wrapper with header and body | All modals | [x] Dialog |
| **ModalHeader** | Modal header with close button, title, actions | All modals | [ ] |
| **SectionCard** | Contained section with title and content | Profile, Team, Practice, Reports | [x] Card |
| **TwoColumnLayout** | Side-by-side columns with configurable widths | Profile | [ ] |

---

## Navigation Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **TeamSelector** | Dropdown in header to switch teams | TopHeader | [x] Select |
| **UserMenu** | Avatar dropdown with user options (profile, logout) | TopHeader | [x] Dropdown Menu |
| **NavigationDot** | Active indicator for sidebar items | AppSidebar | [ ] |
| **UnreadAnnouncementBanner** | Top banner when unread announcements exist | ContentArea (all screens) | [x] Alert |

---

## Table Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **DataTable** | Base table with gradient header, sortable columns | Periods, Templates, Files, Tags, Coaches, Reports | [x] Table / Data Table |
| **TableHeader** | Gradient header row with column titles | DataTable | [x] Table |
| **TableRow** | Body row with hover state, click action | DataTable | [x] Table |
| **TableCell** | Cell with various content types | DataTable | [x] Table |
| **TableActionCell** | Cell with action buttons (edit, delete) | DataTable | [x] Table |
| **TableHeaderBar** | Search input + action button above table | Periods, Templates, Files, Tags, Coaches | [ ] |
| **SortableColumnHeader** | Column header with sort direction indicator | DataTable (Reports) | [x] Data Table |
| **TableEmptyState** | Empty state shown when no data | All table screens | [x] Empty |
| **RowNumberBadge** | Circular badge with row number | Tables | [x] Badge |

---

## Form Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **TextInput** | Single-line text input with label | All forms, modals | [x] Input |
| **PasswordInput** | Password input with visibility toggle | Login, Register | [x] Input |
| **TextArea** | Multi-line text input | Contact, Announcement Create | [x] Textarea |
| **SearchInput** | Input with search icon | All table screens | [x] Input |
| **Select/Dropdown** | Dropdown picker with options | Team Settings (sport), Reports (time period) | [x] Select |
| **ToggleButtonGroup** | Segmented toggle buttons | Calendar (Week/Month), Reports (Period/Tag) | [x] Toggle Group |
| **Checkbox** | Selectable checkbox | Period Selector, Contact (device info) | [x] Checkbox |
| **ToggleSwitch** | On/off toggle | Profile (notifications), Contact | [x] Switch |
| **DatePicker** | Date selection component | Plan New/Edit | [x] Date Picker |
| **TimePicker** | Time selection component | Plan New/Edit | [ ] |
| **DurationInput** | Duration input with formatting | Activity edit | [ ] |
| **FileDropzone** | Drag-and-drop file upload area | Files upload modal | [ ] |

---

## Button Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **PrimaryButton** | Blue filled button | All forms, CTAs | [x] Button |
| **SecondaryButton** | Outline/light button | Cancel actions, secondary actions | [x] Button |
| **TextButton/Link** | Text-only clickable link | Login, Register, table actions | [x] Button (variant) |
| **IconButton** | Icon-only button (edit, delete, copy) | Tables, cards | [x] Button |
| **DangerButton** | Red destructive button | Delete actions, Logout | [x] Button |
| **HeaderActionButton** | Action buttons in page/modal headers | Edit, Save, Cancel | [x] Button |
| **CreateButton** | "+ New X" button | Table headers | [x] Button |
| **MenuButton** | Three-dot menu trigger | Practice list items, Calendar | [x] Button |

---

## Card Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **AnnouncementCard** | Card with title, preview, metadata, priority | Announcements | [x] Card |
| **PracticeBlockCard** | Time/duration block in week calendar | Calendar (Week View) | [x] Card |
| **PracticeListItem** | Practice row in month view selected day | Calendar (Month View) | [x] Card |
| **ActivityTableRow** | Activity row in practice plan table | Practice Dashboard, Plan Detail | [x] Table |
| **StatCard** | Large number with label | Reports, Practice Dashboard | [x] Card |
| **InfoCard** | Card with label/value pairs | Profile, Team Settings | [x] Card |
| **SubscriptionPlanCard** | Plan card with price and features | Subscription | [x] Card |
| **QuickActionsCard** | Card with action buttons list | Practice Dashboard | [x] Card |

---

## Display Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **Badge** | Small pill with text | Throughout | [x] Badge |
| **TagBadge** | Colored pill for activity/period tags | Tables, Activity rows | [x] Badge |
| **PriorityBadge** | HIGH/MED/LOW indicator | Announcements | [x] Badge |
| **PermissionBadge** | Admin/Edit/View filled badge | Coaches | [x] Badge |
| **StatusBadge** | Active/Invited/Inactive outline badge | Coaches, Profile | [x] Badge |
| **CurrentPlanBadge** | Green "Current" badge | Subscription cards | [x] Badge |
| **PopularBanner** | "Most Popular" gradient banner | Subscription (Pro plan) | [ ] |
| **UnreadDot** | Blue dot indicator | Announcements, Sidebar | [ ] |
| **NotesIndicator** | [N] icon when notes exist | Tables | [ ] |
| **Avatar** | Circle with initials or image | Profile, TopHeader | [x] Avatar |
| **LoadingSpinner** | Centered spinner | Loading states | [x] Spinner |
| **EmptyState** | Icon, title, description | All list/table screens | [x] Empty |
| **VersionInfo** | App version display | Footer or settings | [ ] |
| **CopyButton** | Small button to copy to clipboard | Profile, Team Settings | [x] Button |
| **TimerDisplay** | Countdown/elapsed time | Practice Dashboard (active) | [ ] |
| **ProgressBar** | Horizontal progress indicator | Active activity, Reports | [x] Progress |

---

## Dialog Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **ConfirmationDialog** | Title, message, cancel/confirm | Delete confirmations | [x] Alert Dialog |
| **DestructiveConfirmDialog** | With "type DELETE" requirement | Team delete | [x] Alert Dialog |
| **AlertBanner** | Inline info/warning/error message | Forms, status messages | [x] Alert |
| **ActionMenu** | Dropdown menu with action options | Three-dot menus | [x] Dropdown Menu |
| **Toast** | Temporary notification | Success/error feedback | [x] Toast / Sonner |

---

## Calendar Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **CalendarHeader** | Navigation arrows, date display, view toggle | Calendar | [ ] |
| **WeekViewGrid** | 7-column week grid layout | Calendar (Week View) | [ ] |
| **WeekDayColumn** | Single day column with practices | Calendar (Week View) | [ ] |
| **DayHeader** | Day name and date with today highlight | Calendar (Week View) | [ ] |
| **MonthViewGrid** | Full month calendar grid | Calendar (Month View) | [x] Calendar |
| **MonthDayCell** | Single day cell with practice count | Calendar (Month View) | [x] Calendar |
| **SelectedDayPanel** | Practice list for selected day | Calendar (Month View) | [ ] |
| **ViewModeToggle** | Week/Month toggle buttons | Calendar | [x] Toggle Group |

---

## Practice/Plan Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **PlanHeader** | Date, time, duration info section | Practice Dashboard, Plan Detail | [ ] |
| **ActivityTable** | Table of activities with timing | Practice Dashboard, Plan Detail | [x] Table |
| **ActivityRow** | Single activity with time, duration, tags | ActivityTable | [x] Table |
| **ActiveActivityRow** | Activity row with timer/progress | Practice Dashboard | [ ] |
| **TotalDurationRow** | Summary row with total time | ActivityTable | [x] Table |
| **DraggableActivityRow** | Activity row with drag handle, reorder controls | Plan Edit mode | [ ] |
| **PracticeStatusIndicator** | Active/Upcoming/Completed status | Practice Dashboard | [x] Badge |
| **AddActivityMenu** | Dropdown with add options | Plan Edit mode | [x] Dropdown Menu |

---

## Report Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **ReportTabSelector** | Toggle between Period/Tag usage | Reports | [x] Tabs |
| **SummaryCardsRow** | Horizontal row of stat cards | Reports | [ ] |
| **BreakdownTable** | Table with usage statistics | Reports | [x] Table |
| **HorizontalBarChart** | Bar chart for visualizations | Reports (optional) | [x] Chart |
| **PieChart** | Pie/donut chart for distributions | Reports (optional) | [x] Chart |
| **DateRangeFilter** | Dropdown for time period filter | Reports | [x] Select |
| **ExportButton** | Button to export report | Reports | [x] Button |

---

## Auth Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **AuthPageLayout** | Centered card layout for auth screens | Login, Register, Forgot Password | [x] Card |
| **AppLogo** | App logo image | Auth screens | [ ] |
| **AuthHeading** | Large title + subtitle | Auth screens | [ ] |
| **AuthDivider** | Line with "OR" text | Login, Register | [x] Separator |
| **SocialAuthButtons** | Google/Apple sign-in buttons | Login, Register | [x] Button |
| **ProgressIndicator** | Step X of Y indicator | Onboarding screens | [x] Progress |
| **RoleSelectionCard** | Large card for role selection | Onboarding Role Select | [x] Card |
| **SportGrid** | Grid of sport options | Onboarding Sport Select | [ ] |
| **SportGridItem** | Single sport option cell | SportGrid | [ ] |
| **SuccessView** | Checkmark with success message | Forgot Password success | [ ] |

---

## Profile & Settings Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **ProfilePhotoCard** | Photo with edit options | Profile | [x] Avatar + Card |
| **QuickInfoCard** | Role, status, permission badges | Profile | [x] Card |
| **PersonalInfoCard** | Editable personal info | Profile | [x] Card + Input |
| **AccountInfoCard** | Read-only account info with copy buttons | Profile | [x] Card |
| **TeamInfoCard** | Team name, sport, ID | Team Settings | [x] Card |
| **TeamSelectorDropdown** | Multi-team selector | Team Settings | [x] Select |
| **AdminNoticeCard** | "Admin access required" notice | Team Settings (non-admin) | [x] Alert |
| **NotificationSettingsCard** | Toggle rows for notifications | Profile | [x] Card + Switch |

---

## Subscription Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **SubscriptionPageHeader** | Title and subtitle | Subscription | [ ] |
| **ActivePlanBanner** | Gradient banner with current plan | Subscription | [ ] |
| **PlanCardsRow** | Horizontal row of plan cards | Subscription | [ ] |
| **PlanDetailModal** | Full plan details with features | Subscription | [x] Dialog |
| **FeatureList** | Checkmark/X list of features | PlanDetailModal | [ ] |
| **SubscriptionActionLinks** | Restore/Manage links | Subscription | [x] Button |
| **RevenueCatStatusBanner** | Loading/error state for purchases | Subscription | [x] Alert |

---

## Contact Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **ContactCard** | Centered card with mail icon | Contact | [x] Card |
| **DeveloperInfoSection** | Developer team info | Contact | [ ] |
| **EmailButton** | Primary button to send email | Contact | [x] Button |
| **InfoBox** | Tip box with info icon | Contact | [x] Alert |

---

## Utility Components

| Component | Description | Used On | shadcn/ui |
|-----------|-------------|---------|:---------:|
| **ThreeDotsMenu** | Vertical dots menu trigger | Calendar items, tables | [x] Dropdown Menu |
| **GlobalBadge** | [Global] badge for library items | Periods (Global Library) | [x] Badge |
| **ResendButton** | Resend invite link | Coaches | [x] Button |
| **CharacterCount** | Character counter for text inputs | TextArea | [ ] |

---

## shadcn/ui Coverage Summary

| Status | Count | Percentage |
|--------|-------|------------|
| Available in shadcn/ui | ~85 | ~69% |
| Custom Build Required | ~38 | ~31% |
| **TOTAL** | **~123** | 100% |

### Components NOT in shadcn/ui (must build custom):
- AppShell / TopHeader / ContentArea (layout wrappers)
- PageHeader / ModalHeader / TableHeaderBar
- TimePicker / DurationInput / FileDropzone
- PopularBanner / UnreadDot / NotesIndicator / VersionInfo / TimerDisplay
- CalendarHeader / WeekViewGrid / WeekDayColumn / DayHeader / SelectedDayPanel
- PlanHeader / ActiveActivityRow / DraggableActivityRow
- SummaryCardsRow
- AppLogo / AuthHeading / SportGrid / SportGridItem / SuccessView
- SubscriptionPageHeader / ActivePlanBanner / PlanCardsRow / FeatureList
- DeveloperInfoSection / CharacterCount

---

## Component Count Summary

| Category | Count |
|----------|-------|
| Layout | 12 |
| Navigation | 4 |
| Table | 9 |
| Form | 12 |
| Button | 8 |
| Card | 8 |
| Display | 16 |
| Dialog | 5 |
| Calendar | 8 |
| Practice/Plan | 8 |
| Report | 7 |
| Auth | 10 |
| Profile/Settings | 8 |
| Subscription | 7 |
| Contact | 4 |
| Utility | 4 |
| **TOTAL** | **~123 components** |

---

## Shared Components (Mobile & Web)

Many components can be shared between mobile and web with responsive adaptations:

### Fully Shareable
- All Badge/Tag components
- EmptyState
- LoadingSpinner
- ConfirmationDialog
- Avatar
- ProgressBar
- All Auth components (with responsive styling)
- Form inputs (TextInput, PasswordInput, etc.)

### Responsive Variants Needed
- Tables (web) vs Cards (mobile)
- Sidebar (web) vs BottomTabBar (mobile)
- Modal overlays (web) vs full-screen modals (mobile)
- Calendar week grid (web) vs single week row (mobile)

---

## Implementation Priority Recommendations

### High Priority (Core Components)
Build these first as they're used across many screens:

1. AppShell (TopHeader + AppSidebar + ContentArea)
2. DataTable + TableRow + TableHeader
3. ModalOverlay + ModalContainer
4. PrimaryButton / SecondaryButton
5. TextInput / SearchInput
6. Badge / TagBadge
7. EmptyState
8. LoadingSpinner
9. ConfirmationDialog
10. PageHeader

### Medium Priority (Feature Components)
Build these for specific feature screens:

1. CalendarHeader + WeekViewGrid + MonthViewGrid
2. ActivityTable + ActivityRow
3. AnnouncementCard
4. StatCard
5. SubscriptionPlanCard
6. ProfilePhotoCard + InfoCard

### Lower Priority (Specialized Components)
Build these as you implement specific features:

1. Chart components (Reports)
2. FileDropzone (Files)
3. Onboarding components
4. RevenueCat status components

---

## Key Differences from Mobile

| Aspect | Mobile | Web |
|--------|--------|-----|
| **Navigation** | BottomTabBar + Stack | Sidebar + Slot |
| **Lists** | Card-based | Table-based |
| **Modals** | Full-screen | Overlay dialogs |
| **Calendar** | Week row + list | Full week/month grid |
| **FAB** | Floating action button | Header button |
| **Layout** | Single column | Multi-column |
| **Touch** | Tap, swipe, drag | Click, hover, keyboard |
