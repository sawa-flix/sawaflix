import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js"; // Add this for testing support
import { NextResponse } from "next/server";


/**
 * @swagger
 * /api/verification/draft:
 *   put:
 *     summary: Save or update verification draft
 *     description: Saves a creator's verification form draft or updates it if it already exists.
 *     tags:
 *       - Creator Verification
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: Music
 *               formData:
 *                 type: object
 *                 example:
 *                   stage_name: "DJ Killa"
 *                   bio: "Music producer from Cameroon"
 *     responses:
 *       200:
 *         description: Draft saved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Submission locked
 *       500:
 *         description: Internal server error
 */


export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    let supabase;

    if (authHeader?.startsWith("Bearer ")) {
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
        { global: { headers: { Authorization: authHeader } } }
      );
    } else {
      supabase = await createClient();
    }

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 2. Parse request body and map your specific JSON structure
    const body = await req.json().catch(() => ({}));
    const formData = body.form_data || body.formData || {};
    
    // Deep extraction for the profile columns
    const category = body.category || formData.category || "General";
    const identity = formData.identity || {};
    const professional = formData.professional || {};

    // 3. THE FIX: PRE-FLIGHT PROFILE UPSERT (Parent Table)
    // We map your nested keys (identity.legalName, etc.) to the profile columns
    const { error: profileError } = await supabase
      .from("creator_profiles")
      .upsert({ 
          creator_id: userId,
          legal_name: identity.legalName || null,
          stage_name: identity.creatorName || formData.stage_name || "TBD",
          ethnic_group: identity.ethnicGroup || null,
          bio: professional.bio || formData.bio || null,
          years_active: professional.experienceTime || "0",
          category: category,
          status: 'unverified', // Keep status as unverified during draft phase
          is_verified: false,
          updated_at: new Date().toISOString()
      }, { onConflict: 'creator_id' });

    if (profileError) {
      console.error("Profile Sync Error in Draft:", profileError.message);
      return NextResponse.json({ error: "Database link error: Profile could not be synced." }, { status: 500 });
    }

    // 4. Check existing submission status to prevent overwriting "Pending"
    const { data: existingSubmission } = await supabase
      .from("verification_submissions")
      .select("status")
      .eq("creator_id", userId)
      .maybeSingle();

    if (existingSubmission && (existingSubmission.status === "pending" || existingSubmission.status === "approved")) {
      return NextResponse.json(
        {
          error: "Submission locked",
          message: "Cannot edit a submission that is pending review or already approved."
        },
        { status: 403 }
      );
    }

    // 5. Upsert Draft: Now safe because the Foreign Key (creator_id) is confirmed
    const { data, error } = await supabase
      .from("verification_submissions")
      .upsert(
        {
          creator_id: userId,
          category: category,
          form_data: formData,
          status: "draft",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "creator_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Draft saved successfully",
      data,
    });
  } catch (err: any) {
    console.error("Draft Save Error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}