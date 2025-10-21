import 'package:flutter/material.dart';

/// Localization configuration for the application
class LocalizationConfig {
  LocalizationConfig._();

  // Supported locales
  static const Locale english = Locale('en', 'US');
  static const Locale arabic = Locale('ar', 'SA');

  static const List<Locale> supportedLocales = [
    english,
    arabic,
  ];

  // Default locale
  static const Locale fallbackLocale = english;
  static const Locale startLocale = english;

  // Translation file path
  static const String translationsPath = 'assets/localization';

  /// Get locale from language code
  static Locale getLocaleFromLanguageCode(String languageCode) {
    switch (languageCode) {
      case 'ar':
        return arabic;
      case 'en':
      default:
        return english;
    }
  }

  /// Get language code from locale
  static String getLanguageCodeFromLocale(Locale locale) {
    return locale.languageCode;
  }

  /// Check if locale is RTL
  static bool isRTL(Locale locale) {
    return locale.languageCode == 'ar';
  }

  /// Get text direction from locale
  static TextDirection getTextDirection(Locale locale) {
    return isRTL(locale) ? TextDirection.rtl : TextDirection.ltr;
  }
}
