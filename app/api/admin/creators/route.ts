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
    // 2. Fetch creators joined with their verification data 
    // We select the profile info from 'users' and application info from 'verification_submissions'
    const { data, error, count } = await supabase
  .from("users")
  .select(`
    id,
    email,
    role,
    verification_status,
    created_at,
    verification_submissions!verification_submissions_creator_id_fkey (
      category,
      form_data,
      status
    )
  `, { count: 'exact' })
  .eq("verification_status", status)
  .range(rangeStart, rangeEnd);

    if (error) throw error;

    // 3. Return paginated response to the frontend [cite: 58, 66]
    return NextResponse.json({
      creators: data,
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}