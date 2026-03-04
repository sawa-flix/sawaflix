import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/metrics
 * Performance Dashboard — Returns aggregate counts of total creators,
 * pending applications, and approved users categorized by role.
 */
export async function GET() {
    try {
        // ─────────────────────────────────────────────────────────────────
        // TODO: Backend Proxy
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/metrics`, {
        //      method: 'GET',
        //      headers: { 'Authorization': `Bearer ${adminJwt}` },
        //  });
        //  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: res.status });
        //  return NextResponse.json(await res.json());
        // ─────────────────────────────────────────────────────────────────

        const supabase = await createClient();

        // Total creators
        const { count: totalCreators, error: totalErr } = await supabase
            .from('verification_submissions')
            .select('*', { count: 'exact', head: true });

        // Pending applications
        const { count: pendingCount, error: pendingErr } = await supabase
            .from('verification_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Approved users
        const { count: approvedCount, error: approvedErr } = await supabase
            .from('verification_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');

        // Rejected
        const { count: rejectedCount, error: rejectedErr } = await supabase
            .from('verification_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'rejected');

        // Info requested
        const { count: infoRequestedCount, error: infoErr } = await supabase
            .from('verification_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'info_requested');

        if (totalErr || pendingErr || approvedErr || rejectedErr || infoErr) {
            console.error('Error fetching metrics:', { totalErr, pendingErr, approvedErr, rejectedErr, infoErr });
            return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
        }

        // Approved by category
        const { data: categoryData, error: catErr } = await supabase
            .from('verification_submissions')
            .select('category')
            .eq('status', 'approved');

        const byRole: Record<string, number> = {};
        if (!catErr && categoryData) {
            for (const row of categoryData) {
                const cat = (row.category as string) || 'uncategorized';
                byRole[cat] = (byRole[cat] || 0) + 1;
            }
        }

        return NextResponse.json({
            total_creators: totalCreators ?? 0,
            pending: pendingCount ?? 0,
            approved: approvedCount ?? 0,
            rejected: rejectedCount ?? 0,
            info_requested: infoRequestedCount ?? 0,
            approved_by_role: byRole,
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
