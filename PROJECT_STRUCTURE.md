# Beginner Workout App - Project Structure

## Overview
This project consists of three main components:
1. **Mobile App** (Flutter) - iOS & Android applications
2. **Web Dashboard** (Next.js) - Admin dashboard for content management
3. **Backend** (Firebase) - Cloud Functions, Firestore, Storage, Auth

## Directory Structure

```
beginner-workout-app/
├── mobile/                          # Flutter Mobile Application
│   ├── lib/
│   │   ├── core/                    # Core functionality
│   │   │   ├── constants/           # App constants
│   │   │   ├── error/              # Error handling
│   │   │   ├── network/            # Network utilities
│   │   │   ├── platform/           # Platform-specific code
│   │   │   ├── theme/              # App theming
│   │   │   ├── utils/              # Utility functions
│   │   │   └── localization/       # i18n files
│   │   ├── features/               # Feature modules
│   │   │   ├── auth/               # Authentication
│   │   │   ├── onboarding/         # Onboarding flow
│   │   │   ├── programs/           # Workout programs
│   │   │   ├── exercises/          # Exercise library
│   │   │   ├── timelapse/          # Time-lapse feature
│   │   │   ├── progress/           # Progress tracking
│   │   │   ├── nutrition/          # Nutrition & recipes
│   │   │   ├── community/          # Social features
│   │   │   ├── challenges/         # Challenges & achievements
│   │   │   ├── subscription/       # Payment & subscription
│   │   │   └── profile/            # User profile
│   │   ├── shared/                 # Shared widgets & utilities
│   │   │   ├── widgets/            # Reusable widgets
│   │   │   ├── models/             # Shared data models
│   │   │   └── providers/          # Shared Riverpod providers
│   │   └── main.dart               # App entry point
│   ├── test/                       # Tests
│   │   ├── unit/                   # Unit tests
│   │   ├── widget/                 # Widget tests
│   │   └── integration/            # Integration tests
│   ├── assets/                     # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   ├── animations/
│   │   └── localization/
│   ├── android/                    # Android configuration
│   ├── ios/                        # iOS configuration
│   ├── web/                        # Web configuration
│   ├── pubspec.yaml               # Flutter dependencies
│   └── analysis_options.yaml      # Linting rules
│
├── dashboard/                      # Next.js Web Dashboard
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (auth)/            # Auth routes
│   │   │   ├── (dashboard)/       # Dashboard routes
│   │   │   ├── api/               # API routes
│   │   │   ├── layout.tsx         # Root layout
│   │   │   └── page.tsx           # Home page
│   │   ├── components/            # React components
│   │   │   ├── ui/                # UI components
│   │   │   ├── forms/             # Form components
│   │   │   ├── charts/            # Chart components
│   │   │   └── layout/            # Layout components
│   │   ├── lib/                   # Utilities & helpers
│   │   │   ├── firebase/          # Firebase Admin SDK
│   │   │   ├── auth/              # Auth utilities
│   │   │   ├── utils/             # Helper functions
│   │   │   └── validations/       # Form validations
│   │   ├── types/                 # TypeScript types
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── store/                 # State management
│   │   └── constants/             # Constants
│   ├── public/                    # Static files
│   ├── tests/                     # Test files
│   ├── package.json              # Node dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.ts        # Tailwind config
│   └── next.config.js            # Next.js config
│
├── functions/                      # Firebase Cloud Functions
│   ├── src/
│   │   ├── timelapse/             # Time-lapse video processing
│   │   ├── subscriptions/         # Subscription management
│   │   ├── notifications/         # Push notifications
│   │   ├── analytics/             # Analytics processing
│   │   ├── moderation/            # Content moderation
│   │   ├── health-sync/           # Health data sync
│   │   └── index.ts               # Functions export
│   ├── package.json              # Node dependencies
│   └── tsconfig.json             # TypeScript config
│
├── firebase/                       # Firebase Configuration
│   ├── firestore.rules            # Firestore security rules
│   ├── storage.rules              # Storage security rules
│   ├── firestore.indexes.json    # Firestore indexes
│   └── firebase.json              # Firebase config
│
├── docs/                          # Documentation
│   ├── SETUP.md                   # Setup guide
│   ├── ARCHITECTURE.md            # Architecture overview
│   ├── API.md                     # API documentation
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── TESTING.md                 # Testing guide
│
├── scripts/                       # Utility scripts
│   ├── setup.sh                   # Initial setup script
│   ├── deploy.sh                  # Deployment script
│   └── seed-data.ts               # Seed database script
│
├── .github/                       # GitHub configuration
│   └── workflows/                 # CI/CD workflows
│       ├── mobile-ci.yml          # Mobile CI/CD
│       ├── dashboard-ci.yml       # Dashboard CI/CD
│       └── functions-ci.yml       # Functions CI/CD
│
├── .gitignore                     # Git ignore rules
├── README.md                      # Project README
└── LICENSE                        # License file
```

## Feature Module Architecture (Clean Architecture)

Each feature module follows this structure:

```
feature_name/
├── data/
│   ├── datasources/              # Remote & Local data sources
│   ├── models/                   # Data models (JSON serialization)
│   └── repositories/             # Repository implementations
├── domain/
│   ├── entities/                 # Business entities
│   ├── repositories/             # Repository interfaces
│   └── usecases/                 # Business logic use cases
├── presentation/
│   ├── pages/                    # UI pages/screens
│   ├── widgets/                  # Feature-specific widgets
│   ├── providers/                # Riverpod state providers
│   └── state/                    # State management classes
└── feature_name.dart            # Barrel file (exports)
```

## Technology Stack Summary

### Mobile (Flutter)
- **Framework**: Flutter 3.x
- **Language**: Dart 3.x
- **State Management**: Riverpod 2.x
- **Routing**: go_router 12.x
- **Local Database**: Sqflite + Hive
- **HTTP Client**: dio
- **Video Player**: video_player / chewie
- **Image Handling**: cached_network_image
- **Charts**: fl_chart
- **Animations**: lottie
- **Testing**: flutter_test, mockito, integration_test

### Dashboard (Next.js)
- **Framework**: Next.js 14.x
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **Charts**: recharts
- **Forms**: react-hook-form + zod
- **State**: Zustand
- **Testing**: Jest + React Testing Library

### Backend (Firebase)
- **Auth**: Firebase Authentication
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Functions**: Cloud Functions (Node.js 18)
- **Messaging**: Firebase Cloud Messaging
- **Analytics**: Firebase Analytics
- **Config**: Remote Config
- **Security**: App Check

### Payments
- **Web**: Stripe
- **iOS**: In-App Purchase (StoreKit)
- **Android**: In-App Billing

## Development Workflow

1. **Mobile Development**: Use Flutter DevTools for debugging
2. **Dashboard Development**: Use Next.js dev server with hot reload
3. **Functions Development**: Use Firebase Emulator Suite
4. **Testing**: Run tests before commits
5. **Deployment**: Automated via GitHub Actions

## Environment Variables

Each component has its own environment configuration:
- Mobile: `lib/core/constants/env.dart`
- Dashboard: `.env.local`
- Functions: `.env` + Firebase config
