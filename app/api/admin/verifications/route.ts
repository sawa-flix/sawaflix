import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Default to pending, but allows filtering by 'approved' or 'rejected'
  const status = searchParams.get("status") || "pending";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data, error } = await supabase
      .from("verification_submissions")
      .select(`
        creator_id,
        category,
        status,
        created_at,
        creator_profiles (
          legal_name,
          stage_name,
          profile_picture_url
        )
      `)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}