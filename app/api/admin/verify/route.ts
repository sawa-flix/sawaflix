import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { z } from "zod";

const VerifySchema = z.object({
  target_creator_id: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
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
      const decoded: any = jwtDecode(authHeader.substring(7));
      adminId = decoded.sub;
    }

    const body = await req.json();
    const result = VerifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { target_creator_id, status, notes } = result.data;

    console.log(`Checking submission for Creator ID: ${target_creator_id}`);

    // 1. Fetch submission using creator_id instead of 'id'
    const { data: submissions, error: fetchError } = await supabase
      .from("verification_submissions")
      .select("creator_id, status") // Removed 'id' here
      .eq("creator_id", target_creator_id);

    if (fetchError) {
      console.error("Supabase Fetch Error:", fetchError);
      throw fetchError;
    }

    const pendingSub = submissions?.find(s => s.status === 'pending');

    if (!pendingSub) {
      return NextResponse.json({ 
        error: "No pending submission found.",
        details: submissions?.length 
          ? `Status is currently: ${submissions[0].status}`
          : "No record exists for this creator."
      }, { status: 404 });
    }

    // 2. Update Submissions Table using creator_id as the key
    const { error: subError } = await supabase
      .from("verification_submissions")
      .update({ 
        status: status,
        admin_notes: notes || `Handled by admin: ${adminId}`,
        reviewed_at: new Date().toISOString()
      })
      .eq("creator_id", target_creator_id);

    if (subError) throw subError;

    // 3. Update the 'users' table
    const { error: userTableError } = await supabase
      .from("users")
      .update({ 
        is_verified: status === 'approved',
        verification_status: status 
      })
      .eq("id", target_creator_id);

    if (userTableError) throw userTableError;

    // 4. Audit Log - Use target_creator_id as the reference
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      submission_id: target_creator_id, 
      action_type: status,
      notes: notes || "No additional notes"
    });

    return NextResponse.json({ 
      message: `Creator successfully ${status}`,
      new_status: status
    });

  } catch (err: any) {

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}