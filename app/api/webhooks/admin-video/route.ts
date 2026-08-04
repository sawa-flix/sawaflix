import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prisma';
import { Client } from '@upstash/qstash';

// Initialize the Upstash QStash client
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate the payload coming from the separate Admin Video Processing Worker
    // Ensure we have the minimum required fields
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Invalid payload missing title or slug" }, { status: 400 });
    }

    // 2. Fetch all subscribers from Neon PostgreSQL via Prisma
    const subscribers = await prisma.pushSubscription.findMany();
    
    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, message: "No subscribers to notify" });
    }

    // 3. Construct the push notification payload
    const payload = {
      title: `New ${body.category || 'Video'}: ${body.title}`,
      body: 'Watch the latest upload on Sawaflix!', 
      url: `/video/${body.slug}`, // Assuming videos are hosted at /video/[slug]
    };

    // 4. Add fan-out jobs to Upstash QStash
    const publishPromises = subscribers.map((sub) => {
      // Create absolute URL dynamically so it works on localhost and production
      const host = req.headers.get('host') || 'www.sawaflix.com';
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

    await Promise.all(publishPromises);

    return NextResponse.json({ success: true, queued: subscribers.length });
  } catch (error) {
    console.error("Admin video webhook error:", error);
    return NextResponse.json({ error: "Failed to queue notifications" }, { status: 500 });
  }
}
