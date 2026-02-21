import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  
  // 1. Bearer Token Verification
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer Token" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 2. Fetch the pending queue [cite: 183]
    const { data, error } = await supabase
      .from("verification_submissions")
      .select("creator_id, creator_public_id, category, status, created_at, form_data")
      .eq("status", "pending")
      .order("created_at", { ascending: true }); // Oldest first [cite: 183]

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}