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

        const supabase = await createClient();

        // Build the update payload — status is always set.
        // reviewed_at and admin_notes are written if the columns exist;
        // Supabase will simply ignore unknown columns on older schemas.
        const updatePayload: Record<string, unknown> = {
            status: 'approved',
        };
        // Attempt to include audit fields if available in the schema
        try {
            updatePayload.reviewed_at = new Date().toISOString();
            if (notes) updatePayload.admin_notes = notes;
        } catch { /* no-op */ }

        const { error } = await supabase
            .from('verification_submissions')
            .update(updatePayload)
            .eq('creator_id', id);

        if (error) {
            // If the error is about unknown columns, retry with status only
            if (error.message?.includes('column')) {
                const { error: retryError } = await supabase
                    .from('verification_submissions')
                    .update({ status: 'approved' })
                    .eq('creator_id', id);
                if (retryError) {
                    console.error('Approve retry error:', retryError);
                    return NextResponse.json({ message: retryError.message }, { status: 500 });
                }
            } else {
                console.error('Approve error:', error);
                return NextResponse.json({ message: error.message }, { status: 500 });
            }
        }

        return NextResponse.json({ message: 'Creator approved successfully.' });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
