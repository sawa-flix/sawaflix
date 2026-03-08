import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/verifications/[id]
 * Detail Review — Fetches the full submission data for a specific creator ID,
 * including the JSONB form details and storage URLs for documents.
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // ─────────────────────────────────────────────────────────────────
        // TODO: Backend Proxy
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/verifications/${id}`, {
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
            return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
        }

        // Return the full row including form_data JSONB and storage URLs
        const fd = (data.form_data as Record<string, unknown>) ?? {};

        return NextResponse.json({
            data: {
                id: data.creator_id,
                category: data.category,
                status: data.status,
                created_at: data.created_at,
                form_data: fd,
                documents: {
                    id_url: fd.id_url ?? null,
                    selfie_url: fd.selfie_url ?? null,
                    endorsement_url: fd.endorsement_url ?? null,
                    verification_video_url: fd.verification_video_url ?? null,
                    distributor_proof_url: fd.distributor_proof_url ?? null,
                    production_proof_url: fd.production_proof_url ?? null,
                    food_license_url: fd.food_license_url ?? null,
                },
            },
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
