import { NextResponse } from 'next/server';

/**
 * POST /api/admin/verifications/[id]/approve
 * Authorization — Formally approves a creator, updates is_verified to true,
 * and triggers real-time status updates and emails.
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { notes } = body;

        // ─────────────────────────────────────────────────────────────────
        // TODO: Backend Proxy
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/verifications/${id}/approve`, {
        //      method: 'POST',
        //      headers: {
        //          'Content-Type': 'application/json',
        //          'Authorization': `Bearer ${adminJwt}`,
        //      },
        //      body: JSON.stringify({ notes }),
        //  });
        //  if (!res.ok) return NextResponse.json({ message: await res.text() }, { status: res.status });
        //  return NextResponse.json(await res.json());
        // ─────────────────────────────────────────────────────────────────

        return NextResponse.json(
            { message: `Backend not yet available. Approval for creator ${id} will be processed once the API is live.` },
            { status: 503 }
        );
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
