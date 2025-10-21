# Architecture Documentation

## Overview

The Beginner Workout App follows **Clean Architecture** principles with clear separation between layers and a modular, scalable design. This document explains the architectural decisions, patterns, and structure of the application.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile Apps (Flutter)                   │
│                    iOS, Android, Web                         │
└────────────┬────────────────────────────────┬────────────────┘
             │                                │
             │                                │
             ▼                                ▼
┌────────────────────────┐        ┌──────────────────────────┐
│   Firebase Services    │        │   Web Dashboard (Next.js) │
│  - Authentication      │◄───────┤   - Content Management    │
│  - Firestore           │        │   - User Management       │
│  - Storage             │        │   - Analytics             │
│  - Cloud Functions     │        └──────────────────────────┘
│  - Cloud Messaging     │
│  - Remote Config       │
└────────────────────────┘
```

## Mobile App Architecture (Flutter)

### Clean Architecture Layers

```
┌───────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
│  - UI Pages/Screens                                       │
│  - Widgets                                                │
│  - State Management (Riverpod Providers)                  │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────────┐
│                     Domain Layer                          │
│  - Entities (Business Objects)                            │
│  - Use Cases (Business Logic)                             │
│  - Repository Interfaces                                  │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────────┐
│                      Data Layer                           │
│  - Repository Implementations                             │
│  - Data Models (JSON Serialization)                       │
│  - Data Sources (Remote & Local)                          │
└───────────────────────────────────────────────────────────┘
```

### Feature Module Structure

Each feature follows the same structure:

```
features/auth/
├── data/
│   ├── datasources/
│   │   ├── auth_remote_datasource.dart      # Firebase Auth API
│   │   └── auth_local_datasource.dart       # Local storage
│   ├── models/
│   │   └── user_model.dart                  # JSON serializable model
│   └── repositories/
│       └── auth_repository_impl.dart        # Repository implementation
├── domain/
│   ├── entities/
│   │   └── user.dart                        # Business entity
│   ├── repositories/
│   │   └── auth_repository.dart             # Repository interface
│   └── usecases/
│       ├── login_usecase.dart               # Business logic
│       ├── register_usecase.dart
│       └── logout_usecase.dart
├── presentation/
│   ├── pages/
│   │   ├── login_page.dart                  # UI screens
│   │   └── register_page.dart
│   ├── widgets/
│   │   └── auth_form_widget.dart            # Reusable widgets
│   ├── providers/
│   │   └── auth_providers.dart              # Riverpod providers
│   └── state/
│       └── auth_state.dart                  # State classes
└── auth.dart                                # Barrel file
```

### State Management Flow

```
User Action (UI)
       │
       ▼
Widget calls Provider
       │
       ▼
Provider calls Use Case
       │
       ▼
Use Case executes business logic
       │
       ▼
Repository fetches/saves data
       │
       ▼
Data Source (Remote/Local)
       │
       ▼
State updated in Provider
       │
       ▼
UI rebuilds with new state
```

### Dependency Injection

Using **Riverpod** for dependency injection:

```dart
// Data source providers
final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSourceImpl(FirebaseAuth.instance);
});

// Repository providers
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    remoteDataSource: ref.watch(authRemoteDataSourceProvider),
    localDataSource: ref.watch(authLocalDataSourceProvider),
  );
});

// Use case providers
final loginUseCaseProvider = Provider<LoginUseCase>((ref) {
  return LoginUseCase(ref.watch(authRepositoryProvider));
});

// State providers
final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    loginUseCase: ref.watch(loginUseCaseProvider),
    logoutUseCase: ref.watch(logoutUseCaseProvider),
  );
});
```

## Database Schema (Firestore)

### Collections Structure

```
firestore/
├── users/{uid}
│   ├── name: string
│   ├── email: string
│   ├── gender: string
│   ├── goal: string
│   ├── language: string ('en' | 'ar')
│   ├── units: string ('metric' | 'imperial')
│   ├── subscriptionStatus: string
│   ├── subscriptionEnd: timestamp
│   ├── createdAt: timestamp
│   └── lastActive: timestamp
│
├── programs/{programId}
│   ├── title: {ar: string, en: string}
│   ├── description: {ar: string, en: string}
│   ├── category: string
│   ├── level: string
│   ├── duration: number
│   ├── exercises: array
│   └── imageUrl: string
│
├── exercises/{exerciseId}
│   ├── title: {ar: string, en: string}
│   ├── instructions: {ar: string, en: string}
│   ├── videoUrl: string
│   ├── imageUrls: array
│   ├── sets: number
│   ├── reps: number
│   ├── restTime: number
│   ├── muscleGroups: array
│   ├── equipment: array
│   └── safetyNotes: {ar: string, en: string}
│
├── workouts/{userId}/{workoutId}
│   ├── programId: string
│   ├── exerciseId: string
│   ├── completedAt: timestamp
│   ├── duration: number
│   ├── notes: string
│   └── feeling: string
│
├── progress/{userId}/{progressId}
│   ├── date: timestamp
│   ├── weight: number
│   ├── measurements: map
│   ├── photoUrl: string
│   ├── bodyFat: number
│   └── notes: string
│
├── timelapse/{userId}/{videoId}
│   ├── photoRefs: array
│   ├── generatedAt: timestamp
│   ├── videoUrl: string
│   ├── duration: number
│   ├── isPublic: boolean
│   └── sharedToCommunity: boolean
│
└── ... (other collections)
```

### Indexes

Key composite indexes for performance:

1. **Programs**: `category + level + createdAt`
2. **Exercises**: `muscleGroups (array) + createdAt`
3. **Workouts**: `completedAt` (descending)
4. **Progress**: `date` (descending)
5. **Posts**: `userId + createdAt` (descending)

## Storage Structure (Firebase Storage)

```
storage/
├── users/{userId}/
│   ├── profile/
│   │   └── avatar.jpg
│   ├── progress/
│   │   ├── 2024-01-01.jpg
│   │   ├── 2024-01-08.jpg
│   │   └── ...
│   └── timelapse/
│       ├── photos/
│       │   ├── photo_001.jpg
│       │   └── ...
│       └── videos/
│           └── timelapse_123456.mp4
├── exercises/{exerciseId}/
│   ├── video.mp4
│   ├── thumbnail.jpg
│   └── instructions/
│       └── step_1.jpg
├── programs/{programId}/
│   └── cover.jpg
├── recipes/{recipeId}/
│   └── image.jpg
└── community/{userId}/posts/
    ├── post_001.jpg
    └── ...
```

## Cloud Functions Architecture

### Function Types

1. **HTTP Callable Functions** (Client → Function)
   - `generateTimelapse`: Generate time-lapse video from photos
   - `trackEvent`: Track custom analytics events
   - `syncHealthData`: Sync health data from mobile devices

2. **Firestore Triggers** (Database → Function)
   - `onSubscriptionUpdate`: Handle subscription status changes
   - `moderatePost`: Auto-moderate community posts
   - `sendPushNotification`: Send notifications on new documents

3. **Scheduled Functions** (Cron → Function)
   - `weeklyPhotoReminder`: Send weekly photo reminders (Sunday 9 AM)
   - `checkExpiringSubscriptions`: Check for expiring subscriptions (Daily 10 AM)
   - `dailyWorkoutReminder`: Send workout reminders (Daily 6 PM)
   - `aggregateDailyAnalytics`: Aggregate analytics data (Daily midnight)

### Time-Lapse Generation Flow

```
User Request
     │
     ▼
generateTimelapse Function
     │
     ├──▶ Fetch photos from Storage
     │
     ├──▶ Download to temp directory
     │
     ├──▶ Process with FFmpeg
     │         │
     │         ├─ 1 second per photo
     │         ├─ 1080x1920 (portrait)
     │         └─ H.264 codec
     │
     ├──▶ Upload video to Storage
     │
     ├──▶ Update Firestore document
     │
     └──▶ Clean up temp files
```

## Web Dashboard Architecture (Next.js)

### App Router Structure

```
src/app/
├── layout.tsx                        # Root layout
├── page.tsx                          # Home page
├── (auth)/                          # Auth routes group
│   ├── login/
│   └── register/
├── (dashboard)/                     # Dashboard routes group
│   ├── layout.tsx                  # Dashboard layout
│   ├── programs/
│   │   ├── page.tsx               # List programs
│   │   ├── [id]/
│   │   │   └── page.tsx          # Edit program
│   │   └── new/
│   │       └── page.tsx          # Create program
│   ├── exercises/
│   ├── users/
│   └── analytics/
└── api/                            # API routes
    ├── programs/
    └── analytics/
```

### Server vs Client Components

**Server Components** (default):
- Data fetching from Firebase
- Database queries
- Initial page rendering

**Client Components** (`'use client'`):
- Interactive forms
- Real-time updates
- Client-side state management

## Security Architecture

### Firestore Security Rules

```
Rules Hierarchy:
1. Authentication check
2. Ownership check
3. Role-based access (admin)
4. Data validation
5. Business logic rules
```

Key security patterns:

1. **User Data**: Only owner or admin can access
2. **Public Content**: Anyone can read, only admin can write
3. **Private Content**: Only owner can access
4. **Premium Features**: Check subscription status

### Storage Security Rules

```
Rules Hierarchy:
1. Authentication check
2. File type validation
3. File size validation
4. Ownership check
```

### App Check

Protects backend resources from abuse:
- reCAPTCHA for web
- DeviceCheck for iOS
- SafetyNet for Android

## Data Flow Examples

### 1. User Login Flow

```
LoginPage
    │
    ├─▶ User enters email/password
    │
    ├─▶ authStateProvider.login(email, password)
    │
    ├─▶ LoginUseCase.execute(email, password)
    │
    ├─▶ AuthRepository.login(email, password)
    │
    ├─▶ AuthRemoteDataSource.login(email, password)
    │
    ├─▶ Firebase Authentication
    │
    ◀── User object returned
    │
    ├─▶ AuthLocalDataSource.saveUser(user)
    │
    ├─▶ State updated: AuthState.authenticated(user)
    │
    └─▶ Navigate to HomePage
```

### 2. Create Time-Lapse Flow

```
TimelapseScreen
    │
    ├─▶ User clicks "Generate Video"
    │
    ├─▶ timelapseProvider.generateVideo()
    │
    ├─▶ GenerateTimelapseUseCase.execute()
    │
    ├─▶ TimelapseRepository.generateVideo()
    │
    ├─▶ Call Cloud Function: generateTimelapse
    │
    ├─▶ Cloud Function processes photos
    │
    ├─▶ Video uploaded to Storage
    │
    ├─▶ Firestore document updated
    │
    ◀── Video URL returned
    │
    ├─▶ State updated: TimelapseState.completed(videoUrl)
    │
    └─▶ Show video in UI
```

### 3. Offline Data Sync Flow

```
User opens app (offline)
    │
    ├─▶ Load from local cache (Hive/Sqflite)
    │
    ├─▶ Display cached data
    │
    ├─▶ User makes changes
    │
    ├─▶ Save to local database
    │
    ├─▶ Mark for sync
    │
Internet connection restored
    │
    ├─▶ Sync service activates
    │
    ├─▶ Upload pending changes to Firestore
    │
    ├─▶ Download new data from Firestore
    │
    └─▶ Update local cache
```

## Performance Optimizations

### Mobile App

1. **Lazy Loading**: Load data on-demand using pagination
2. **Image Caching**: Use `cached_network_image` for all network images
3. **Database Indexing**: Proper indexes in Sqflite for fast queries
4. **Code Splitting**: Separate routes with `go_router` for smaller bundles
5. **Widget Optimization**: Use `const` constructors where possible

### Firestore

1. **Composite Indexes**: For complex queries
2. **Query Limits**: Limit results to reduce read costs
3. **Offline Persistence**: Reduce network calls
4. **Batch Operations**: Group multiple writes

### Cloud Functions

1. **Cold Start Optimization**: Keep functions warm
2. **Memory Allocation**: Optimize for workload
3. **Concurrent Execution**: Process batches in parallel
4. **Caching**: Cache frequently accessed data

## Monitoring & Analytics

### Firebase Analytics Events

```javascript
// Custom events tracked:
- workout_start
- workout_complete
- subscribe_success
- subscribe_cancel
- timelapse_generated
- timelapse_shared
- challenge_joined
- challenge_completed
- community_post_created
- recipe_viewed
- program_started
```

### Error Tracking

- Firebase Crashlytics for crash reports
- Custom error logging to Firestore
- Function execution logs in Cloud Logging

## Scalability Considerations

### Current Limits

- Firestore: 1M document reads/writes per day (free tier)
- Storage: 5GB storage, 1GB/day downloads (free tier)
- Functions: 2M invocations/month (free tier)

### Scaling Strategy

1. **Horizontal Scaling**: Cloud Functions auto-scale
2. **Data Sharding**: Partition user data by region
3. **CDN**: Use Firebase Hosting CDN for static assets
4. **Caching**: Implement Redis for frequently accessed data
5. **Read Replicas**: Use Firestore multi-region if needed

## Best Practices

### Code Organization

- One feature = One folder
- Barrel files for exports
- Clear naming conventions
- Comments in English
- No magic numbers/strings

### Testing Strategy

- Unit tests for business logic (use cases)
- Widget tests for UI components
- Integration tests for complete flows
- Target coverage > 80%

### Version Control

- Feature branches from `develop`
- Pull requests for code review
- Conventional commits
- Semantic versioning

## Future Enhancements

- GraphQL API layer for dashboard
- Redis caching layer
- Elasticsearch for advanced search
- ML-based workout recommendations
- Real-time video streaming for classes
- Multi-language content management
