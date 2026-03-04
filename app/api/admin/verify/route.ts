import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function PUT(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { userId, status, feedback } = body;

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
        }
        if (!status) {
            return NextResponse.json({ message: 'Status is required.' }, { status: 400 });
        }



        // ─────────────────────────────────────────────────────────────────
        // TODO: When Wohking's backend is live, add BACKEND_API_URL to
        //       .env.local and uncomment the fetch below:
        //
        //  const res = await fetch(`${BACKEND_API_URL}/api/admin/verify`, {
        //      method: 'PUT',
        //      headers: { 'Content-Type': 'application/json' },
        //      body: JSON.stringify({ userId, status, notes: feedback }),
        //  });
        //  if (!res.ok) return NextResponse.json({ message: await res.text() }, { status: res.status });
        //  return NextResponse.json({ message: `Creator ${status} successfully.` });
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
