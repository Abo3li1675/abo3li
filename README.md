# Beginner Workout App

A comprehensive fitness application designed for beginners with mobile apps (iOS & Android), web dashboard, and Firebase backend. Features personalized workout programs, time-lapse progress tracking, nutrition guidance, community features, and more.

## 🎯 Project Overview

**Target Audience**: Beginner men and women of all ages
**Platforms**: iOS, Android (Flutter) + Web Dashboard (Next.js)
**Languages**: Arabic and English with full bilingual support
**Key Feature**: Time-Lapse Progress Video Generation

## ✨ Key Features

### Mobile App (Flutter)
- 🏋️ **Workout Programs**: Categorized by level, duration, and equipment
- 📸 **Time-Lapse**: Weekly photo tracking with automatic video generation
- 📊 **Progress Tracking**: Weight, measurements, charts, and statistics
- 🥗 **Nutrition**: Calorie calculator, recipes, and meal plans
- 👥 **Community**: Share progress, interact with others
- 🏆 **Challenges**: Weekly/monthly challenges with gamification
- 💳 **Subscriptions**: Stripe (web) + In-App Purchases (iOS/Android)
- 🔄 **Health Integration**: Apple Health & Google Fit sync
- 🌐 **Full Offline Support**: Works without internet connection

### Web Dashboard (Next.js)
- 📝 **Content Management**: CRUD for programs, exercises, recipes
- 📹 **Media Management**: Upload videos with automatic thumbnail generation
- 👥 **User Management**: Monitor users and subscriptions
- 📈 **Analytics**: Detailed statistics and performance metrics
- 🛡️ **Moderation**: Community content moderation tools
- 👤 **Role System**: Owner and Editor roles

### Backend (Firebase)
- 🔐 **Authentication**: Email, Google, Apple Sign-In
- 🗄️ **Firestore**: Real-time database with offline support
- 💾 **Storage**: Images and videos with CDN
- ⚡ **Cloud Functions**: Time-lapse generation, notifications, analytics
- 📲 **FCM**: Push notifications
- 🔥 **Remote Config**: Remote feature flags
- 🛡️ **App Check**: Bot protection

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
mobile/
├── lib/
│   ├── core/                 # Core functionality (constants, theme, utils)
│   ├── features/            # Feature modules (Clean Architecture)
│   │   ├── auth/           # Authentication feature
│   │   │   ├── data/       # Data layer (repositories, models, datasources)
│   │   │   ├── domain/     # Business logic (entities, use cases)
│   │   │   └── presentation/ # UI layer (pages, widgets, providers)
│   │   └── ...
│   └── shared/              # Shared components and utilities

dashboard/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities and Firebase Admin
│   └── types/               # TypeScript types

functions/
├── src/
│   ├── timelapse/          # Time-lapse video generation
│   ├── subscriptions/      # Subscription management
│   ├── notifications/      # Push notifications
│   └── ...
```

## 🚀 Quick Start

### Prerequisites

- **Flutter**: 3.x or higher
- **Node.js**: 18.x or higher
- **Firebase CLI**: Latest version
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/beginner-workout-app.git
   cd beginner-workout-app
   ```

2. **Setup Firebase**
   ```bash
   cd firebase
   firebase login
   firebase init
   ```
   - Follow the prompts to setup Firestore, Storage, Functions, and Hosting

3. **Configure Firebase in Mobile App**
   ```bash
   cd ../mobile
   # Install flutterfire CLI
   dart pub global activate flutterfire_cli
   # Configure Firebase for Flutter
   flutterfire configure
   ```

4. **Install Mobile Dependencies**
   ```bash
   flutter pub get
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

5. **Setup Dashboard**
   ```bash
   cd ../dashboard
   npm install
   # Create .env.local file with your Firebase Admin credentials
   cp .env.example .env.local
   ```

6. **Setup Cloud Functions**
   ```bash
   cd ../functions
   npm install
   npm run build
   ```

### Development

**Run Mobile App**
```bash
cd mobile
flutter run
```

**Run Dashboard**
```bash
cd dashboard
npm run dev
```

**Run Firebase Emulators**
```bash
cd firebase
firebase emulators:start
```

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [API Documentation](docs/API.md) - API endpoints and usage
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment steps
- [Testing Guide](docs/TESTING.md) - Testing strategy and guidelines

## 🛠️ Technology Stack

### Mobile (Flutter)
- **Framework**: Flutter 3.x with Dart 3.x
- **State Management**: Riverpod 2.x
- **Routing**: go_router
- **Database**: Sqflite + Hive
- **Backend**: Firebase (Auth, Firestore, Storage, FCM)
- **Testing**: flutter_test, mockito, integration_test

### Dashboard (Next.js)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Forms**: react-hook-form + zod
- **Charts**: recharts

### Backend (Firebase)
- **Auth**: Firebase Authentication
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Functions**: Cloud Functions (Node.js 18 + TypeScript)
- **Messaging**: Firebase Cloud Messaging
- **Analytics**: Firebase Analytics

### Payments
- **Web**: Stripe
- **iOS**: In-App Purchase (StoreKit)
- **Android**: In-App Billing

## 📅 Implementation Phases

The project is divided into 11 phases (17 weeks total):

1. **Phase 1** (2 weeks): Project setup, Firebase, Authentication
2. **Phase 2** (2 weeks): Programs and exercises system
3. **Phase 3** (2 weeks): Subscription and payments
4. **Phase 4** (3 weeks): Time-Lapse feature ⭐ (Priority)
5. **Phase 5** (2 weeks): Progress tracking
6. **Phase 6** (2 weeks): Nutrition features
7. **Phase 7** (2 weeks): Community features
8. **Phase 8** (1 week): Challenges and achievements
9. **Phase 9** (1 week): Health integrations
10. **Phase 10** (2 weeks): Web dashboard
11. **Phase 11** (1 week): Testing and deployment

## 🔐 Security

- Comprehensive Firestore Security Rules
- Firebase App Check for bot protection
- Secure API endpoints with authentication
- Input validation and sanitization
- Encrypted sensitive data storage
- Regular security audits

## 🧪 Testing

```bash
# Mobile tests
cd mobile
flutter test                          # Unit tests
flutter test integration_test/       # Integration tests

# Dashboard tests
cd dashboard
npm test                              # Jest tests

# Functions tests
cd functions
npm test                              # Function tests
```

## 📊 Key Performance Indicators (KPIs)

- Monthly subscription rate
- Number of time-lapse videos created
- Weekly engagement rate (% active users)
- Retention rate (30, 60, 90 days)
- Community interaction rate
- Average completed workouts per month

## 🤝 Contributing

This is a private project. For internal team members:

1. Create a feature branch from `develop`
2. Make your changes following the code style guidelines
3. Write/update tests as needed
4. Submit a pull request for review

## 📝 License

Copyright © 2024. All rights reserved.

## 📧 Contact

For questions or support, contact: [your-email@example.com]

---

**Built with ❤️ for fitness beginners everywhere**