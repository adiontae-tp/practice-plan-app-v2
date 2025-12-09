# Mobile App Guide

The mobile app is built with React Native, Expo SDK 54, and uses Expo Router for file-based navigation.

## Location

```
src/apps/mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (login, register, onboarding)
│   ├── (main)/            # Main app screens
│   │   ├── (tabs)/        # Bottom tab navigation
│   │   ├── plan/          # Plan-related screens
│   │   └── *.tsx          # Modal/detail screens
│   ├── (modals)/          # Modal screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry/redirect
├── components/
│   ├── tp/                # TP wrapper components
│   ├── ui/                # GlueStack UI wrappers
│   ├── screens/           # Screen-specific components
│   ├── forms/             # Form components
│   ├── calendar/          # Calendar components
│   └── navigation/        # Navigation components
├── hooks/                 # Mobile-specific hooks
├── services/              # Platform services
├── contexts/              # React contexts
├── e2e/                   # Maestro E2E tests
├── app.json              # Expo app config
├── app.config.js         # Dynamic config
└── tailwind.config.js    # NativeWind config
```

## Running the App

```bash
# Development server
pnpm mobile

# Or directly
cd src/apps/mobile
npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

## Navigation Structure

### Route Groups

```
app/
├── (auth)/                  # Unauthenticated users
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── onboarding/
├── (main)/                  # Authenticated users
│   ├── (tabs)/             # Tab navigator
│   │   ├── _layout.tsx     # Tab bar config
│   │   ├── index.tsx       # Practice tab
│   │   ├── calendar.tsx    # Calendar tab
│   │   └── menu.tsx        # Menu tab
│   ├── plan/               # Plan screens
│   │   ├── new.tsx
│   │   └── [id].tsx
│   └── *.tsx               # Detail/modal screens
└── (modals)/               # Global modals
```

### Tab Navigation

| Tab | Screen | Description |
|-----|--------|-------------|
| Practice | `(tabs)/index.tsx` | Current/upcoming practice |
| Calendar | `(tabs)/calendar.tsx` | Week/month calendar |
| Menu | `(tabs)/menu.tsx` | Settings and navigation |

### Screen Hierarchy

```
Menu Tab
├── Profile
├── Team Settings
├── Announcements
│   └── Announcement Detail
├── Periods
│   └── Period Detail
├── Templates
│   └── Template Detail
├── Files
│   └── File Detail
├── Tags
│   └── Tag Detail
├── Coaches
│   └── Coach Detail
├── Reports
├── Subscription
└── Contact
```

## Provider Stack

The app wraps content with multiple providers:

```tsx
<GestureHandlerRootView>
  <GluestackUIProvider mode="light">
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <TeamThemeProvider>
            <SubscriptionProvider>
              <NotificationProvider>
                <Slot />
              </NotificationProvider>
            </SubscriptionProvider>
          </TeamThemeProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </GluestackUIProvider>
</GestureHandlerRootView>
```

## TP Component System

### Overview

TP (Team Parcee) components are wrappers around GlueStack UI that provide:
- Consistent styling
- Simplified APIs
- Project-specific patterns

### Import

```tsx
import { TPButton, TPCard, TPInput } from '@/components/tp';
```

### Available Components

#### Core Layout
| Component | Description |
|-----------|-------------|
| `TPScreen` | Screen wrapper with safe area |
| `TPContainer` | Content container |
| `TPHeader` | Screen header |
| `TPCard` | Content card |
| `TPKeyboardAvoidingView` | Keyboard-aware wrapper |

#### Lists & Data Display
| Component | Description |
|-----------|-------------|
| `TPList` | Scrollable list |
| `TPEmpty` | Empty state display |
| `TPLoading` | Loading spinner |
| `TPSearch` | Search input |
| `TPTag` | Tag badge |
| `TPAvatar` | User avatar |
| `TPDivider` | Horizontal divider |
| `TPPeriodCard` | Period item card |

#### Forms
| Component | Description |
|-----------|-------------|
| `TPInput` | Text input |
| `TPTextarea` | Multi-line input |
| `TPRichTextEditor` | Rich text editor |
| `TPRichTextDisplay` | Rich text display |
| `TPSelect` | Dropdown select |
| `TPCheckbox` | Checkbox input |
| `TPButton` | Button |
| `TPFooterButtons` | CRUD footer buttons |
| `TPDatePicker` | Date picker |
| `TPTimePicker` | Time picker |
| `TPSwitch` | Toggle switch |
| `TPSlider` | Range slider |
| `TPSegmentedControl` | Toggle group |

#### Feedback & Status
| Component | Description |
|-----------|-------------|
| `TPAlert` | Confirmation dialog |
| `TPProgress` | Progress bar |
| `TPGauge` | Circular progress |
| `TPBadge` / `TPCountBadge` | Badges |
| `TPToast` / `useToast` | Toast notifications |

#### Actions & Navigation
| Component | Description |
|-----------|-------------|
| `TPFab` | Floating action button |
| `TPBottomSheet` | Bottom sheet modal |
| `TPActionSheet` | Action menu |
| `TPContextMenu` | Long-press menu |

#### Special
| Component | Description |
|-----------|-------------|
| `TPPermissionGuard` | Permission-based rendering |
| `TPPaywall` | Subscription paywall |
| `TPUpgradeBanner` | Upgrade prompt |
| `TPPdfTemplateSheet` | PDF template selector |

## Modal Patterns

### CRITICAL: Never use GlueStack Modal

For modals on mobile, use:

1. **Expo Router Modal** - For full forms/screens
   ```tsx
   router.push('/period-detail');
   ```

2. **TPBottomSheet** - For quick data/actions
   ```tsx
   <TPBottomSheet isOpen={showSheet} onClose={handleClose}>
     {/* Content */}
   </TPBottomSheet>
   ```

3. **TPAlert** - For confirmations
   ```tsx
   <TPAlert
     isOpen={showDelete}
     onClose={() => setShowDelete(false)}
     title="Delete Period?"
     message="This cannot be undone."
     confirmLabel="Delete"
     onConfirm={handleDelete}
     variant="destructive"
   />
   ```

## TPFooterButtons

**Required for all CRUD screens/modals.**

```tsx
import { TPFooterButtons } from '@/components/tp';

// View mode
<TPFooterButtons
  mode="view"
  onCancel={handleClose}
  onEdit={handleEdit}
  canEdit={userCanEdit}
/>

// Edit mode
<TPFooterButtons
  mode="edit"
  onCancel={handleCancel}
  onSave={handleSave}
  saveLabel="Create"
  loading={isLoading}
  saveDisabled={!isValid}
/>
```

## Styling

### NativeWind (Tailwind)

```tsx
import { View, Text } from 'react-native';

function Example() {
  return (
    <View className="flex-1 p-4 bg-background-0">
      <Text className="text-lg font-bold text-typography-900">
        Hello World
      </Text>
    </View>
  );
}
```

### Colors from Branding

```tsx
import { COLORS, HEADER_STYLE, TAB_BAR_STYLE } from '@ppa/ui/branding';

// For React Navigation
const screenOptions = {
  headerStyle: { backgroundColor: HEADER_STYLE.backgroundColor },
  headerTintColor: HEADER_STYLE.tintColor,
};

// For StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
});
```

## State Management

Use Zustand store, not local state:

```tsx
import { useAppStore } from '@ppa/store';

function TagsScreen() {
  const {
    // Data
    tags,
    tagsLoading,
    // UI state
    tagsSearchQuery,
    tagsShowCreateModal,
    // Actions
    setTagsSearchQuery,
    setTagsShowCreateModal,
    createTag,
  } = useAppStore();

  // Use directly in component
  return (
    <TPSearch
      value={tagsSearchQuery}
      onChangeText={setTagsSearchQuery}
    />
  );
}
```

## Testing

### Maestro E2E Tests

```bash
# Run all flows
pnpm test:e2e:mobile

# Or directly
cd src/apps/mobile
maestro test e2e/flows
```

Test flows are in `e2e/flows/`:
```
e2e/
├── flows/
│   ├── auth/
│   │   ├── login.yaml
│   │   └── register.yaml
│   └── practice/
│       └── create-plan.yaml
├── results/
└── README.md
```

### Example Flow

```yaml
appId: com.teamparcee.practiceplan
---
- launchApp
- assertVisible: "Login"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Practice"
```

## Building

### Development Build

```bash
cd src/apps/mobile
npx expo run:ios     # Local iOS build
npx expo run:android # Local Android build
```

### EAS Build

```bash
# Preview build
eas build --profile preview --platform ios

# Production build
eas build --profile production --platform all
```

### OTA Updates

```bash
eas update --branch production --message "Bug fixes"
```

## Common Patterns

### Screen Template

```tsx
import { TPScreen, TPHeader, TPLoading, TPEmpty } from '@/components/tp';
import { useAppStore } from '@ppa/store';

export default function MyScreen() {
  const { items, loading, error } = useAppStore();

  if (loading) return <TPLoading />;
  if (error) return <TPEmpty title="Error" description={error} />;
  if (items.length === 0) return <TPEmpty title="No items" />;

  return (
    <TPScreen>
      <TPHeader title="My Screen" />
      {/* Content */}
    </TPScreen>
  );
}
```

### Form Screen with Footer

```tsx
import { TPFooterButtons, TP_FOOTER_HEIGHT } from '@/components/tp';

export default function FormScreen() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: TP_FOOTER_HEIGHT }}>
        {/* Form content */}
      </ScrollView>

      <TPFooterButtons
        mode={mode}
        onCancel={handleCancel}
        onSave={handleSave}
        onEdit={() => setMode('edit')}
      />
    </View>
  );
}
```

### User Feedback

```tsx
import { useToast } from '@/components/tp';

function Component() {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast({ type: 'success', message: 'Saved successfully' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to save' });
    }
  };
}
```
