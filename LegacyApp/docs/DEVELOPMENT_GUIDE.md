# Development Guide

This guide covers the development workflow, conventions, and best practices for the Practice Plan App.

## Prerequisites

- Node.js 20+
- pnpm 8.15+
- iOS: Xcode 15+ (for iOS development)
- Android: Android Studio (for Android development)
- Git

## Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd practice-plan-app

# Install dependencies
pnpm install

# Start development
pnpm web     # Web app
pnpm mobile  # Mobile app
```

## Development Mode

The app is currently in **UI Creation Mode**:

- Building UI with mock data from `@ppa/mock`
- No backend integration yet
- Focus on complete UI states

### Implications

1. Use mock data, not Firebase calls
2. All CRUD operations are simulated
3. State persists only in memory
4. Focus on UI completeness

## Project Structure

```
practice-plan-app/
├── src/
│   ├── apps/
│   │   ├── mobile/      # React Native/Expo
│   │   └── web/         # Next.js
│   ├── packages/
│   │   ├── interfaces/  # TypeScript types
│   │   ├── store/       # Zustand state
│   │   ├── mock/        # Mock data
│   │   ├── firebase/    # Firebase services
│   │   ├── subscription/# Payment services
│   │   └── pdf/         # PDF generation
│   ├── ui/              # Shared branding
│   └── assets/          # Static assets
├── legacy/              # Reference only
└── docs/                # Documentation
```

## Coding Standards

### TypeScript

- Strict mode enabled
- All props must have interfaces
- No `any` type (use `unknown` if needed)
- Export types from `@ppa/interfaces`

```typescript
// Good
interface TagCardProps {
  tag: Tag;
  onPress: () => void;
}

// Bad
function TagCard({ tag, onPress }: any) { ... }
```

### Component Guidelines

#### One Component Per File

```
components/
├── TagCard.tsx
├── TagList.tsx
└── TagModal.tsx
```

#### No Inline Components

```tsx
// Bad - inline component definition
function Screen() {
  const TagItem = ({ tag }) => <View>...</View>;
  return <TagItem tag={tag} />;
}

// Good - separate file
import { TagItem } from './TagItem';
function Screen() {
  return <TagItem tag={tag} />;
}
```

#### Reusable If Used 2+ Times

If a component is used in multiple places, move it to a shared location.

### Styling

#### No Inline Styles

```tsx
// Bad
<View style={{ padding: 16, backgroundColor: '#fff' }}>

// Good (NativeWind)
<View className="p-4 bg-background-0">

// Good (Tailwind)
<div className="p-4 bg-white">
```

#### Use Design Tokens

```tsx
// Bad
<Text style={{ color: '#356793' }}>

// Good
import { COLORS } from '@ppa/ui/branding';
<Text style={{ color: COLORS.primary }}>

// Or with NativeWind/Tailwind
<Text className="text-primary-500">
```

### State Management

#### Use Zustand Store

```tsx
// Bad - local state for screen state
const [searchQuery, setSearchQuery] = useState('');
const [showModal, setShowModal] = useState(false);

// Good - Zustand store
const { tagsSearchQuery, setTagsSearchQuery } = useAppStore();
```

#### When Local State is OK

- Controlled form inputs (before submit)
- Temporary UI state (hover, focus)
- Animation state

### Imports

#### Use Path Aliases

```tsx
// Bad
import { TPButton } from '../../../components/tp/TPButton';

// Good (mobile)
import { TPButton } from '@/components/tp';

// Good (packages)
import { Tag } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { mockTags } from '@ppa/mock';
import { COLORS } from '@ppa/ui/branding';
```

## UI Patterns

### Complete UI States

Every screen must implement:

1. **Loading State** - Spinner or skeleton
2. **Empty State** - Helpful message
3. **Error State** - Error message with retry
4. **Success State** - Data display

```tsx
function TagsScreen() {
  const { tags, tagsLoading, tagsError } = useAppStore();

  if (tagsLoading) return <TPLoading />;
  if (tagsError) return <TPError message={tagsError} onRetry={refetch} />;
  if (tags.length === 0) return <TPEmpty title="No tags yet" />;

  return <TagList tags={tags} />;
}
```

### User Feedback

Every action must provide feedback:

| Action | Feedback |
|--------|----------|
| Create | Success toast |
| Update | Success toast |
| Delete | Confirmation → Success toast |
| Error | Error toast/message |
| Loading | Loading indicator |

```tsx
const handleDelete = async () => {
  setShowConfirm(true); // 1. Confirm
};

const confirmDelete = async () => {
  try {
    await deleteTag(tag.id);
    showToast({ type: 'success', message: 'Tag deleted' }); // 2. Success
  } catch (error) {
    showToast({ type: 'error', message: 'Failed to delete' }); // 3. Error
  }
};
```

### No Placeholder Actions

```tsx
// Bad
<Button onPress={() => alert('TODO')}>Edit</Button>

// Good
<Button onPress={handleEdit}>Edit</Button>
// Where handleEdit is fully implemented
```

## Terminology

### Activity vs Period

- **Interface name**: `Activity` (in `@ppa/interfaces`)
- **UI display**: "period" or "periods"

```tsx
// In code
interface Activity { ... }
plan.activities.map(...)

// In UI
<Text>3 periods</Text>
<Text>Add periods</Text>
```

### Tables & Lists

- No row numbers or index counts
- Use grey badges for status
- Avoid colorful icons

## Mobile-Specific

### Modals

Never use GlueStack Modal. Instead:

| Use Case | Solution |
|----------|----------|
| Full form/screen | Expo Router modal |
| Quick data/action | `TPBottomSheet` |
| Confirmation | `TPAlert` |

### TPFooterButtons

Required for all CRUD screens:

```tsx
<TPFooterButtons
  mode="edit"
  onCancel={handleCancel}
  onSave={handleSave}
  saveLabel="Create"
  loading={isLoading}
/>
```

## Web-Specific

### shadcn/ui Installation

```bash
cd src/apps/web
npx shadcn@latest add button dialog input table
```

### Modal Toolbar Pattern

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Title</DialogTitle>
  </DialogHeader>
  <div className="flex gap-2 border-b pb-3">
    <Button variant="ghost">Edit</Button>
    <Button variant="ghost">PDF</Button>
    <Button variant="ghost" className="text-red-600">Delete</Button>
  </div>
  {/* Content */}
</DialogContent>
```

## Mobile-Web Architecture

The web app supports both desktop and mobile viewports using the `@ppa/mobile-web` library.

### Core Principle

**Separate components for mobile and desktop**, not CSS-responsive hiding.

### Implementation

1. Create dedicated mobile component using mobile-web primitives
2. Keep/extract desktop component using shadcn components
3. Use `MWViewSwitch` to render appropriate view

### Example

See `src/apps/web/components/tp/periods/` for reference implementation:
- `PeriodsMobileView.tsx` - Mobile-optimized using MWList/MWListItem
- `PeriodsDesktopTable.tsx` - Desktop table using shadcn Table
- Page uses `MWViewSwitch` to render correct view

### Benefits

- ✅ Native mobile UX (iOS/Android patterns)
- ✅ No layout issues (designed for mobile-web containers)
- ✅ Better maintainability (clear separation)
- ✅ Type-safe props per platform

## Wireframes

### Location

```
src/ui/wireframes/
├── mobile/
│   └── COMPONENTS.md
└── web/
    └── COMPONENTS.md
```

### Usage

1. Check wireframes before implementing
2. Follow wireframe designs exactly
3. Ask before deviating
4. Update wireframes if design changes

## Testing

### Web E2E (Playwright)

```bash
pnpm test:e2e:web        # Run tests
pnpm test:e2e:web:ui     # Interactive UI
pnpm test:e2e:web:list   # List tests
```

### Mobile E2E (Maestro)

```bash
pnpm test:e2e:mobile     # Run flows
```

## Git Workflow

### Branches

- `main` - Production
- `develop` - Development
- `feature/*` - Features
- `fix/*` - Bug fixes
- `claude/*` - AI agent work

### Commit Messages

```bash
# Format
<type>: <description>

# Types
feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code refactoring
test: Tests
chore: Maintenance

# Examples
feat: Add tag creation modal
fix: Resolve infinite loop in calendar
docs: Update state management guide
```

### Pull Requests

1. Create feature branch
2. Make changes
3. Push to remote
4. Create PR with description
5. Wait for review

## Package Development

### Creating a New Package

1. Create folder in `src/packages/`
2. Add `package.json`:
   ```json
   {
     "name": "@ppa/new-package",
     "version": "1.0.0",
     "main": "src/index.ts",
     "types": "src/index.ts",
     "dependencies": {
       "@ppa/interfaces": "workspace:*"
     }
   }
   ```
3. Add to apps' dependencies
4. Run `pnpm install`

### Package Dependencies

```
@ppa/interfaces  (base - no deps)
     ↑
@ppa/mock   @ppa/firebase
     ↓         ↓
    @ppa/store
     ↓         ↓
  Mobile     Web
```

## Troubleshooting

### Common Issues

#### Metro Bundler Issues (Mobile)

```bash
# Clear cache
npx expo start --clear
```

#### Module Not Found

```bash
# Reinstall dependencies
pnpm install
```

#### Type Errors

```bash
# Check TypeScript
pnpm -r exec tsc --noEmit
```

### Getting Help

1. Check existing documentation
2. Search codebase for examples
3. Check `CLAUDE.md` for conventions
4. Ask in team channel

## Checklist Before PR

- [ ] No inline styles
- [ ] No hardcoded colors
- [ ] Using path aliases
- [ ] TypeScript interfaces defined
- [ ] All UI states implemented
- [ ] User feedback for actions
- [ ] No placeholder actions
- [ ] Follows wireframe design
- [ ] No `console.log` statements
- [ ] Tests pass
