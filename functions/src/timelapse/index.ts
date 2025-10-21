import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const db = admin.firestore();
const storage = admin.storage();

/**
 * Generate time-lapse video from progress photos
 * Triggered by HTTP request or Firestore write
 */
export const generateTimelapse = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate time-lapse'
    );
  }

  const userId = context.auth.uid;
  const { timelapseId } = data;

  try {
    functions.logger.info(`Starting time-lapse generation for user: ${userId}`);

    // Get time-lapse document
    const timelapseRef = db
      .collection('timelapse')
      .doc(userId)
      .collection('videos')
      .doc(timelapseId);
    const timelapseDoc = await timelapseRef.get();

    if (!timelapseDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Time-lapse not found'
      );
    }

    const timelapseData = timelapseDoc.data();
    const photoRefs = timelapseData?.photoRefs || [];

    // Minimum 4 photos required
    if (photoRefs.length < 4) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'At least 4 photos required to generate time-lapse'
      );
    }

    // Create temporary directory
    const tempDir = path.join(os.tmpdir(), `timelapse_${userId}_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Download all photos
    functions.logger.info(`Downloading ${photoRefs.length} photos...`);
    const downloadedPhotos: string[] = [];

    for (let i = 0; i < photoRefs.length; i++) {
      const photoRef = photoRefs[i];
      const photoPath = path.join(tempDir, `photo_${String(i).padStart(4, '0')}.jpg`);

      try {
        const bucket = storage.bucket();
        await bucket.file(photoRef).download({ destination: photoPath });
        downloadedPhotos.push(photoPath);
      } catch (error) {
        functions.logger.error(`Error downloading photo ${photoRef}:`, error);
      }
    }

    if (downloadedPhotos.length < 4) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Failed to download enough photos'
      );
    }

    // Generate video using FFmpeg
    const outputPath = path.join(tempDir, 'timelapse.mp4');
    functions.logger.info('Generating video with FFmpeg...');

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(path.join(tempDir, 'photo_%04d.jpg'))
        .inputFPS(1) // 1 second per photo
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt yuv420p',
          '-crf 23',
          '-preset medium',
        ])
        .size('1080x1920') // Portrait mode
        .output(outputPath)
        .on('end', () => {
          functions.logger.info('Video generation complete');
          resolve();
        })
        .on('error', (error) => {
          functions.logger.error('FFmpeg error:', error);
          reject(error);
        })
        .run();
    });

    // Upload video to Storage
    functions.logger.info('Uploading video to Storage...');
    const videoFileName = `timelapse_${Date.now()}.mp4`;
    const videoPath = `users/${userId}/timelapse/videos/${videoFileName}`;

    const bucket = storage.bucket();
    await bucket.upload(outputPath, {
      destination: videoPath,
      metadata: {
        contentType: 'video/mp4',
        metadata: {
          userId,
          timelapseId,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    // Get download URL
    const file = bucket.file(videoPath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiry
    });

    // Update Firestore document
    await timelapseRef.update({
      videoUrl: url,
      videoPath,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      duration: downloadedPhotos.length, // Duration in seconds
      status: 'completed',
    });

    // Clean up temporary files
    functions.logger.info('Cleaning up temporary files...');
    fs.rmSync(tempDir, { recursive: true, force: true });

    functions.logger.info('Time-lapse generation successful');

    return {
      success: true,
      videoUrl: url,
      duration: downloadedPhotos.length,
    };
  } catch (error) {
    functions.logger.error('Error generating time-lapse:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate time-lapse video',
      error
    );
  }
});

/**
 * Scheduled function to send weekly photo reminders
 * Runs every Sunday at 9 AM
 */
export const weeklyPhotoReminder = functions.pubsub
  .schedule('0 9 * * 0') // Every Sunday at 9 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    functions.logger.info('Running weekly photo reminder...');

    try {
      // Get all active users
      const usersSnapshot = await db
        .collection('users')
        .where('subscriptionStatus', '==', 'active')
        .get();

      const notificationPromises: Promise<void>[] = [];

      usersSnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Send notification
        const notificationPromise = db.collection('notifications').add({
          userId,
          type: 'progress_photo',
          title: userData.language === 'ar'
            ? 'لا تنس التقاط صورة التقدم الأسبوعية'
            : 'Don\'t forget to take your weekly progress photo',
          body: userData.language === 'ar'
            ? 'التقط صورة اليوم لمتابعة تقدمك'
            : 'Capture today\'s photo to track your progress',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
        });

        notificationPromises.push(notificationPromise);
      });

      await Promise.all(notificationPromises);

      functions.logger.info(`Sent ${notificationPromises.length} photo reminders`);
    } catch (error) {
      functions.logger.error('Error sending photo reminders:', error);
    }
  });
