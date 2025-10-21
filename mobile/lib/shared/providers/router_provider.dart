import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

/// Router configuration provider
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    routes: [
      // Splash screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Onboarding
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // Authentication
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // Main app with bottom navigation
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const MainScreen(),
        routes: [
          // Programs
          GoRoute(
            path: 'programs',
            name: 'programs',
            builder: (context, state) => const ProgramsScreen(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'program-details',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return ProgramDetailsScreen(programId: id);
                },
              ),
            ],
          ),

          // Progress
          GoRoute(
            path: 'progress',
            name: 'progress',
            builder: (context, state) => const ProgressScreen(),
          ),

          // Time-lapse
          GoRoute(
            path: 'timelapse',
            name: 'timelapse',
            builder: (context, state) => const TimelapseScreen(),
          ),

          // Community
          GoRoute(
            path: 'community',
            name: 'community',
            builder: (context, state) => const CommunityScreen(),
          ),

          // Profile
          GoRoute(
            path: 'profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),

      // Error page
      GoRoute(
        path: '/error',
        name: 'error',
        builder: (context, state) => const ErrorScreen(),
      ),
    ],

    // Error handler
    errorBuilder: (context, state) => const ErrorScreen(),

    // Redirect logic
    redirect: (context, state) {
      // TODO: Implement auth state redirect logic
      return null;
    },
  );
});

// Placeholder screens (to be implemented in respective features)
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Splash Screen - To be implemented'),
      ),
    );
  }
}

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Onboarding Screen - To be implemented'),
      ),
    );
  }
}

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Login Screen - To be implemented'),
      ),
    );
  }
}

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Register Screen - To be implemented'),
      ),
    );
  }
}

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Main Screen - To be implemented'),
      ),
    );
  }
}

class ProgramsScreen extends StatelessWidget {
  const ProgramsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Programs Screen - To be implemented'),
      ),
    );
  }
}

class ProgramDetailsScreen extends StatelessWidget {
  const ProgramDetailsScreen({required this.programId, super.key});

  final String programId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('Program Details Screen - ID: $programId'),
      ),
    );
  }
}

class ProgressScreen extends StatelessWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Progress Screen - To be implemented'),
      ),
    );
  }
}

class TimelapseScreen extends StatelessWidget {
  const TimelapseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Time-lapse Screen - To be implemented'),
      ),
    );
  }
}

class CommunityScreen extends StatelessWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Community Screen - To be implemented'),
      ),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Profile Screen - To be implemented'),
      ),
    );
  }
}

class ErrorScreen extends StatelessWidget {
  const ErrorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Error Screen - To be implemented'),
      ),
    );
  }
}
