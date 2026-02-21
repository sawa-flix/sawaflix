import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const { target_creator_id, notes } = await req.json();

    if (!target_creator_id || !notes) {
      return NextResponse.json({ error: "ID and message are required" }, { status: 400 });
    }

    let adminId = "system";
    if (authHeader?.startsWith("Bearer ")) {
      const decoded: any = jwtDecode(authHeader.substring(7));
      adminId = decoded.sub;
    }

    await supabase.from("verification_submissions").update({ 
      admin_notes: `INFO REQUESTED: ${notes}`,
      reviewed_at: new Date().toISOString() 
    }).eq("creator_id", target_creator_id);

    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      submission_id: target_creator_id,
      action_type: 'info_requested',
      notes
    });

    return NextResponse.json({ message: "INFO REQUESTED: Creator prompted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}