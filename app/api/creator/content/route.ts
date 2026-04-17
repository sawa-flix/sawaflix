import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// 1. Define exactly what a combined content item looks like
interface ContentItem {
    id: string;
    title?: string;
    type: 'food' | 'story' | 'music';
    submission_date?: string; // Used by food & stories
    updated_at?: string;      // Used by music
    description?: string;
    dish_name?: string;
    languages?: string;
    tags?: string;
}

export async function GET() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const [foodRes, storiesRes, musicRes] = await Promise.all([
            supabase
                .from('food')
                .select('id, submission_date, description, dish_name')
                .eq('user_id', user.id),
            supabase
                .from('stories')
                .select('id, title, submission_date, languages')
                .eq('user_id', user.id),
            supabase
                .from('music')
                .select('id, title, updated_at, description, tags')
                .eq('artist_id', user.id)
        ])

        if (foodRes.error) {
            return NextResponse.json({ table: 'food', error: foodRes.error.message, code: foodRes.error.code }, { status: 400 });
        }
        if (storiesRes.error) {
            return NextResponse.json({ table: 'stories', error: storiesRes.error.message, code: storiesRes.error.code }, { status: 400 });
        }
        if (musicRes.error) {
            return NextResponse.json({ table: 'music', error: musicRes.error.message, code: musicRes.error.code }, { status: 400 });
        }

        // 2. Explicitly type the unified array as ContentItem[]
        // Using 'as const' tells TS that the string is a literal type, not just any string
        const unifiedContent: ContentItem[] = [
            ...(foodRes.data?.map(item => ({ ...item, type: 'food' as const })) || []),
            ...(storiesRes.data?.map(item => ({ ...item, type: 'story' as const })) || []),
            ...(musicRes.data?.map(item => ({ ...item, type: 'music' as const })) || [])
        ]

        // 3. Types are now automatically inferred for 'a' and 'b' (No 'any' needed)
        const sortedContent = unifiedContent.sort((a, b) => {
            const dateA = new Date(a.submission_date || a.updated_at || 0).getTime();
            const dateB = new Date(b.submission_date || b.updated_at || 0).getTime();
            return dateB - dateA;
        });

        return NextResponse.json(sortedContent)

        // 4. Use 'unknown' instead of 'any' for errors
    } catch (error: unknown) {
        console.error('CRITICAL API FAILURE:', error);

        // 5. Safely extract the error message from the unknown type
        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
                ? String((error as Record<string, unknown>).message)
                : 'Unexpected error occurred';

        return NextResponse.json({
            error: errorMessage,
            raw: error
        }, { status: 500 })
    }
}