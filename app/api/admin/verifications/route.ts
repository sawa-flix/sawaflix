import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: verifications, error } = await supabase
      .from("verification_submissions")
      .select("creator_id, status, category, form_data, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform for the frontend
    const formattedData = verifications?.map((v) => ({
      id: v.creator_id,
      full_name: v.form_data?.identity?.fullName || "No Name",
      category: v.category || "Unknown",
      status: v.status || "unverified",
      submitted_at: v.created_at,
      avatar_url: v.form_data?.identity?.avatarUrl || null,
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
