import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function GET() {
    try {
        // ─────────────────────────────────────────────────────────────────
        // TODO: When Wohking's backend is live, uncomment this block
        //       and remove the Supabase fallback below.
        //
        //  const res = await fetch(`${BACKEND_API_URL}/api/admin/creators`, {
        //      method: 'GET',
        //      headers: { 'Authorization': `Bearer ${adminJwt}` },
        //      cache: 'no-store',
        //  });
        //  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });
        //  const json = await res.json();
        //  return NextResponse.json({ data: json.data ?? json });
        // ─────────────────────────────────────────────────────────────────

        // Temporary: read from Supabase (anon key read is allowed by RLS)
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

        let mappedData = (data || []).map((row) => {
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
