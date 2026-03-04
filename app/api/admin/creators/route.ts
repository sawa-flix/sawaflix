import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  // 1. Extract query parameters for filtering and pagination [cite: 59]
  const status = searchParams.get("status") || "pending"; 
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  
  const rangeStart = (page - 1) * limit;
  const rangeEnd = rangeStart + limit - 1;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

 try {
  // 1. Get the profiles first
  const { data: profiles, error: profileError, count } = await supabase
    .from("creator_profiles")
    .select(`
      creator_id,
      legal_name,
      category,
      status,
      users ( email, username )
    `, { count: 'exact' })
    .eq("status", status)
    .range(rangeStart, rangeEnd);

  if (profileError) throw profileError;

  // 2. Get the submission data for these specific creators
  const creatorIds = profiles.map(p => p.creator_id);
  const { data: submissions } = await supabase
    .from("verification_submissions")
    .select("creator_id, form_data")
    .in("creator_id", creatorIds);

  // 3. Manually merge them so the frontend gets one clean object
  const combinedData = profiles.map(profile => ({
    ...profile,
    submissions: submissions?.filter(s => s.creator_id === profile.creator_id) || []
  }));

  return NextResponse.json({
    creators: combinedData,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit)
  });

} catch (err: any) {
  return NextResponse.json({ error: err.message }, { status: 500 });
}
}