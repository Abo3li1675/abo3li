import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Handle subscription status changes
 * Called when subscription status is updated
 */
export const onSubscriptionUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const { userId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    // Check if subscription status changed
    if (before.subscriptionStatus !== after.subscriptionStatus) {
      functions.logger.info(
        `Subscription status changed for user ${userId}: ${before.subscriptionStatus} -> ${after.subscriptionStatus}`
      );

      // Handle subscription activation
      if (after.subscriptionStatus === 'active') {
        await handleSubscriptionActivated(userId, after);
      }

      // Handle subscription cancellation
      if (after.subscriptionStatus === 'cancelled') {
        await handleSubscriptionCancelled(userId, after);
      }

      // Handle subscription expiration
      if (after.subscriptionStatus === 'expired') {
        await handleSubscriptionExpired(userId, after);
      }
    }
  });

/**
 * Handle subscription activation
 */
async function handleSubscriptionActivated(userId: string, userData: any): Promise<void> {
  try {
    // Send welcome notification
    await db.collection('notifications').add({
      userId,
      type: 'subscription',
      title: userData.language === 'ar' ? 'مرحباً في البريميوم!' : 'Welcome to Premium!',
      body: userData.language === 'ar'
        ? 'استمتع بجميع الميزات المتقدمة'
        : 'Enjoy all premium features',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    // Log analytics event
    await db.collection('analytics').add({
      eventType: 'subscribe_success',
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        subscriptionType: userData.subscriptionType || 'monthly',
      },
    });

    functions.logger.info(`Subscription activated for user ${userId}`);
  } catch (error) {
    functions.logger.error('Error handling subscription activation:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(userId: string, userData: any): Promise<void> {
  try {
    // Send cancellation notification
    await db.collection('notifications').add({
      userId,
      type: 'subscription',
      title: userData.language === 'ar' ? 'تم إلغاء الاشتراك' : 'Subscription Cancelled',
      body: userData.language === 'ar'
        ? 'يمكنك إعادة الاشتراك في أي وقت'
        : 'You can resubscribe anytime',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    // Log analytics event
    await db.collection('analytics').add({
      eventType: 'subscribe_cancel',
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Subscription cancelled for user ${userId}`);
  } catch (error) {
    functions.logger.error('Error handling subscription cancellation:', error);
  }
}

/**
 * Handle subscription expiration
 */
async function handleSubscriptionExpired(userId: string, userData: any): Promise<void> {
  try {
    // Send expiration notification
    await db.collection('notifications').add({
      userId,
      type: 'subscription',
      title: userData.language === 'ar' ? 'انتهى الاشتراك' : 'Subscription Expired',
      body: userData.language === 'ar'
        ? 'قم بتجديد اشتراكك للوصول إلى المزايا'
        : 'Renew your subscription to access premium features',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    functions.logger.info(`Subscription expired for user ${userId}`);
  } catch (error) {
    functions.logger.error('Error handling subscription expiration:', error);
  }
}

/**
 * Scheduled function to check for expiring subscriptions
 * Runs daily at 10 AM
 */
export const checkExpiringSubscriptions = functions.pubsub
  .schedule('0 10 * * *') // Daily at 10 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    functions.logger.info('Checking for expiring subscriptions...');

    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const usersSnapshot = await db
        .collection('users')
        .where('subscriptionStatus', '==', 'active')
        .where('subscriptionEnd', '<=', threeDaysFromNow)
        .get();

      const notificationPromises: Promise<void>[] = [];

      usersSnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();

        const daysUntilExpiry = Math.ceil(
          (userData.subscriptionEnd.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Send expiration warning
        const notificationPromise = db.collection('notifications').add({
          userId,
          type: 'subscription',
          title: userData.language === 'ar'
            ? `اشتراكك ينتهي في ${daysUntilExpiry} أيام`
            : `Your subscription expires in ${daysUntilExpiry} days`,
          body: userData.language === 'ar'
            ? 'قم بالتجديد الآن لمواصلة الاستمتاع بالمزايا'
            : 'Renew now to continue enjoying premium features',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
        });

        notificationPromises.push(notificationPromise);
      });

      await Promise.all(notificationPromises);

      functions.logger.info(`Sent ${notificationPromises.length} expiration warnings`);
    } catch (error) {
      functions.logger.error('Error checking expiring subscriptions:', error);
    }
  });
