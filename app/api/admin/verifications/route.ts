import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
/**
 * @swagger
 * /api/admin/verifications:
 *   get:
 *     summary: Get verification submissions
 *     description: Returns a list of creator verification submissions filtered by status. Defaults to pending submissions.
 *     tags:
 *       - Admin Verification
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         description: Filter submissions by status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, info_requested]
 *           example: pending
 *     responses:
 *       200:
 *         description: List of verification submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       creator_id:
 *                         type: string
 *                         example: 123e4567-e89b
 *                       category:
 *                         type: string
 *                         example: Music
 *                       status:
 *                         type: string
 *                         example: pending
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       creator_profiles:
 *                         type: object
 *                         properties:
 *                           legal_name:
 *                             type: string
 *                             example: John Doe
 *                           stage_name:
 *                             type: string
 *                             example: DJ Killa
 *                           profile_picture_url:
 *                             type: string
 *                             example: https://cdn.site/avatar.jpg
 *       500:
 *         description: Server error
 */
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