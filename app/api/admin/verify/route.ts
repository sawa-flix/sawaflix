import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { z } from "zod";

const VerifySchema = z.object({
  target_creator_id: z.string().uuid(),
  status: z.enum(['approved', 'rejected', 'pending', 'info_requested']), 
  notes: z.string().min(1, "Please provide a reason or instructions for the creator"),
});

export async function PUT(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let adminId = "system";
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded: any = jwtDecode(authHeader.substring(7));
        adminId = decoded.sub;
      } catch (e) {
        // Silent catch as requested (no console.log)
      }
    }

    const body = await req.json();
    const result = VerifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { target_creator_id, status, notes } = result.data;
    const isApproved = status === 'approved';

    // A. Update Creator Profile
    const { error: profileError } = await supabase
      .from('creator_profiles')
      .update({ status, is_verified: isApproved })
      .eq('creator_id', target_creator_id);
    if (profileError) throw profileError;

    // B. Update Verification Submission
    const { error: subError } = await supabase
      .from('verification_submissions')
      .update({ 
        status,
        admin_notes: notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('creator_id', target_creator_id);
    if (subError) throw subError;

    // C. Update Users Table
    const { error: userTableError } = await supabase
      .from('users')
      .update({ 
        is_verified: isApproved,
        verification_status: status 
      })
      .eq('id', target_creator_id);
    if (userTableError) throw userTableError;

    // 4. Update Admin Action (Upsert logic to prevent duplicates)
    const { error: auditError } = await supabase
      .from("admin_actions")
      .upsert(
        {
          admin_id: adminId,
          submission_id: target_creator_id, 
          action_type: status,
          notes: notes || `Admin action: ${status}`
        }, 
        { onConflict: 'submission_id' } // Tells Supabase to update if submission_id exists
      );

    if (auditError) throw new Error(`Audit log failed: ${auditError.message}`);

    return NextResponse.json({ 
      message: `Success: Status synced to '${status}'`,
      new_status: status
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: "Failed to sync status across tables", 
      details: err.message 
    }, { status: 500 });
  }
}