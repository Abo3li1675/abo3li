import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Track custom analytics events
 */
export const trackEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to track events'
    );
  }

  const { eventType, metadata } = data;
  const userId = context.auth.uid;

  try {
    await db.collection('analytics').add({
      eventType,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: metadata || {},
    });

    return { success: true };
  } catch (error) {
    functions.logger.error('Error tracking event:', error);
    throw new functions.https.HttpsError('internal', 'Failed to track event');
  }
});

/**
 * Aggregate daily analytics
 * Runs daily at midnight
 */
export const aggregateDailyAnalytics = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    functions.logger.info('Aggregating daily analytics...');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all events from yesterday
      const eventsSnapshot = await db
        .collection('analytics')
        .where('timestamp', '>=', yesterday)
        .where('timestamp', '<', today)
        .get();

      // Aggregate by event type
      const aggregation: Record<string, number> = {};

      eventsSnapshot.forEach((doc) => {
        const data = doc.data();
        const eventType = data.eventType;

        if (!aggregation[eventType]) {
          aggregation[eventType] = 0;
        }

        aggregation[eventType]++;
      });

      // Store aggregated data
      await db.collection('analytics_daily').add({
        date: yesterday,
        totalEvents: eventsSnapshot.size,
        eventBreakdown: aggregation,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Aggregated ${eventsSnapshot.size} events`);
    } catch (error) {
      functions.logger.error('Error aggregating analytics:', error);
    }
  });
