import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { target_creator_id, action, notes } = body;

        if (!target_creator_id) {
            return NextResponse.json({ message: 'target_creator_id is required.' }, { status: 400 });
        }
        if (!action) {
            return NextResponse.json({ message: 'Action is required (approved | rejected | info_requested).' }, { status: 400 });
        }

        // ─────────────────────────────────────────────────────────────────
        // TODO: Backend Proxy for POST /api/admin/verification/review
        //
        //  const res = await fetch(`${process.env.BACKEND_API_URL}/api/admin/verification/review`, {
        //      method: 'POST',
        //      headers: { 'Content-Type': 'application/json' },
        //      body: JSON.stringify({ target_creator_id, action, notes }),
        //  });
        //  if (!res.ok) return NextResponse.json({ message: await res.text() }, { status: res.status });
        //  return NextResponse.json({ message: `Review action ${action} performed successfully.` });
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
