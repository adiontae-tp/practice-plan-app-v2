# Practice Plan App (PPA)

A comprehensive practice planning and team management application for coaches. Built as a monorepo with shared packages supporting both mobile (React Native/Expo) and web (Next.js) platforms.

## Overview

Practice Plan App helps coaches:
- Create and manage practice plans with timed activities/periods
- Build reusable templates and period libraries
- Track team schedules with calendar integration
- Collaborate with coaching staff
- Manage files and announcements
- Generate PDF exports of practice plans
- Access analytics and reports

## Quick Start

```bash
# Install dependencies
pnpm install

# Run web app
pnpm web

# Run mobile app
pnpm mobile

# Run all builds
pnpm build
```

## Monorepo Structure

```
practice-plan-app/
├── src/
│   ├── apps/
│   │   ├── mobile/          # React Native/Expo app
│   │   └── web/             # Next.js web app
│   ├── packages/
│   │   ├── interfaces/      # @ppa/interfaces - TypeScript types
│   │   ├── store/           # @ppa/store - Zustand state management
│   │   ├── mock/            # @ppa/mock - Mock data for UI development
│   │   ├── firebase/        # @ppa/firebase - Firebase services
│   │   ├── subscription/    # @ppa/subscription - RevenueCat/Stripe integration
│   │   └── pdf/             # @ppa/pdf - PDF generation utilities
│   ├── ui/                  # @ppa/ui - Shared branding/design tokens
│   └── assets/              # Shared static assets
├── legacy/                  # Reference code from previous version
├── docs/                    # Documentation
└── CLAUDE.md               # AI agent guidelines
```

## Packages

| Package | Description |
|---------|-------------|
| `@ppa/interfaces` | TypeScript interfaces for all data models |
| `@ppa/store` | Zustand store with data and UI slices |
| `@ppa/mock` | Mock data for UI-first development |
| `@ppa/firebase` | Firebase auth and Firestore services |
| `@ppa/subscription` | Subscription management (RevenueCat/Stripe) |
| `@ppa/pdf` | PDF template generation |
| `@ppa/ui` | Shared branding, colors, and design tokens |

## Apps

### Mobile App (`src/apps/mobile`)
- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind for React Native)
- **UI Library**: GlueStack UI v3
- **State**: Zustand via `@ppa/store`

### Web App (`src/apps/web`)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui (Radix primitives)
- **State**: Zustand via `@ppa/store`

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Language** | TypeScript |
| **Package Manager** | pnpm (workspaces) |
| **Mobile Runtime** | Expo / React Native |
| **Web Framework** | Next.js |
| **Styling** | Tailwind CSS / NativeWind |
| **State Management** | Zustand |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **Payments** | RevenueCat (mobile) / Stripe (web) |
| **Testing** | Playwright (web), Maestro (mobile) |

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Data Models](./docs/DATA_MODELS.md)
- [State Management](./docs/STATE_MANAGEMENT.md)
- [Mobile App Guide](./docs/MOBILE_APP.md)
- [Web App Guide](./docs/WEB_APP.md)
- [Development Guide](./docs/DEVELOPMENT_GUIDE.md)
- [Component Library](./docs/COMPONENT_LIBRARY.md)
- [FCM Setup Guide](./docs/FCM_SETUP.md) - Push notifications configuration

## Development Mode

The app is currently in **UI Creation Mode**:
- Building UI with mock data from `@ppa/mock`
- No backend integration yet
- Focus on complete UI states (loading, empty, error, success)
- All user actions must provide feedback

## Scripts

```bash
# Development
pnpm web              # Start web dev server
pnpm mobile           # Start Expo dev server

# Building
pnpm build            # Build all packages

# Testing
pnpm test:e2e:web     # Run Playwright tests
pnpm test:e2e:mobile  # Run Maestro tests

# Linting
pnpm lint             # Lint all packages
```

## Key Conventions

- **Terminology**: Use "periods" in UI (not "activities" - that's the interface name)
- **State**: All state through Zustand slices, no local `useState` for screen state
- **Components**: TP-prefixed wrapper components (`TPButton`, `TPCard`, etc.)
- **Styling**: No inline styles, use design tokens from `@ppa/ui/branding`
- **Modals (Mobile)**: Expo Router modals or `TPBottomSheet`, never GlueStack Modal

## License

Private - All rights reserved
