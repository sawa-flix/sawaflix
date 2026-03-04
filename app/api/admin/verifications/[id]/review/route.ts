import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Get ID from the URL segment
  const { id } = await params;

  // 2. Admin Client (Bypasses Row Level Security)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 3. The Review Query
    // We select everything from the submission and join the profile
    const { data, error } = await supabase
      .from("verification_submissions")
      .select(`
        *,
        creator_profiles (
          full_name,
          stage_name,
          category,
          avatar_url,
          bio
        )
      `)
      .eq("creator_id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "No pending review found for this ID" }, { status: 404 });
      }
      throw error;
    }

    // 4. Generate Signed URLs (Optional but Recommended)
    // If your 'verification-docs' bucket is private, the Admin needs a temporary link 
    // to actually view the images.
    const evidence = data.form_data || {};
    
    // 5. Structure the response for the Admin UI
    return NextResponse.json({
      success: true,
      data: {
        creatorId: data.creator_id,
        currentStatus: data.status,
        submittedAt: data.created_at,
        category: data.category,
        // The raw JSON data containing legal name, etc.
        formData: evidence, 
        // Public profile context
        profile: data.creator_profiles,
        // Any previous admin interactions
        audit: {
          lastReviewed: data.reviewed_at,
          previousNotes: data.admin_notes
        }
      }
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: "Review fetch failed", 
      details: err.message 
    }, { status: 500 });
  }
}