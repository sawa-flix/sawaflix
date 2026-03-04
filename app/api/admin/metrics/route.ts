import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Run all counts at the same time for better performance
    const [pending, approved, rejected, infoRequested] = await Promise.all([
      supabase.from("verification_submissions").select("*", { count: 'exact', head: true }).eq("status", "pending"),
      supabase.from("verification_submissions").select("*", { count: 'exact', head: true }).eq("status", "approved"),
      supabase.from("verification_submissions").select("*", { count: 'exact', head: true }).eq("status", "rejected"),
      supabase.from("verification_submissions").select("*", { count: 'exact', head: true }).eq("status", "info_requested")
    ]);

    // Check if any of the essential counts failed
    if (pending.error) throw pending.error;
    if (approved.error) throw approved.error;

    const pCount = pending.count || 0;
    const aCount = approved.count || 0;
    const rCount = rejected.count || 0;
    const iCount = infoRequested.count || 0;

    return NextResponse.json({
      metrics: {
        total_pending: pCount,
        total_approved: aCount,
        total_rejected: rCount,
        total_info_requested: iCount,
        total_submissions: pCount + aCount + rCount + iCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    // Return the actual error object or a string if message is empty
    return NextResponse.json({ 
      error: err.message || "An unknown database error occurred",
      details: err 
    }, { status: 500 });
  }
}