import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/feed/public
 *
 * Publicly accessible feed endpoint. Returns the latest published videos
 * from Supabase with Stale-While-Revalidate edge caching headers so the
 * Vercel CDN serves 9,999 of every 10,000 requests straight from the edge
 * without touching the database.
 *
 * Cache strategy:
 *   s-maxage=60               — CDN serves the cached response for 60s
 *   stale-while-revalidate=300 — After 60s, serve stale immediately while
 *                                the CDN silently refreshes in the background
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);

    const supabase = await createClient();

    const { data: videos, error } = await supabase
      .from('contents')
      .select(
        'id, title, description, category, video_url, cover_url, visibility, view_count, created_at'
      )
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[PublicFeed] Supabase error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch public feed' },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      { success: true, data: videos ?? [] },
      { status: 200 }
    );

    // Edge caching: first request hits DB, next 60s served from CDN edge nodes,
    // then revalidate silently in background for up to 5 minutes.
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return response;
  } catch (err: any) {
    console.error('[PublicFeed] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
