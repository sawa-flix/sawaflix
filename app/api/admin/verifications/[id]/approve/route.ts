import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
/**
 * @swagger
 * /api/admin/verifications/{id}/approve:
 *   post:
 *     summary: Approve creator verification
 *     description: Approves a creator verification request and marks the creator profile as verified.
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: Approved by admin after verification review
 *     responses:
 *       200:
 *         description: Creator successfully approved
 *       500:
 *         description: Server error
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const creatorId = params.id;

  const supabase = await createClient();

  try {
    const body = await req.json().catch(() => ({}));
    const notes = body.notes || "Approved by admin";

    // Update verification_submissions
    const { error: subError, data: submission } = await supabase
      .from("verification_submissions")
      .update({ status: "approved", admin_notes: notes })
      .eq("id", creatorId)
      .select("creator_id")
      .single();

    // Also update creator_profiles
    const creatorIdFromSubmission = submission?.creator_id || creatorId;
    const { error: profileError } = await supabase
      .from("creator_profiles")
      .update({ is_verified: true })
      .eq("creator_id", creatorIdFromSubmission);

    if (subError || profileError) {
      return new Response(JSON.stringify({ message: "Failed to update status." }), { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Creator has been officially approved and verified",
      status: "approved"
    });

  } catch (err: any) {
    console.error("Approve Error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
