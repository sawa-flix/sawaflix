import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const notes: string = body.feedback ?? '';

        if (!notes.trim()) {
            return NextResponse.json(
                { message: 'A message explaining what information is needed is required.' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const updatePayload: Record<string, unknown> = {
            status: 'info_requested',
            reviewed_at: new Date().toISOString(),
            admin_notes: notes,
        };

        const { error } = await supabase
            .from('verification_submissions')
            .update(updatePayload)
            .eq('creator_id', id);

        if (error) {
            if (error.message?.includes('column')) {
                const { error: retryError } = await supabase
                    .from('verification_submissions')
                    .update({ status: 'info_requested' })
                    .eq('creator_id', id);
                if (retryError) {
                    console.error('Request-info retry error:', retryError);
                    return NextResponse.json({ message: retryError.message }, { status: 500 });
                }
            } else {
                console.error('Request info error:', error);
                return NextResponse.json({ message: error.message }, { status: 500 });
            }
        }

        return NextResponse.json({ message: 'Information request sent to creator.' });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
