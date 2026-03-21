import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { queueEmail } from "@/lib/emailQueue";
/**
 * @swagger
 * /api/admin/verifications/{id}/reject:
 *   post:
 *     summary: Reject creator verification
 *     description: Rejects a creator verification request and stores the rejection reason.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: ID document was unclear
 *               reason:
 *                 type: string
 *                 example: Uploaded selfie did not match ID
 *     responses:
 *       200:
 *         description: Creator verification rejected
 *       400:
 *         description: Rejection reason required
 *       500:
 *         description: Server error
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: creatorId } = await params;
  const { reason } = await req.json();

  if (!reason) return NextResponse.json({ error: "Reason is required" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: submission } = await supabase
      .from("verification_submissions")
      .select(`users(email)`)
      .eq("creator_id", creatorId)
      .single();

    // 1. Update Status & Notes
    await supabase.from("verification_submissions")
      .update({ status: "rejected", admin_notes: reason })
      .eq("creator_id", creatorId);

    // 2. Set profile back to unverified
    await supabase.from("creator_profiles")
      .update({ status: "unverified" })
      .eq("creator_id", creatorId);

    // 3. Queue Email (Matches your EmailJob type)
    await queueEmail({
      type: "rejection",
      email: (submission?.users as any)?.email,
      reason: reason
    });

    return NextResponse.json({ success: true, message: "Rejection feedback sent." });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}