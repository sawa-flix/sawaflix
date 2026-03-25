import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { z } from "zod";

const VerifySchema = z.object({
  target_creator_id: z.string().uuid(),
  status: z.enum(['approved', 'rejected', 'info_requested']),
  notes: z.string().min(1, "Please provide admin notes")
});

export async function PUT(req: Request) {
  const authHeader = req.headers.get("Authorization");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Essential for Admin overrides
  );

  try {
    // 1. Determine which Admin is performing the action
    let adminId = "system_admin";
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwtDecode<{ sub?: string; [key: string]: string | number | boolean }>(token);
        adminId = decoded.sub || "service_role";
      } catch (e) {
        adminId = "token_auth"; 
      }
    }

    const body = await req.json();
    const result = VerifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { target_creator_id, status, notes } = result.data;
    const isApproved = status === "approved";

    // 2. Check if the submission exists first
    const { data: submission, error: fetchError } = await supabase
      .from("verification_submissions")
      .select("id")
      .eq("creator_id", target_creator_id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // 3. Update creator_profiles
    const { error: profileError } = await supabase
      .from("creator_profiles")
      .update({
        is_verified: isApproved
      })
      .eq("creator_id", target_creator_id);

    if (profileError) throw profileError;

    // 4. Update verification_submissions
    const { error: subError } = await supabase
      .from("verification_submissions")
      .update({
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq("creator_id", target_creator_id);

    if (subError) throw subError;

    // 5. Update global users table
    const { error: userError } = await supabase
      .from("users")
      .update({
        verification_status: status,
        is_verified: isApproved
      })
      .eq("id", target_creator_id);

    if (userError) console.error("Global users table update failed:", userError.message);

    // 6. Audit Log (Recording Boyema's action)
    // Wrap in a try/catch so if the audit table doesn't exist yet, it doesn't break the verification
    try {
      await supabase.from("admin_actions").insert({
        admin_id: adminId,
        submission_id: submission.id,
        action_type: status,
        notes: notes
      });
    } catch (auditErr) {
      console.warn("Audit logging skipped - Check if admin_actions table exists.");
    }

    return NextResponse.json({
      success: true,
      message: `Creator status updated to ${status}`,
      status
    });

  } catch (err: unknown) {
    console.error("Master Verify Endpoint Error:", (err instanceof Error ? err.message : "Unknown error"));
    return NextResponse.json(
      { error: "Verification processing failed", details: (err instanceof Error ? err.message : "Unknown error") },
      { status: 500 }
    );
  }
}
