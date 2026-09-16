import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prisma';
import { Client } from '@upstash/qstash';
import { notificationService } from '@/services/notificationService';
import { urlFor } from '@/lib/sanity/client';

const qstash = new Client({ token: process.env.QSTASH_TOKEN || 'dummy_token' });

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    console.log("Received Sanity webhook payload:", JSON.stringify(rawBody).slice(0, 300));
    
    // Normalize document from different Sanity webhook payload formats
    const doc = rawBody.result || rawBody.document || rawBody.data || rawBody;
    
    // Accept story, post, blog, or any document with a title
    const docType = doc._type?.toLowerCase() || '';
    if (docType && !['story', 'post', 'blog', 'article', 'news'].includes(docType) && !doc.title) {
      return NextResponse.json({ ignored: true, reason: `Type '${docType}' is not a story` });
    }

    const title = doc.title || doc.name || doc.headline || 'New Story Published';
    const excerpt = doc.excerpt || doc.description || doc.summary || 'Read the latest story on Sawaflix!';
    const storySlug = doc.slug?.current || doc.slug || doc._id || '';
    
    let thumbnail: string | undefined = undefined;
    if (doc.mainImage) {
      try {
        thumbnail = urlFor(doc.mainImage).url();
      } catch {
        thumbnail = typeof doc.mainImage === 'string' ? doc.mainImage : undefined;
      }
    }

    // 1. Broadcast in-app notification to all users in Supabase
    try {
      const broadcastCount = await notificationService.broadcastNotification({
        title: `New Story: ${title}`,
        message: excerpt,
        type: 'story',
        contentType: 'story',
        category: 'story',
        contentId: storySlug,
        thumbnail: thumbnail,
        actorName: doc.author?.name || 'SawaFlix Editorial',
      });
      console.log(`Sanity in-app broadcast sent to ${broadcastCount} users`);
    } catch (notifErr) {
      console.warn("Failed to broadcast in-app notification for Sanity story:", notifErr);
    }

    // 2. Fetch all subscribers from Neon for Web Push
    try {
      const subscribers = await prisma.pushSubscription.findMany();
      
      if (subscribers && subscribers.length > 0) {
        const payload = {
          title: `New Story: ${title}`,
          body: excerpt, 
          url: `/dashboard/blogs/${storySlug}`,
          icon: thumbnail || '/logos_and_pwas/android-chrome-192x192.png'
        };

        const host = req.headers.get('host') || 'www.sawaflix.com';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        
        const publishPromises = subscribers.map((sub) => {
          return qstash.publishJSON({
            url: `${protocol}://${host}/api/notifications/send-worker`,
            body: { subscription: sub, payload },
            retries: 3,
          }).catch(err => console.warn("QStash push error:", err));
        });

        await Promise.all(publishPromises);
      }
    } catch (pushErr) {
      console.warn("Push subscription dispatch skipped:", pushErr);
    }

    return NextResponse.json({ success: true, title, slug: storySlug });
  } catch (error: any) {
    console.error("Sanity webhook error:", error);
    return NextResponse.json({ error: error.message || "Failed to process Sanity webhook" }, { status: 500 });
  }
}
