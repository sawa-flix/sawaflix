import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get("Authorization");
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { notes } = await req.json().catch(() => ({}));

    // Validation: Admin must explain what info is missing
    if (!notes || notes.trim().length < 5) {
      return NextResponse.json({ 
        error: "Please provide details on what information the creator needs to update." 
      }, { status: 400 });
    }

    let adminId = "system";
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded: any = jwtDecode(authHeader.substring(7));
        adminId = decoded.sub;
      } catch (e) { /* fallback to system */ }
    }

    // 1. Update the submission status
    // Status 'info_requested' tells the frontend to let the creator edit their form again
    const { error: subError } = await supabase
      .from("verification_submissions")
      .update({ 
        status: 'info_requested', 
        admin_notes: notes,
        reviewed_at: new Date().toISOString() 
      })
      .eq("creator_id", id);

    if (subError) throw subError;

    // 2. Sync the status to the Users and Profiles table
    await supabase.from("users").update({ verification_status: 'info_requested' }).eq("id", id);
    await supabase.from("creator_profiles").update({ status: 'info_requested' }).eq("creator_id", id);

    // 3. Log the audit action
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      submission_id: id,
      action_type: 'info_requested',
      notes: notes
    });

    return NextResponse.json({ 
      message: "Status updated: Creator notified to provide more info.",
      status: "info_requested"
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Operation failed", details: err.message }, { status: 500 });
  }
}