# Setup Guide

This guide will help you set up the Beginner Workout App development environment from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Web Dashboard Setup](#web-dashboard-setup)
5. [Cloud Functions Setup](#cloud-functions-setup)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Flutter SDK** (3.x or higher)
   ```bash
   # Download from https://flutter.dev/docs/get-started/install
   # After installation, verify:
   flutter doctor
   ```

2. **Node.js** (18.x or higher) and npm
   ```bash
   # Download from https://nodejs.org
   # Verify installation:
   node --version
   npm --version
   ```

3. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

4. **Git**
   ```bash
   git --version
   ```

5. **Code Editor** (VS Code recommended with extensions)
   - Flutter extension
   - Dart extension
   - ESLint extension
   - Prettier extension

### Platform-Specific Requirements

**For iOS Development:**
- macOS with Xcode 14+
- CocoaPods: `sudo gem install cocoapods`
- iOS Simulator or physical device

**For Android Development:**
- Android Studio with Android SDK
- Android Emulator or physical device

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: "beginner-workout-app"
4. Enable Google Analytics (recommended)
5. Choose or create Analytics account
6. Click "Create project"

### 2. Enable Firebase Services

**Authentication:**
1. Go to Authentication > Sign-in method
2. Enable:
   - Email/Password
   - Google
   - Apple (for iOS)

**Firestore Database:**
1. Go to Firestore Database
2. Click "Create database"
3. Start in production mode (we'll add security rules later)
4. Choose a location close to your users

**Storage:**
1. Go to Storage
2. Click "Get started"
3. Use production mode

**Cloud Functions:**
- Already configured when you deploy

**Cloud Messaging:**
1. Go to Cloud Messaging
2. Note down the Server key for later use

### 3. Configure Firebase CLI

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project
cd /path/to/beginner-workout-app/firebase
firebase init

# Select:
# - Firestore
# - Functions
# - Storage
# - Hosting

# Follow the prompts:
# - Use existing project: beginner-workout-app
# - Firestore rules file: firestore.rules
# - Firestore indexes: firestore.indexes.json
# - Functions language: TypeScript
# - Storage rules file: storage.rules
# - Public directory: ../dashboard/out
```

### 4. Deploy Security Rules and Indexes

```bash
cd firebase
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Mobile App Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/beginner-workout-app.git
cd beginner-workout-app
```

### 2. Configure Firebase for Flutter

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure Firebase
cd mobile
flutterfire configure --project=beginner-workout-app

# This will:
# - Create firebase_options.dart
# - Configure iOS app in Firebase Console
# - Configure Android app in Firebase Console
# - Download google-services.json (Android)
# - Download GoogleService-Info.plist (iOS)
```

### 3. Install Dependencies

```bash
cd mobile
flutter pub get
```

### 4. Generate Code

```bash
# Generate code for build_runner (models, providers, etc.)
flutter pub run build_runner build --delete-conflicting-outputs
```

### 5. iOS-Specific Setup

```bash
cd ios
pod install
cd ..

# Open Xcode
open ios/Runner.xcworkspace

# In Xcode:
# 1. Select Runner target
# 2. Update Bundle Identifier to match Firebase iOS app
# 3. Select a development team
# 4. Enable capabilities:
#    - Push Notifications
#    - Background Modes (Background fetch, Remote notifications)
#    - HealthKit
#    - Sign in with Apple
```

### 6. Android-Specific Setup

```bash
# Update android/app/build.gradle
# Ensure applicationId matches Firebase Android app

# For Google Sign-In, add SHA-1 fingerprint:
cd android
./gradlew signingReport

# Copy SHA-1 fingerprint and add it to Firebase Console:
# Project Settings > Your apps > Android app > Add fingerprint
```

### 7. Run the App

```bash
# List available devices
flutter devices

# Run on specific device
flutter run -d <device-id>

# Or simply
flutter run
```

## Web Dashboard Setup

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=beginner-workout-app
FIREBASE_CLIENT_EMAIL=your-service-account@beginner-workout-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Firebase Admin Credentials

1. Go to Firebase Console
2. Project Settings > Service Accounts
3. Click "Generate new private key"
4. Download JSON file
5. Copy credentials to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Dashboard will be available at http://localhost:3000

### 5. Build for Production

```bash
npm run build
npm start
```

## Cloud Functions Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Install FFmpeg (for time-lapse generation)

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### 3. Configure Environment Variables

```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set app.url="https://yourapp.com"
```

### 4. Build Functions

```bash
npm run build
```

### 5. Test Locally with Emulators

```bash
# Start emulators
cd ../firebase
firebase emulators:start

# Available emulators:
# - Auth: http://localhost:9099
# - Firestore: http://localhost:8080
# - Functions: http://localhost:5001
# - Storage: http://localhost:9199
# - Emulator UI: http://localhost:4000
```

### 6. Deploy Functions

```bash
firebase deploy --only functions
```

## Development Workflow

### Daily Development

1. **Start Firebase Emulators** (Terminal 1)
   ```bash
   cd firebase
   firebase emulators:start
   ```

2. **Run Mobile App** (Terminal 2)
   ```bash
   cd mobile
   flutter run
   ```

3. **Run Dashboard** (Terminal 3)
   ```bash
   cd dashboard
   npm run dev
   ```

### Code Generation

When you modify models or providers:

```bash
cd mobile
flutter pub run build_runner watch
```

### Testing

**Mobile:**
```bash
cd mobile
flutter test                    # Unit tests
flutter test integration_test/  # Integration tests
```

**Dashboard:**
```bash
cd dashboard
npm test
npm run test:watch
```

**Functions:**
```bash
cd functions
npm test
```

### Linting

**Mobile:**
```bash
cd mobile
flutter analyze
```

**Dashboard:**
```bash
cd dashboard
npm run lint
npm run lint:fix
```

**Functions:**
```bash
cd functions
npm run lint
npm run lint:fix
```

## Troubleshooting

### Flutter Issues

**Problem:** `flutter doctor` shows issues

**Solution:**
```bash
flutter doctor -v  # See detailed issues
flutter clean
flutter pub get
```

**Problem:** iOS build fails

**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
flutter clean
flutter run
```

**Problem:** Android build fails

**Solution:**
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter run
```

### Firebase Issues

**Problem:** Authentication not working

**Solution:**
- Verify Firebase configuration is correct
- Check that authentication methods are enabled in console
- For iOS, ensure GoogleService-Info.plist is added
- For Android, ensure google-services.json is in android/app/

**Problem:** Firestore permission denied

**Solution:**
- Check Firestore security rules are deployed
- Verify user is authenticated
- Check rules in Firebase Console

### Dashboard Issues

**Problem:** Firebase Admin SDK errors

**Solution:**
- Verify `.env.local` has correct credentials
- Ensure private key is properly formatted (with \n for newlines)
- Check service account has proper permissions

**Problem:** Build errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Functions Issues

**Problem:** Functions deployment fails

**Solution:**
```bash
cd functions
npm run build  # Check for TypeScript errors
firebase deploy --only functions --debug
```

**Problem:** Time-lapse generation fails

**Solution:**
- Verify FFmpeg is installed: `ffmpeg -version`
- Check Cloud Functions has enough memory (increase in index.ts)
- Review function logs: `firebase functions:log`

## Next Steps

After setup is complete:

1. Review [Architecture Documentation](ARCHITECTURE.md)
2. Read [API Documentation](API.md)
3. Check [Testing Guide](TESTING.md)
4. Start with Phase 1 implementation
5. Follow the [Deployment Guide](DEPLOYMENT.md) when ready for production

## Getting Help

- Check Firebase Documentation: https://firebase.google.com/docs
- Flutter Documentation: https://flutter.dev/docs
- Next.js Documentation: https://nextjs.org/docs
- Create an issue in the repository for project-specific questions
