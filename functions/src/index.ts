import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export * from './timelapse';
export * from './subscriptions';
export * from './notifications';
export * from './analytics';
export * from './moderation';
export * from './health-sync';
