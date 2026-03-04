import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Extract the ID from the URL params
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 2. Fetch the specific submission 
    // We join 'creator_profiles' to see the user's public info alongside their private evidence
    const { data, error } = await supabase
      .from("verification_submissions")
      .select(`
        *,
        creator_profiles (
          full_name,
          stage_name,
          bio,
          avatar_url
        )
      `)
      .eq("creator_id", id) // Use creator_id as the unique key
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Verification record not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Return the payload for the Review Screen
    return NextResponse.json({ 
        success: true,
        data 
    });

  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}