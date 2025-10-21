import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Sync health data from mobile app
 * Called via HTTP from the mobile app
 */
export const syncHealthData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to sync health data'
    );
  }

  const userId = context.auth.uid;
  const { healthData, source } = data; // source: 'apple_health' or 'google_fit'

  try {
    // Store health data
    await db.collection('health_data').doc(userId).collection('sync').add({
      source,
      data: healthData,
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user's latest health metrics
    if (healthData.steps) {
      await db.collection('users').doc(userId).update({
        'healthMetrics.steps': healthData.steps,
        'healthMetrics.stepsUpdatedAt': admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    if (healthData.calories) {
      await db.collection('users').doc(userId).update({
        'healthMetrics.calories': healthData.calories,
        'healthMetrics.caloriesUpdatedAt': admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    functions.logger.info(`Health data synced for user ${userId} from ${source}`);

    return { success: true };
  } catch (error) {
    functions.logger.error('Error syncing health data:', error);
    throw new functions.https.HttpsError('internal', 'Failed to sync health data');
  }
});
