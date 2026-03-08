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

        return NextResponse.json(
            { message: 'Backend not yet available. Please try again once Wohking\'s API is live.' },
            { status: 503 }
        );
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
