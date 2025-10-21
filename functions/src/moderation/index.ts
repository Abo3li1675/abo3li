import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Moderate community posts
 * Triggered when a new post is created
 */
export const moderatePost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const post = snap.data();
    const { content, userId } = post;

    try {
      // Basic profanity filter (placeholder)
      const hasProfanity = checkForProfanity(content);

      if (hasProfanity) {
        functions.logger.warn(`Post ${context.params.postId} flagged for profanity`);

        // Flag post for review
        await snap.ref.update({
          flagged: true,
          flagReason: 'profanity',
          moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Notify moderators
        await db.collection('moderation_queue').add({
          postId: context.params.postId,
          userId,
          reason: 'profanity',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      functions.logger.error('Error moderating post:', error);
    }
  });

/**
 * Basic profanity check (placeholder)
 * In production, use a proper content moderation API
 */
function checkForProfanity(text: string): boolean {
  const profanityList = ['badword1', 'badword2']; // Placeholder
  const lowerText = text.toLowerCase();

  return profanityList.some((word) => lowerText.includes(word));
}
