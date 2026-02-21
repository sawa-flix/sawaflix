import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    // Get the ID and notes from the JSON body
    const { target_creator_id, notes } = await req.json();

    if (!target_creator_id) {
      return NextResponse.json({ error: "target_creator_id is required in the body" }, { status: 400 });
    }

    let adminId = "system";
    if (authHeader?.startsWith("Bearer ")) {
      const decoded: any = jwtDecode(authHeader.substring(7));
      adminId = decoded.sub;
    }

    // 1. Update status to Approved
    await supabase.from("verification_submissions").update({ 
      status: 'approved', 
      admin_notes: notes || "Approved by Admin",
      reviewed_at: new Date().toISOString() 
    }).eq("creator_id", target_creator_id);

    // 2. Flip the verification switch in Profiles
    await supabase.from("profiles").update({ is_verified: true }).eq("id", target_creator_id);

    // 3. Log to Audit Table
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      submission_id: target_creator_id,
      action_type: 'approved',
      notes: notes || "No specific notes provided"
    });

    return NextResponse.json({ message: "SUCCESS: Creator Approved" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}