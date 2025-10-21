import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/localization_config.dart';
import 'core/utils/logger.dart';
import 'core/platform/firebase_options.dart';
import 'shared/providers/router_provider.dart';

/// Main entry point of the application
Future<void> main() async {
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize localization
  await EasyLocalization.ensureInitialized();

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Initialize Hive for local storage
  await Hive.initFlutter();

  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize logger
  AppLogger.init();

  // Run the app
  runApp(
    ProviderScope(
      child: EasyLocalization(
        supportedLocales: LocalizationConfig.supportedLocales,
        path: LocalizationConfig.translationsPath,
        fallbackLocale: LocalizationConfig.fallbackLocale,
        startLocale: LocalizationConfig.startLocale,
        child: const BeginnerWorkoutApp(),
      ),
    ),
  );
}

/// Root widget of the application
class BeginnerWorkoutApp extends ConsumerWidget {
  const BeginnerWorkoutApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      // App Info
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,

      // Localization
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,

      // Theme
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,

      // Routing
      routerConfig: router,
    );
  }
}

/// Theme mode provider
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);
