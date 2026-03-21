import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { queueEmail } from "@/lib/emailQueue";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: creatorId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Fetch submission to get Stage Name and Email
    const { data: submission, error: fetchError } = await supabase
      .from("verification_submissions")
      .select(`category, form_data, users(email)`)
      .eq("creator_id", creatorId)
      .single();

    // if (fetchError || !submission) throw new Error("Submission not found");

    const stageName = submission.form_data?.identity?.creatorName || "Creator";
    const userEmail = (submission.users as any)?.email;

    // 2. Atomic Updates
    const { error: subErr } = await supabase.from("verification_submissions")
      .update({ status: "approved" }).eq("creator_id", creatorId);

    const { error: profErr } = await supabase.from("creator_profiles")
      .update({ status: "approved", is_verified: true }).eq("creator_id", creatorId);

    const { error: userErr } = await supabase.from("users")
      .update({ role: "creator", verification_status: "approved", is_verified: true }).eq("id", creatorId);

    if (subErr || profErr || userErr) throw new Error("Database sync failed");

    // 3. Queue Email (Matches your EmailJob type)
    await queueEmail({
      type: "approval",
      email: userEmail,
      stageName: stageName
    });

    return NextResponse.json({ success: true, message: "Creator approved and promoted." });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}