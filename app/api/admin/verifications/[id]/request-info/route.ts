import { NextResponse } from 'next/server';

/**
 * POST /api/admin/verifications/[id]/request-info
 * Clarification — Notifies the creator that additional materials are needed
 * without fully rejecting the application.
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
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/verifications/${id}/request-info`, {
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
            { message: `Backend not yet available. Info request for creator ${id} will be sent once the API is live.` },
            { status: 503 }
        );
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
