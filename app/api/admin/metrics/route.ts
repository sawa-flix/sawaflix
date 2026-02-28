import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Fetch count of pending creators
    const { count: pendingCount, error: pendingError } = await supabase
      .from("users")
      .select("*", { count: 'exact', head: true })
      .eq("verification_status", "pending");

    if (pendingError) throw pendingError;

    // 2. Fetch count of approved creators
    const { count: approvedCount, error: approvedError } = await supabase
      .from("users")
      .select("*", { count: 'exact', head: true })
      .eq("verification_status", "approved");

    if (approvedError) throw approvedError;

    // 3. Fetch count of rejected applications (optional but helpful)
    const { count: rejectedCount } = await supabase
      .from("users")
      .select("*", { count: 'exact', head: true })
      .eq("verification_status", "rejected");

    return NextResponse.json({
      metrics: {
        total_pending: pendingCount || 0,
        total_approved: approvedCount || 0,
        total_rejected: rejectedCount || 0,
        total_users_tracked: (pendingCount || 0) + (approvedCount || 0) + (rejectedCount || 0)
      },
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}