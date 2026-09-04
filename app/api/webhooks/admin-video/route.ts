import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prisma';
import { Client } from '@upstash/qstash';
import { notificationService } from '@/services/notificationService';

// Initialize the Upstash QStash client
const qstash = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate the payload coming from the separate Admin Video Processing Worker
    // Ensure we have the minimum required fields
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Invalid payload missing title or slug" }, { status: 400 });
    }

    // 2. Broadcast in-app notification to all registered users in Supabase
    try {
      const isReel = body.category === 'reel' || body.category === 'reels';
      await notificationService.broadcastNotification({
        title: `New ${isReel ? 'Reel' : (body.category || 'Video')}: ${body.title}`,
        message: 'Watch the latest upload on Sawaflix!',
        type: 'new_post',
        contentType: isReel ? 'reel' : 'video',
        category: body.category || 'video',
        contentId: body.slug,
        thumbnail: body.thumbnail_url || null,
        actorName: 'SawaFlix',
      });
      console.log(`[AdminVideoWebhook] In-app notification broadcasted for: ${body.title}`);
    } catch (notifErr: any) {
      console.warn("[AdminVideoWebhook] In-app notification broadcast warning:", notifErr?.message);
    }

    // 3. Fetch all subscribers from Neon PostgreSQL via Prisma for Web Push
    const subscribers = await prisma.pushSubscription.findMany().catch(() => []);
    
    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, message: "No subscribers to notify" });
    }

    // 3. Construct the rich push notification payload
    const isReel = body.category === 'reel' || body.category === 'reels';
    const targetUrl = isReel ? `/dashboard/reels?id=${body.slug}` : `/video/${body.slug}`;
    const categoryLabel = isReel ? 'Reel' : (body.category ? body.category.charAt(0).toUpperCase() + body.category.slice(1) : 'Video');

    const payload = {
      title: `New ${categoryLabel}: ${body.title}`,
      body: 'Watch the latest upload on Sawaflix!', 
      url: targetUrl,
      icon: '/logos_and_pwas/android-chrome-192x192.png',
      badge: '/logos_and_pwas/favicon-32x32.png',
      image: body.thumbnail_url || undefined,
      tag: `sawaflix-video-${body.slug}`,
    };

    // 4. Send Web Push immediately to all subscribers (direct delivery guarantees receipt when closed)
    try {
      const { sendWebPushToSubscribers } = await import('@/services/pushNotificationService');
      sendWebPushToSubscribers(payload).catch((pErr) => console.warn('[AdminVideoWebhook] Direct push send warning:', pErr));
    } catch (e: any) {
      console.warn('[AdminVideoWebhook] Could not trigger direct sendWebPushToSubscribers:', e?.message);
    }

    // 5. Add fan-out jobs to Upstash QStash (if configured)
    if (qstash && subscribers.length > 0) {
      const publishPromises = subscribers.map((sub) => {
        // Create absolute URL dynamically so it works on localhost and production
        const host = req.headers.get('host') || 'sawaflix.com';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        
        // QStash rejects 'localhost' URLs. If testing locally, route the webhooks to the live server 
        // so you can still see the jobs successfully queued in your Upstash dashboard.
        const destinationHost = host.includes('localhost') ? 'sawaflix.com' : host;
        const destinationProtocol = host.includes('localhost') ? 'https' : protocol;
        const destinationUrl = `${destinationProtocol}://${destinationHost}/api/notifications/send-worker`;

        return qstash.publishJSON({
          url: destinationUrl,
          body: { subscription: sub, payload },
          retries: 3, // Automatically retry if the push delivery fails
        });
      });

      await Promise.all(publishPromises).catch((qErr) => console.warn('[AdminVideoWebhook] QStash enqueue warning:', qErr));
    }

    return NextResponse.json({ success: true, queued: subscribers.length, inAppNotified: true });
  } catch (error) {
    console.error("Admin video webhook error:", error);
    return NextResponse.json({ error: "Failed to queue notifications" }, { status: 500 });
  }
}
