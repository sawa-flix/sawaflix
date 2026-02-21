import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer Token" }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const decoded: any = jwtDecode(token);
  const adminId = decoded.sub;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { target_creator_id, action, notes } = await req.json();

    // 1. VALIDATION: Rejections and Info Requests MUST have feedback [cite: 191, 194]
    if ((action === "rejected" || action === "info_requested") && !notes) {
      return NextResponse.json({ error: `Feedback is required for action: ${action}` }, { status: 400 });
    }

    // 2. DETERMINE NEW STATUS
    // If requesting info, status stays 'pending' but we add a flag or note [cite: 194]
    let newStatus = action;
    if (action === "info_requested") {
      newStatus = "pending"; 
    }

    // 3. UPDATE THE SUBMISSION [cite: 45, 192, 194]
    const { error: updateError } = await supabase
      .from("verification_submissions")
      .update({ 
        status: newStatus, 
        admin_notes: notes,
        reviewed_at: new Date().toISOString()
      })
      .eq("creator_id", target_creator_id);

    if (updateError) throw updateError;

    // 4. AUDIT LOG 
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      submission_id: target_creator_id,
      action_type: action,
      notes: notes
    });

    // 5. PROFILE UPDATE: Only for 'approved' [cite: 190]
    if (action === "approved") {
      await supabase
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", target_creator_id);
    }

    return NextResponse.json({ 
      message: action === "info_requested" 
        ? "Information requested from creator. Application remains in queue." 
        : `Creator successfully ${action}` 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}