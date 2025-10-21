import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Send push notification when a new notification document is created
 */
export const sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const { userId, title, body, type } = notification;

    try {
      // Get user's FCM tokens
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData || !userData.fcmTokens || userData.fcmTokens.length === 0) {
        functions.logger.info(`No FCM tokens found for user ${userId}`);
        return;
      }

      // Create notification payload
      const payload: admin.messaging.MulticastMessage = {
        tokens: userData.fcmTokens,
        notification: {
          title,
          body,
        },
        data: {
          type,
          notificationId: context.params.notificationId,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: getChannelId(type),
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Send notification
      const response = await admin.messaging().sendEachForMulticast(payload);

      functions.logger.info(
        `Sent notification to ${response.successCount} devices for user ${userId}`
      );

      // Remove invalid tokens
      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];

        response.responses.forEach((resp, idx) => {
          if (!resp.success && userData.fcmTokens[idx]) {
            tokensToRemove.push(userData.fcmTokens[idx]);
          }
        });

        if (tokensToRemove.length > 0) {
          await db.collection('users').doc(userId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove),
          });
        }
      }
    } catch (error) {
      functions.logger.error('Error sending push notification:', error);
    }
  });

/**
 * Get notification channel ID based on type
 */
function getChannelId(type: string): string {
  switch (type) {
    case 'workout_reminder':
      return 'workout_reminders';
    case 'progress_photo':
      return 'progress_photos';
    case 'challenge':
      return 'challenges';
    case 'subscription':
      return 'subscriptions';
    default:
      return 'default';
  }
}

/**
 * Scheduled function to send daily workout reminders
 * Runs daily at 6 PM
 */
export const dailyWorkoutReminder = functions.pubsub
  .schedule('0 18 * * *') // Daily at 6 PM
  .timeZone('UTC')
  .onRun(async (context) => {
    functions.logger.info('Sending daily workout reminders...');

    try {
      // Get all active users who haven't worked out today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usersSnapshot = await db
        .collection('users')
        .where('subscriptionStatus', '==', 'active')
        .get();

      const notificationPromises: Promise<void>[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Check if user has worked out today
        const workoutsSnapshot = await db
          .collection('workouts')
          .doc(userId)
          .collection('logs')
          .where('completedAt', '>=', today)
          .limit(1)
          .get();

        // Only send reminder if no workout today
        if (workoutsSnapshot.empty) {
          const notificationPromise = db.collection('notifications').add({
            userId,
            type: 'workout_reminder',
            title: userData.language === 'ar' ? 'حان وقت التمرين!' : 'Time to workout!',
            body: userData.language === 'ar'
              ? 'لا تفوت تمرين اليوم'
              : 'Don\'t miss today\'s workout',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
          });

          notificationPromises.push(notificationPromise);
        }
      }

      await Promise.all(notificationPromises);

      functions.logger.info(`Sent ${notificationPromises.length} workout reminders`);
    } catch (error) {
      functions.logger.error('Error sending workout reminders:', error);
    }
  });
