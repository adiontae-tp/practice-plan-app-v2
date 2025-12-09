# Architecture Overview

## System Architecture

Practice Plan App follows a monorepo architecture with shared packages that provide platform-agnostic functionality to both mobile and web applications.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Applications                              │
├────────────────────────────┬────────────────────────────────────┤
│     Mobile (Expo/RN)       │          Web (Next.js)             │
│  ┌──────────────────────┐  │  ┌────────────────────────────┐    │
│  │ Expo Router          │  │  │ Next.js App Router         │    │
│  │ GlueStack UI         │  │  │ shadcn/ui                  │    │
│  │ NativeWind           │  │  │ Tailwind CSS               │    │
│  └──────────────────────┘  │  └────────────────────────────┘    │
├────────────────────────────┴────────────────────────────────────┤
│                     Shared Packages                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │@ppa/store│ │@ppa/mock │ │@ppa/ui   │ │@ppa/interfaces     │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘  │
│  ┌──────────────────┐ ┌────────────────┐ ┌─────────────────┐    │
│  │@ppa/firebase     │ │@ppa/subscription│ │@ppa/pdf        │    │
│  └──────────────────┘ └────────────────┘ └─────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                      Backend Services                            │
│  ┌──────────────────┐ ┌──────────────┐ ┌─────────────────────┐  │
│  │ Firebase Auth    │ │ Firestore    │ │ Firebase Storage    │  │
│  └──────────────────┘ └──────────────┘ └─────────────────────┘  │
│  ┌──────────────────┐ ┌──────────────┐                          │
│  │ RevenueCat       │ │ Stripe       │                          │
│  │ (Mobile)         │ │ (Web)        │                          │
│  └──────────────────┘ └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Package Dependencies

```
@ppa/interfaces (no dependencies)
       ↑
       ├─────────────────────────────┐
       │                             │
   @ppa/mock                   @ppa/firebase
       │                             │
       └──────────┬──────────────────┘
                  ↓
             @ppa/store ←── @ppa/subscription
                  ↑
       ┌──────────┴──────────┐
       │                     │
    Mobile App            Web App
```

## Directory Structure

### Root Level
```
practice-plan-app/
├── .github/              # GitHub Actions workflows
├── .eas/                 # EAS Build configuration
├── docs/                 # Project documentation
├── legacy/               # Previous version (reference only)
├── src/                  # All source code
├── CLAUDE.md            # AI agent guidelines
├── package.json          # Root workspace config
├── pnpm-workspace.yaml   # pnpm workspace definition
└── pnpm-lock.yaml        # Dependency lockfile
```

### Source Directory
```
src/
├── apps/
│   ├── mobile/           # Expo React Native app
│   │   ├── app/          # Expo Router screens
│   │   ├── components/   # Mobile components
│   │   ├── hooks/        # Mobile-specific hooks
│   │   ├── services/     # Platform services
│   │   └── e2e/          # Maestro tests
│   └── web/              # Next.js app
│       ├── app/          # Next.js App Router
│       ├── components/   # Web components
│       ├── hooks/        # Web-specific hooks
│       ├── services/     # API services
│       └── e2e/          # Playwright tests
├── packages/
│   ├── interfaces/       # TypeScript types
│   ├── store/            # Zustand state management
│   ├── mock/             # Mock data
│   ├── firebase/         # Firebase services
│   ├── subscription/     # Payment services
│   └── pdf/              # PDF generation
├── ui/                   # Shared UI package
│   ├── branding/         # Colors, themes
│   ├── wireframes/       # Design wireframes
│   └── index.ts          # Package exports
└── assets/               # Shared static assets
```

## Data Flow

### State Management Flow
```
┌──────────────────────────────────────────────────────────────┐
│                         Zustand Store                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │ Data Slices │    │  UI Slices  │    │ Auth Slice  │       │
│  │             │    │             │    │             │       │
│  │ - userSlice │    │ - tagsUI    │    │ - authSlice │       │
│  │ - teamSlice │    │ - coachesUI │    │             │       │
│  │ - planSlice │    │ - filesUI   │    │             │       │
│  │ - etc...    │    │ - etc...    │    │             │       │
│  └─────────────┘    └─────────────┘    └─────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
           ↑                    ↑                    ↑
           │                    │                    │
    ┌──────┴──────┐      ┌──────┴──────┐      ┌──────┴──────┐
    │  Firebase   │      │   Actions   │      │  Firebase   │
    │  Listeners  │      │  (User UI)  │      │    Auth     │
    └─────────────┘      └─────────────┘      └─────────────┘
```

### Component Architecture

```
Screen/Page
    │
    ├── Uses: useAppStore (Zustand)
    │   └── Accesses: Data slices + UI slices
    │
    ├── Renders: TP Components
    │   ├── TPButton, TPCard, TPInput, etc.
    │   └── Platform-specific implementations
    │
    └── Triggers: Store Actions
        └── Updates: Zustand state → Re-render
```

## Key Architectural Decisions

### 1. Monorepo with pnpm Workspaces
- **Why**: Share code between mobile and web apps
- **Packages**: `workspace:*` protocol for local dependencies
- **Build**: Independent builds for each app

### 2. Platform-Specific UI, Shared Logic
- **Shared**: Interfaces, store, mock data, business logic
- **Platform**: UI components, navigation, styling
- **Pattern**: Same Zustand store, different component libraries

### 3. Zustand for State Management
- **Why**: Simple, performant, works with React Native
- **Pattern**: Slice-based architecture
- **Separation**: Data slices vs UI slices

### 4. Mock-First Development
- **Current Mode**: UI development with mock data
- **Package**: `@ppa/mock` provides typed mock data
- **Transition**: Replace mock calls with Firebase calls

### 5. TP Component Wrapper Pattern
- **Mobile**: TP components wrap GlueStack UI
- **Web**: TP components wrap shadcn/ui
- **Benefit**: Consistent API, centralized styling

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────→│  Firebase   │────→│   Store     │
│   Screen    │     │    Auth     │     │  authSlice  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌─────────────────────────┘
                    ↓
            ┌───────────────┐
            │  Fetch User   │
            │  Team, Data   │
            └───────────────┘
                    │
                    ↓
            ┌───────────────┐
            │   App Ready   │
            │   Navigate    │
            └───────────────┘
```

## Firebase Data Structure

```
Firestore Collections
├── users/{uid}
│   └── User document
├── teams/{teamId}
│   ├── Team document
│   ├── coaches/{coachId}
│   ├── plans/{planId}
│   ├── periods/{periodId}
│   ├── templates/{templateId}
│   ├── tags/{tagId}
│   ├── files/{fileId}
│   ├── folders/{folderId}
│   └── announcements/{announcementId}
└── (global collections as needed)
```

## Security Model

### Firebase Rules (Planned)
- User can only access their own data
- Team members can access team data based on permission
- Coaches have permission levels: `admin`, `edit`, `view`
- Files have sharing settings: `link`, `member`

### Subscription Gating
- Features gated by subscription tier
- `@ppa/subscription` package handles entitlements
- UI shows upgrade prompts for locked features

## Performance Considerations

### Mobile
- Lazy loading of screens via Expo Router
- Optimistic UI updates
- Image caching and compression
- Background data sync

### Web
- Server components where applicable
- Static generation for marketing pages
- Client-side state for app screens
- Code splitting by route

## Testing Strategy

### Unit Tests
- Jest for package logic (planned)

### E2E Tests
- **Web**: Playwright (`src/apps/web/e2e/`)
- **Mobile**: Maestro (`src/apps/mobile/e2e/`)

### Test Commands
```bash
pnpm test:e2e:web        # Run web E2E tests
pnpm test:e2e:web:ui     # Run with Playwright UI
pnpm test:e2e:mobile     # Run Maestro flows
```
