# State Management

Practice Plan App uses Zustand for state management via the `@ppa/store` package.

## Overview

**Key Principles**:
- All state through Zustand slices (no local `useState` for screen state)
- Slice-based architecture for modularity
- Separation of data slices and UI slices
- Actions co-located with state

```typescript
import { useAppStore } from '@ppa/store';

// Access state
const plans = useAppStore((state) => state.plans);

// Access actions
const { fetchPlans, setPlan } = useAppStore();
```

## Store Structure

### Location
```
src/packages/store/
├── src/
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useAppInit.ts
│   │   ├── useLazyAnnouncements.ts
│   │   ├── useLazyFiles.ts
│   │   └── useLazyFolders.ts
│   ├── slices/
│   │   ├── index.ts
│   │   ├── appSlice.ts
│   │   ├── authSlice.ts
│   │   ├── userSlice.ts
│   │   ├── teamSlice.ts
│   │   ├── planSlice.ts
│   │   ├── periodSlice.ts
│   │   ├── templateSlice.ts
│   │   ├── tagSlice.ts
│   │   ├── coachSlice.ts
│   │   ├── fileSlice.ts
│   │   ├── folderSlice.ts
│   │   ├── fileVersionSlice.ts
│   │   ├── fileShareSlice.ts
│   │   ├── announcementSlice.ts
│   │   ├── subscriptionSlice.ts
│   │   ├── tagsUISlice.ts
│   │   ├── coachesUISlice.ts
│   │   ├── filesUISlice.ts
│   │   ├── calendarUISlice.ts
│   │   ├── periodsUISlice.ts
│   │   ├── templatesUISlice.ts
│   │   ├── announcementsUISlice.ts
│   │   ├── reportsUISlice.ts
│   │   ├── profileUISlice.ts
│   │   └── pdfUISlice.ts
│   ├── store.ts
│   └── index.ts
└── package.json
```

## Slice Types

### Data Slices

Data slices manage domain entities and their CRUD operations.

| Slice | Purpose |
|-------|---------|
| `appSlice` | App-wide state (initialization, loading, errors) |
| `authSlice` | Authentication state (user session, login/logout) |
| `userSlice` | Current user data |
| `teamSlice` | Current team data |
| `planSlice` | Practice plans |
| `periodSlice` | Period library |
| `templateSlice` | Practice templates |
| `tagSlice` | Tags |
| `coachSlice` | Team coaches |
| `fileSlice` | Files |
| `folderSlice` | File folders |
| `fileVersionSlice` | File version history |
| `fileShareSlice` | File sharing |
| `announcementSlice` | Announcements |
| `subscriptionSlice` | Subscription/entitlement state |

### UI Slices

UI slices manage screen-specific state.

| Slice | Purpose |
|-------|---------|
| `tagsUISlice` | Tags screen state (search, modals, selection) |
| `coachesUISlice` | Coaches screen state |
| `filesUISlice` | Files screen state (view mode, filters, sort) |
| `calendarUISlice` | Calendar view state |
| `periodsUISlice` | Periods screen state |
| `templatesUISlice` | Templates screen state |
| `announcementsUISlice` | Announcements screen state |
| `reportsUISlice` | Reports screen state (tab, date range) |
| `profileUISlice` | Profile screen state |
| `pdfUISlice` | PDF preview/generation state |

## Data Slice Pattern

Data slices follow this pattern:

```typescript
export interface PlanSlice {
  // Data state
  plans: Plan[];
  plan: Plan | null;

  // Loading/error states
  plansLoading: boolean;
  planCreating: boolean;
  planUpdating: boolean;
  planDeleting: boolean;
  plansError: string | null;

  // Setters
  setPlans: (plans: Plan[]) => void;
  setPlan: (plan: Plan | null) => void;
  setPlansError: (error: string | null) => void;

  // CRUD Actions
  fetchPlan: (teamId: string, planId: string) => Promise<Plan | null>;
  fetchPlans: (teamId: string) => Promise<Plan[]>;
  subscribePlans: (teamId: string) => () => void;
  createPlan: (teamId: string, data: CreatePlanInput) => Promise<Plan>;
  updatePlan: (teamId: string, planId: string, updates: UpdatePlanInput) => Promise<void>;
  deletePlan: (teamId: string, planId: string) => Promise<void>;
}
```

### CRUD Action Pattern

```typescript
createPlan: async (teamId: string, data: CreatePlanInput) => {
  set({ planCreating: true, plansError: null });
  try {
    const newPlan = await createPlanService(teamId, data);
    // Optimistic update
    set((state) => ({
      plans: [...state.plans, newPlan],
      planCreating: false,
    }));
    return newPlan;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create plan';
    set({ plansError: message, planCreating: false });
    throw error;
  }
}
```

## UI Slice Pattern

UI slices follow this pattern:

```typescript
export interface TagsUISlice {
  // Screen state
  tagsSearchQuery: string;
  tagsShowCreateModal: boolean;
  tagsShowEditModal: boolean;
  tagsShowDeleteAlert: boolean;
  tagsSelectedTag: Tag | null;
  tagsFormName: string;
  tagsIsLoading: boolean;

  // Setters
  setTagsSearchQuery: (query: string) => void;
  setTagsShowCreateModal: (show: boolean) => void;
  setTagsShowEditModal: (show: boolean) => void;
  setTagsShowDeleteAlert: (show: boolean) => void;
  setTagsSelectedTag: (tag: Tag | null) => void;
  setTagsFormName: (name: string) => void;
  setTagsIsLoading: (loading: boolean) => void;

  // Reset
  resetTagsUI: () => void;
}
```

### Naming Convention

UI slice state/actions are prefixed with the screen name:
- `tagsSearchQuery` (not `searchQuery`)
- `setTagsShowModal` (not `setShowModal`)
- `resetTagsUI` (not `resetUI`)

This prevents naming collisions when composing slices.

## Usage Examples

### Reading State

```typescript
// Select single value
const plans = useAppStore((state) => state.plans);

// Select multiple values
const { plans, plansLoading, plansError } = useAppStore((state) => ({
  plans: state.plans,
  plansLoading: state.plansLoading,
  plansError: state.plansError,
}));

// With selector for derived state
const activePlans = useAppStore((state) =>
  state.plans.filter(p => p.startTime > Date.now())
);
```

### Calling Actions

```typescript
// Destructure actions
const { fetchPlans, createPlan } = useAppStore();

// Use in effects
useEffect(() => {
  fetchPlans(teamId);
}, [teamId]);

// Use in handlers
const handleCreate = async () => {
  try {
    await createPlan(teamId, formData);
    showSuccessToast('Plan created');
  } catch (error) {
    showErrorToast('Failed to create plan');
  }
};
```

### UI State Management

```typescript
function TagsScreen() {
  const {
    // State
    tagsSearchQuery,
    tagsShowCreateModal,
    tagsSelectedTag,
    // Actions
    setTagsSearchQuery,
    setTagsShowCreateModal,
    setTagsSelectedTag,
    resetTagsUI,
  } = useAppStore();

  // Use in component
  return (
    <View>
      <SearchInput
        value={tagsSearchQuery}
        onChangeText={setTagsSearchQuery}
      />
      <Button onPress={() => setTagsShowCreateModal(true)}>
        Create Tag
      </Button>
      <TagModal
        isOpen={tagsShowCreateModal}
        onClose={() => setTagsShowCreateModal(false)}
      />
    </View>
  );
}
```

### Subscriptions (Real-time)

```typescript
useEffect(() => {
  // Subscribe returns an unsubscribe function
  const unsubscribe = subscribePlans(teamId);

  // Cleanup on unmount
  return () => unsubscribe();
}, [teamId]);
```

## Creating New Slices

### Creating a UI Slice

1. Create the slice file:

```typescript
// slices/newScreenUISlice.ts
import { StateCreator } from 'zustand';

export interface NewScreenUISlice {
  newScreenSearchQuery: string;
  newScreenShowModal: boolean;
  newScreenSelectedItem: SomeType | null;
  newScreenIsLoading: boolean;

  setNewScreenSearchQuery: (query: string) => void;
  setNewScreenShowModal: (show: boolean) => void;
  setNewScreenSelectedItem: (item: SomeType | null) => void;
  setNewScreenIsLoading: (loading: boolean) => void;
  resetNewScreenUI: () => void;
}

const initialState = {
  newScreenSearchQuery: '',
  newScreenShowModal: false,
  newScreenSelectedItem: null,
  newScreenIsLoading: false,
};

export const createNewScreenUISlice: StateCreator<NewScreenUISlice> = (set) => ({
  ...initialState,

  setNewScreenSearchQuery: (query) => set({ newScreenSearchQuery: query }),
  setNewScreenShowModal: (show) => set({ newScreenShowModal: show }),
  setNewScreenSelectedItem: (item) => set({ newScreenSelectedItem: item }),
  setNewScreenIsLoading: (loading) => set({ newScreenIsLoading: loading }),
  resetNewScreenUI: () => set(initialState),
});
```

2. Export from `slices/index.ts`:

```typescript
export { createNewScreenUISlice, type NewScreenUISlice } from './newScreenUISlice';
```

3. Add to `store.ts`:

```typescript
import { createNewScreenUISlice, type NewScreenUISlice } from './slices';

export type AppStore = /* existing types */ & NewScreenUISlice;

export const useAppStore = create<AppStore>()((...a) => ({
  /* existing slices */
  ...createNewScreenUISlice(...a),
}));
```

## Store Hooks

### useAppInit

Initializes app state on startup:

```typescript
import { useAppInit } from '@ppa/store';

function App() {
  useAppInit();
  // ...
}
```

### useLazyAnnouncements

Lazy-loads announcements with pagination:

```typescript
import { useLazyAnnouncements } from '@ppa/store';

function AnnouncementsScreen() {
  const { announcements, loading, loadMore } = useLazyAnnouncements(teamId);
  // ...
}
```

### useLazyFiles / useLazyFolders

Lazy-loads files and folders:

```typescript
import { useLazyFiles, useLazyFolders } from '@ppa/store';

function FilesScreen() {
  const { files, loading } = useLazyFiles(teamId, folderId);
  const { folders } = useLazyFolders(teamId);
  // ...
}
```

## Best Practices

### Do
- Prefix all UI slice state with screen name
- Include a `reset[Screen]UI` action
- Handle loading and error states
- Use optimistic updates for better UX
- Clean up subscriptions on unmount

### Don't
- Use local `useState` for screen state
- Create actions that modify multiple unrelated slices
- Forget to export new slices from index.ts
- Skip error handling in async actions

## Testing

Slices can be tested in isolation:

```typescript
import { createPlanSlice } from '@ppa/store';

describe('planSlice', () => {
  it('should fetch plans', async () => {
    const set = jest.fn();
    const get = jest.fn();
    const slice = createPlanSlice(set, get, {} as any);

    await slice.fetchPlans('team-1');

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ plansLoading: true })
    );
  });
});
```
