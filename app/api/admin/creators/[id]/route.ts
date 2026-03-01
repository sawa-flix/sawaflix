import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Sprint 2: Maps a raw Supabase row into the nested shape requested by spec
function transformRow(row: Record<string, unknown>) {
    return {
        id: row.creator_id,
        full_name: row.full_name || (row.form_data as any)?.full_name || 'Unknown',
        verification_submissions: {
            form_data: (row.form_data as Record<string, unknown>) ?? {}
        }
    };
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // ─────────────────────────────────────────────────────────────────
        // TODO: Backend Proxy for GET /api/admin/creators/[id]
        //
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/creators/${id}`, {
        //      method: 'GET',
        //      headers: { 'Authorization': `Bearer ${adminJwt}` },
        //  });
        //  if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: res.status });
        //  return NextResponse.json(await res.json());
        // ─────────────────────────────────────────────────────────────────

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('verification_submissions')
            .select('*')
            .eq('creator_id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        return NextResponse.json({ data: transformRow(data) });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
