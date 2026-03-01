import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // ─────────────────────────────────────────────────────────────────
        // TODO: Backend Proxy for GET /api/admin/verification
        //
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/verification`, {
        //      method: 'GET',
        //      headers: { 'Authorization': `Bearer ${adminJwt}` },
        //  });
        //  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });
        //  return NextResponse.json(await res.json());
        // ─────────────────────────────────────────────────────────────────

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('verification_submissions')
            .select('creator_id, category, status, created_at, form_data')
            .in('status', ['pending', 'info_requested'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching verification queue:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
