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
    }
}
