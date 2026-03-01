import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { target_creator_id, notes } = body;

        if (!target_creator_id) {
            return NextResponse.json({ message: 'target_creator_id is required.' }, { status: 400 });
        }

        // ─────────────────────────────────────────────────────────────────
        // TODO: Backend Proxy for POST /api/admin/verification/requested-info
        //
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/verification/requested-info`, {
        //      method: 'POST',
        //      headers: { 'Content-Type': 'application/json' },
        //      body: JSON.stringify({ target_creator_id, notes }),
        //  });
        //  if (!res.ok) return NextResponse.json({ message: await res.text() }, { status: res.status });
        //  return NextResponse.json({ message: 'Requested info successfully.' });
        // ─────────────────────────────────────────────────────────────────

        return NextResponse.json(
            { message: 'Backend not yet available. Please try again once Wohking\'s API is live.' },
            { status: 503 }
        );
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
