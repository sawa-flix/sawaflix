import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function POST(
  req: Request, 
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // The ID comes from the URL [id]
  const target_creator_id = params.id;

  try {
    const body = await req.json().catch(() => ({}));
    const notes = body.notes || "Approved by Admin";

    let adminId = "system";
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded: any = jwtDecode(authHeader.substring(7));
        adminId = decoded.sub;
      } catch (e) {
        // Silent catch for invalid tokens
      }
    }

    // 1. Update Verification Submission
    const { error: subError } = await supabase
      .from("verification_submissions")
      .update({ 
        status: 'approved', 
        admin_notes: notes,
        reviewed_at: new Date().toISOString() 
      })
      .eq("creator_id", target_creator_id);
    if (subError) throw subError;

    // 2. Update Creator Profile (Sprint 2 Requirement)
    const { error: profileError } = await supabase
      .from("creator_profiles")
      .update({ 
        status: 'approved',
        is_verified: true 
      })
      .eq("creator_id", target_creator_id);
    if (profileError) throw profileError;

    // 3. Update Users Master Table
    const { error: userError } = await supabase
      .from("users")
      .update({ 
        is_verified: true,
        verification_status: 'approved' 
      })
      .eq("id", target_creator_id);
    if (userError) throw userError;

    // 4. Log the Audit Action
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      submission_id: target_creator_id,
      action_type: 'approved',
      notes: notes
    });

    return NextResponse.json({ 
      message: `SUCCESS: Creator ${target_creator_id} Approved`,
      status: "approved"
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: "Approval process failed", 
      details: err.message 
    }, { status: 500 });
  }
}