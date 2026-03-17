import { NextResponse } from "next/server";
// Use your Admin client (Service Role) to ensure you have permission to update users
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin"; 
import { queueEmail } from "@/lib/emailQueue";

export async function POST(
  req: Request,
  { params }: { params: { creatorId: string } }
) {
  const creatorId = params.creatorId;
  const { reason } = await req.json();

  if (!reason || reason.length < 5) {
    return NextResponse.json(
      { error: "A detailed rejection reason is required" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  try {
    // 1. Update the submission and set the cooldown timestamp
    const { error: subError } = await supabaseAdmin
      .from("verification_submissions")
      .update({
        status: "rejected",
        rejection_reason: reason, // Ensure this matches your DB column name
        rejected_at: now,         // CRITICAL for the 3-day cooldown logic
      })
      .eq("creator_id", creatorId);

    if (subError) throw subError;

    // 2. Fetch the user's email
    const { data: user, error: userFetchError } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("id", creatorId)
      .single();

    if (userFetchError || !user) throw new Error("User not found");

    // 3. RESET ROLE: Sprint Requirement (Rejected = Viewer)
    const { error: roleError } = await supabaseAdmin
      .from("users")
      .update({
        role: "viewer",
        verification_status: "rejected",
        is_verified: false
      })
      .eq("id", creatorId);

    if (roleError) throw roleError;

    // 4. Queue the Rejection Email (Redis + SendGrid)
    await queueEmail({
      type: "rejection",
      email: user.email,
      reason: reason,
    });

    // 5. Audit Log: Sprint Requirement (Recording the action)
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: "boyema_admin", // You can replace this with actual admin ID from auth
      creator_id: creatorId,
      action: "rejected",
      reason: reason,
      created_at: now
    });

    return NextResponse.json({ 
      success: true, 
      message: "Creator rejected and role reset to viewer" 
    });

  } catch (error: any) {
    console.error("Rejection Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}