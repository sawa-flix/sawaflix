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

  // Extract ID from the URL [id]
  const target_creator_id = params.id;

  try {
    const body = await req.json().catch(() => ({}));
    const { notes } = body;

    // Requirement: Rejection MUST have a reason
    if (!notes || notes.trim().length < 5) {
      return NextResponse.json({ 
        error: "Constructive feedback (notes) is mandatory for rejection." 
      }, { status: 400 });
    }

    let adminId = "system";
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded: any = jwtDecode(authHeader.substring(7));
        adminId = decoded.sub;
      } catch (e) {
        // Fallback to system if decode fails
      }
    }

    // 1. Update Verification Submission
    const { error: subError } = await supabase
      .from("verification_submissions")
      .update({ 
        status: 'rejected', 
        admin_notes: notes,
        reviewed_at: new Date().toISOString() 
      })
      .eq("creator_id", target_creator_id);
    if (subError) throw subError;

    // 2. Update Creator Profile (Sync status)
    const { error: profileError } = await supabase
      .from("creator_profiles")
      .update({ 
        status: 'rejected',
        is_verified: false 
      })
      .eq("creator_id", target_creator_id);
    if (profileError) throw profileError;

    // 3. Update Users Master Table
    const { error: userError } = await supabase
      .from("users")
      .update({ 
        verification_status: 'rejected',
        is_verified: false 
      })
      .eq("id", target_creator_id);
    if (userError) throw userError;

    // 4. Log to Audit Table
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      submission_id: target_creator_id,
      action_type: 'rejected',
      notes: notes
    });

    return NextResponse.json({ 
      message: `REJECTED: Feedback logged for creator ${target_creator_id}`,
      status: "rejected"
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: "Rejection process failed", 
      details: err.message 
    }, { status: 500 });
  }
}