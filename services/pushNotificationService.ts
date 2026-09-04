import webpush from 'web-push';
import { prisma } from '@/lib/prisma/prisma';

// Configure Web Push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@sawaflix.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.error('[PushNotificationService] Failed to set VAPID details:', err);
  }
} else {
  console.warn('[PushNotificationService] VAPID keys are missing from environment variables.');
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  image?: string;
  id?: string;
  tag?: string;
  data?: Record<string, any>;
}

export async function sendWebPushToSubscribers(
  payload: PushPayload,
  targetUserId?: string
): Promise<{ successCount: number; failureCount: number }> {
  try {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.warn('[PushNotificationService] VAPID keys not configured, skipping push send.');
      return { successCount: 0, failureCount: 0 };
    }

    // Query subscribers from Neon PostgreSQL
    const subscribers = targetUserId
      ? await prisma.pushSubscription.findMany({ where: { userId: targetUserId } }).catch(() => [])
      : await prisma.pushSubscription.findMany().catch(() => []);

    if (!subscribers || subscribers.length === 0) {
      console.log('[PushNotificationService] No push subscribers found in database.');
      return { successCount: 0, failureCount: 0 };
    }

    const uniqueId = payload.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const formattedPayload = {
      title: payload.title,
      body: payload.body,
      url: payload.url || '/dashboard',
      icon: payload.icon || '/logos_and_pwas/android-chrome-192x192.png',
      badge: payload.badge || '/logos_and_pwas/favicon-32x32.png',
      image: payload.image || undefined,
      id: uniqueId,
      tag: payload.tag || `sawaflix-${uniqueId}`,
      data: {
        url: payload.url || '/dashboard',
        id: uniqueId,
        timestamp: Date.now(),
        ...(payload.data || {}),
      },
    };

    const payloadString = JSON.stringify(formattedPayload);

    let successCount = 0;
    let failureCount = 0;

    const deadEndpoints: string[] = [];

    // Send push to all subscribers in parallel with individual error catches
    await Promise.all(
      subscribers.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payloadString, {
            TTL: 86400, // 24 hours retention on push service
            urgency: 'high',
          });
          successCount++;
        } catch (error: any) {
          failureCount++;
          // If subscription is expired or uninstalled (404/410), collect endpoint for cleanup
          if (error.statusCode === 404 || error.statusCode === 410) {
            deadEndpoints.push(sub.endpoint);
          } else {
            console.warn(`[PushNotificationService] Push delivery failed for ${sub.endpoint}:`, error.message || error);
          }
        }
      })
    );

    // Clean up expired/invalid subscriptions from the database
    if (deadEndpoints.length > 0) {
      try {
        await prisma.pushSubscription.deleteMany({
          where: {
            endpoint: {
              in: deadEndpoints,
            },
          },
        });
        console.log(`[PushNotificationService] Cleaned up ${deadEndpoints.length} expired subscriptions.`);
      } catch (cleanupError) {
        console.warn('[PushNotificationService] Failed to clean dead endpoints:', cleanupError);
      }
    }

    console.log(`[PushNotificationService] Push delivery complete. Sent: ${successCount}, Failed: ${failureCount}`);
    return { successCount, failureCount };
  } catch (error) {
    console.error('[PushNotificationService] Global send error:', error);
    return { successCount: 0, failureCount: 0 };
  }
}
