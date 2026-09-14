import { NextResponse } from 'next/server';
import { getStories, getCategories } from '@/lib/sanity/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [stories, categories] = await Promise.all([
      getStories(),
      getCategories(),
    ]);

    return NextResponse.json({
      stories: stories || [],
      categories: categories || [],
    });
  } catch (error: any) {
    console.error('[API /api/stories] Fetch error:', error);
    return NextResponse.json(
      { stories: [], categories: [], error: error?.message || 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
