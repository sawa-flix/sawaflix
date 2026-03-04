import { NextResponse } from 'next/server';

/**
 * POST /api/admin/verifications/[id]/reject
 * Denial — Rejects an application with mandatory constructive feedback
 * and notifies the creator to resubmit.
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { notes } = body;

        if (!notes || notes.trim().length === 0) {
            return NextResponse.json(
                { message: 'Constructive feedback is mandatory when rejecting an application.' },
                { status: 400 }
            );
        }

        // ─────────────────────────────────────────────────────────────────
        // TODO: Backend Proxy
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/verifications/${id}/reject`, {
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
            { message: `Backend not yet available. Rejection for creator ${id} will be processed once the API is live.` },
            { status: 503 }
        );
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
