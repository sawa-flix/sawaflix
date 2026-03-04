<<<<<<< HEAD
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
=======
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    console.log("🚀 PUT /verify - Reviewing Creator Application");
    
    try {
        const body = await req.json();
        const { target_creator_id, status, notes } = body;

        if (!target_creator_id || !status) {
            return NextResponse.json({ error: "target_creator_id and status are required" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Update the status in verification_submissions
        const { data, error: subError } = await supabase
            .from("verification_submissions")
            .update({
                status,
                rejection_feedback: status === "rejected" ? notes : null,
                admin_notes: notes || `Admin updated status to ${status}`,
                reviewed_at: new Date().toISOString()
            })
            .eq("creator_id", target_creator_id)
            .select();

        if (subError) {
            console.error("❌ Submission Update Error:", subError.message);
            return NextResponse.json({ error: subError.message }, { status: 500 });
        }

        // 2. Optional: update user profile if approved
        if (status === "approved") {
            const { error: profileError } = await supabase
                .from("users") // Or profiles based on your schema
                .update({ is_verified: true })
                .eq("id", target_creator_id);
            
            if (profileError) {
                console.warn("⚠️ Profile Verification Switch failed:", profileError.message);
                // We don't fail the whole request as the submission is already updated
            }
        }

        return NextResponse.json({ 
            message: `SUCCESS: Creator is now ${status}`, 
            status,
            data 
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
>>>>>>> 82d1c9168819be76a06979fc555fa3d2d3adeb9b
    }
}
