import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('verification_submissions')
            .select('creator_id, category, status, created_at, form_data')
            .in('status', ['pending', 'info_requested'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching verifications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const mappedData = (data || []).map((row) => {
            const fd = (row.form_data as Record<string, unknown>) ?? {};
            return {
                id: row.creator_id,
                full_name: fd.full_name ?? 'Unknown Creator',
                category: row.category,
                status: row.status,
                submitted_at: row.created_at,
                avatar_url: fd.avatar_url ?? '',
            };
        });

        return NextResponse.json({ data: mappedData });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
