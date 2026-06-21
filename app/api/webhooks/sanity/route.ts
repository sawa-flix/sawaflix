import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prisma';
import { Client } from '@upstash/qstash';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Notice we use "story" because that is the name defined in sanity/schemas/story.ts
    if (body._type !== 'story') {
      return NextResponse.json({ ignored: true });
    }

    // 1. Fetch all subscribers from Neon
    const subscribers = await prisma.pushSubscription.findMany();
    
    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, message: "No subscribers" });
    }

    // Construct the payload using actual Sanity schema fields
    const payload = {
      title: `New Story: ${body.title}`,
      body: body.excerpt || 'Read the latest story on Sawaflix!', 
      url: `/story/${body.slug?.current || ''}`
    };

    // 2. Add jobs to Upstash QStash
    const publishPromises = subscribers.map((sub) => {
      // Create absolute URL dynamically or use env variable
      const host = req.headers.get('host') || 'www.sawaflix.com';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      
      return qstash.publishJSON({
        url: `${protocol}://${host}/api/notifications/send-worker`,
        body: { subscription: sub, payload },
        retries: 3,
      });
    });

    await Promise.all(publishPromises);

    return NextResponse.json({ success: true, queued: subscribers.length });
  } catch (error) {
    console.error("Sanity webhook error:", error);
    return NextResponse.json({ error: "Failed to queue notifications" }, { status: 500 });
  }
}
