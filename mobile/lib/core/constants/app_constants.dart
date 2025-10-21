/// Application-wide constants
class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Beginner Workout';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';

  // API
  static const String apiBaseUrl = 'https://api.beginnerworkout.com';
  static const Duration apiTimeout = Duration(seconds: 30);

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 50;

  // Cache
  static const Duration cacheExpiry = Duration(hours: 24);
  static const int maxCacheSize = 100 * 1024 * 1024; // 100 MB

  // Animation
  static const Duration shortAnimationDuration = Duration(milliseconds: 200);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 300);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);

  // Time-lapse
  static const int timelapsePhotoDuration = 1; // seconds per photo
  static const int maxTimelapsePhotos = 52; // 1 year of weekly photos
  static const int minTimelapsePhotos = 4; // minimum 4 photos

  // Progress
  static const Duration weeklyPhotoReminder = Duration(days: 7);
  static const List<String> measurementTypes = [
    'chest',
    'waist',
    'hips',
    'arms',
    'thighs',
  ];

  // Subscription
  static const String subscriptionProductId = 'premium_monthly';
  static const Duration freeTrialDuration = Duration(days: 7);

  // Workout
  static const int minRestTime = 15; // seconds
  static const int maxRestTime = 300; // seconds
  static const int defaultRestTime = 60; // seconds

  // Health
  static const int minAge = 13;
  static const int maxAge = 100;
  static const double minWeight = 30.0; // kg
  static const double maxWeight = 300.0; // kg
  static const double minHeight = 100.0; // cm
  static const double maxHeight = 250.0; // cm

  // Media
  static const int maxPhotoSize = 5 * 1024 * 1024; // 5 MB
  static const int maxVideoSize = 100 * 1024 * 1024; // 100 MB
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png'];
  static const List<String> allowedVideoFormats = ['mp4', 'mov'];

  // Community
  static const int maxPostLength = 500;
  static const int maxCommentLength = 200;
  static const int maxMediaPerPost = 5;

  // Notifications
  static const String workoutReminderChannelId = 'workout_reminders';
  static const String progressPhotoChannelId = 'progress_photos';
  static const String challengeChannelId = 'challenges';
  static const String subscriptionChannelId = 'subscriptions';
}

/// Storage keys for local data
class StorageKeys {
  StorageKeys._();

  // User preferences
  static const String languageCode = 'language_code';
  static const String themeMode = 'theme_mode';
  static const String units = 'units'; // 'metric' or 'imperial'

  // Onboarding
  static const String hasCompletedOnboarding = 'has_completed_onboarding';
  static const String userGoal = 'user_goal';

  // Cache
  static const String cachedPrograms = 'cached_programs';
  static const String cachedExercises = 'cached_exercises';
  static const String cachedRecipes = 'cached_recipes';

  // Sync
  static const String lastSyncTime = 'last_sync_time';
  static const String pendingSync = 'pending_sync';

  // Auth
  static const String userId = 'user_id';
  static const String userEmail = 'user_email';
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
}

/// API endpoints
class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';

  // User
  static const String userProfile = '/user/profile';
  static const String updateProfile = '/user/update';
  static const String deleteAccount = '/user/delete';

  // Programs
  static const String programs = '/programs';
  static String programById(String id) => '/programs/$id';
  static const String featuredPrograms = '/programs/featured';

  // Exercises
  static const String exercises = '/exercises';
  static String exerciseById(String id) => '/exercises/$id';

  // Workouts
  static const String workouts = '/workouts';
  static const String logWorkout = '/workouts/log';
  static String workoutHistory(String userId) => '/workouts/history/$userId';

  // Progress
  static const String progress = '/progress';
  static const String logProgress = '/progress/log';
  static String progressHistory(String userId) => '/progress/history/$userId';

  // Time-lapse
  static const String timelapse = '/timelapse';
  static const String generateTimelapse = '/timelapse/generate';
  static String timelapseById(String id) => '/timelapse/$id';

  // Nutrition
  static const String recipes = '/recipes';
  static String recipeById(String id) => '/recipes/$id';
  static const String mealPlans = '/nutrition/meal-plans';

  // Community
  static const String posts = '/community/posts';
  static String postById(String id) => '/community/posts/$id';
  static String postComments(String postId) => '/community/posts/$postId/comments';
  static String likePost(String postId) => '/community/posts/$postId/like';

  // Challenges
  static const String challenges = '/challenges';
  static String challengeById(String id) => '/challenges/$id';
  static String joinChallenge(String id) => '/challenges/$id/join';

  // Subscription
  static const String subscription = '/subscription';
  static const String subscriptionStatus = '/subscription/status';
  static const String cancelSubscription = '/subscription/cancel';
}

/// Firebase collection names
class FirebaseCollections {
  FirebaseCollections._();

  static const String users = 'users';
  static const String programs = 'programs';
  static const String exercises = 'exercises';
  static const String workouts = 'workouts';
  static const String progress = 'progress';
  static const String timelapse = 'timelapse';
  static const String recipes = 'recipes';
  static const String challenges = 'challenges';
  static const String achievements = 'achievements';
  static const String posts = 'posts';
  static const String comments = 'comments';
}

/// Asset paths
class AssetPaths {
  AssetPaths._();

  // Images
  static const String imagesPath = 'assets/images/';
  static const String logo = '${imagesPath}logo.png';
  static const String onboarding1 = '${imagesPath}onboarding_1.png';
  static const String onboarding2 = '${imagesPath}onboarding_2.png';
  static const String onboarding3 = '${imagesPath}onboarding_3.png';
  static const String placeholder = '${imagesPath}placeholder.png';

  // Icons
  static const String iconsPath = 'assets/icons/';
  static const String homeIcon = '${iconsPath}home.svg';
  static const String programsIcon = '${iconsPath}programs.svg';
  static const String progressIcon = '${iconsPath}progress.svg';
  static const String communityIcon = '${iconsPath}community.svg';
  static const String profileIcon = '${iconsPath}profile.svg';

  // Animations
  static const String animationsPath = 'assets/animations/';
  static const String loading = '${animationsPath}loading.json';
  static const String success = '${animationsPath}success.json';
  static const String error = '${animationsPath}error.json';
  static const String emptyState = '${animationsPath}empty.json';
}
