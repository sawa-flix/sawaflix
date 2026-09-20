import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/services/notificationService';
import { prisma } from '@/lib/prisma/prisma';
import { Client } from '@upstash/qstash';

const qstash = new Client({ token: process.env.QSTASH_TOKEN || 'dummy_token' });

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    console.log('[Dev.to Webhook] Received webhook payload:', JSON.stringify(rawBody).slice(0, 300));

    // Handle various Dev.to webhook formats (article wrapper or direct article object)
    const article = rawBody.article || rawBody;
    
    // Extract metadata
    const title = article.title || rawBody.title || 'New Blog Post';
    const excerpt = article.description || article.summary || rawBody.description || 'Check out our latest blog post on SawaFlix!';
    const slug = article.slug || article.path?.replace(/^\/[^/]+\//, '') || article.id?.toString() || '';
    const devUrl = article.url || article.canonical_url || (slug ? `/dashboard/blogs/${slug}` : '/dashboard/blogs');
    const coverImage = article.cover_image || article.social_image || article.main_image || rawBody.cover_image || null;
    const authorName = article.user?.name || article.user?.username || rawBody.author?.name || 'Dev.to Community';
    const authorAvatar = article.user?.profile_image || article.user?.profile_image_90 || rawBody.author?.avatar || null;

    // 1. Broadcast in-app notification to all users in Supabase
    const notifiedCount = await notificationService.broadcastNotification({
      title: `New Post: ${title}`,
      message: excerpt,
      type: 'blog',
      contentType: 'blog',
      category: 'blog',
      contentId: slug || devUrl,
      thumbnail: coverImage,
      actorName: authorName,
      actorImage: authorAvatar,
    });

    console.log(`[Dev.to Webhook] In-app notification broadcasted to ${notifiedCount} users`);

    // 2. Also send push notification to Web Push subscribers (if configured)
    try {
      const subscribers = await prisma.pushSubscription.findMany();
      if (subscribers.length > 0 && process.env.QSTASH_TOKEN) {
        const payload = {
          title: `New Article: ${title}`,
          body: excerpt,
          url: slug ? `/dashboard/blogs/${slug}` : devUrl,
        };

        const host = req.headers.get('host') || 'www.sawaflix.com';
        const protocol = host.includes('localhost') ? 'http' : 'https';

        const publishPromises = subscribers.map((sub) => {
          return qstash.publishJSON({
            url: `${protocol}://${host}/api/notifications/send-worker`,
            body: { subscription: sub, payload },
            retries: 3,
          });
        });

        await Promise.allSettled(publishPromises);
      }
    } catch (pushErr) {
      console.warn('[Dev.to Webhook] Push notification queue warning:', pushErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Dev.to blog post notification delivered successfully',
      notifiedUsers: notifiedCount,
      title,
      slug,
    });
  } catch (error: any) {
    console.error('[Dev.to Webhook] Processing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process Dev.to webhook' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: 'Dev.to Webhook Listener',
    usage: 'Configure your Dev.to webhook to POST to this endpoint on article publish events.'
  });
}
