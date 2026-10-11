import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/apiConfig';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId parameter' }, { status: 400 });
  }

  const backendProxyUrl = `${BACKEND_URL}/api/videos/proxy?videoId=${encodeURIComponent(videoId)}`;

  try {
    const rangeHeader = request.headers.get('range');
    const headers: Record<string, string> = {
      Accept: '*/*',
    };
    if (rangeHeader) {
      headers.Range = rangeHeader;
    }

    const backendResponse = await fetch(backendProxyUrl, {
      headers,
    });

    if (!backendResponse.ok && backendResponse.status !== 206) {
      return NextResponse.json(
        { error: `Backend proxy returned ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    const responseHeaders = new Headers();
    const forwardHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'content-disposition',
    ];

    forwardHeaders.forEach((h) => {
      const val = backendResponse.headers.get(h);
      if (val) responseHeaders.set(h, val);
    });

    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'video/mp4');
    }
    if (!responseHeaders.has('accept-ranges')) {
      responseHeaders.set('accept-ranges', 'bytes');
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`[API /api/videos/proxy] Error proxying video ${videoId}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy video stream', details: error?.message },
      { status: 502 }
    );
  }
}
