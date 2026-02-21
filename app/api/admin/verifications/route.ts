import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('creator_verifications')
            .select('id, full_name, category, status, submitted_at, user_id')
            .in('status', ['pending', 'info_requested'])
            .order('submitted_at', { ascending: false });

        if (error) {
            console.error('Error fetching verifications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
