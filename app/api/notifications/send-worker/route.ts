import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { prisma } from '@/lib/prisma/prisma';

// Configure Web Push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@sawaflix.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys are not set in environment variables. Web push notifications will not work.");
}

async function handler(req: Request) {
  try {
    const { subscription, payload } = await req.json();

    if (!subscription || !payload) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Format subscription for web-push library
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );
      console.log(`Notification sent to ${subscription.endpoint}`);
    } catch (pushError: any) {
      // If the subscription is no longer valid (e.g., user revoked permission)
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        console.log(`Subscription expired/unsubscribed. Deleting ${subscription.endpoint}`);
        await prisma.pushSubscription.delete({
          where: { endpoint: subscription.endpoint }
        });
        // We return 200 OK so QStash doesn't keep retrying a dead endpoint
        return NextResponse.json({ success: true, deleted: true });
      } else {
        throw pushError; // Let QStash retry on 500
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Worker failed:", error);
    // Return 500 to trigger QStash Exponential Backoff / Retries
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

// Wrap with verifySignatureAppRouter to protect endpoint from unauthorized access
export const POST = verifySignatureAppRouter(handler, {
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "dummy_current_key",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "dummy_next_key",
});
