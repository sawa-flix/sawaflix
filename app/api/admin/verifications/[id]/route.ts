import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/admin/verifications/{id}:
 *   get:
 *     summary: Get verification submission details
 *     description: Fetch full verification submission details for a specific creator.
 *     tags:
 *       - Admin Verification
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Creator ID
 *         schema:
 *           type: string
 *           example: 123e4567-e89b
 *     responses:
 *       200:
 *         description: Submission details retrieved successfully
 *       404:
 *         description: No submission record found
 *       500:
 *         description: Server error
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // FIX 1: Define params as a Promise
) {
  // FIX 2: Await the params to get the creatorId
  const { id: creatorId } = await params;

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
        form_data,
        admin_notes,
        created_at,
        creator_profiles (
          legal_name, 
          stage_name,
          bio,
          profile_picture_url
        )
      `) // FIX 3: Changed full_name to legal_name
      .eq("creator_id", creatorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "No submission record found for this ID" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (err: any) {
    console.error("Admin Fetch Detail Error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
