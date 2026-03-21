import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { queueEmail } from "@/lib/emailQueue";
/**
 * @swagger
 * /api/admin/verifications/{id}/request-info:
 *   post:
 *     summary: Request additional information
 *     description: Requests more information from the creator before verification can proceed.
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
 *                 example: Please upload a clearer photo of your ID
 *               message:
 *                 type: string
 *                 example: Your selfie is too dark, please upload a new one
 *     responses:
 *       200:
 *         description: Information request sent to creator
 *       400:
 *         description: Explanation required
 *       500:
 *         description: Server error
 */


export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: creatorId } = await params;
  const { message } = await req.json();

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

    // Update notes but leave status as 'pending'
    await supabase.from("verification_submissions")
      .update({ admin_notes: `ACTION REQUIRED: ${message}` })
      .eq("creator_id", creatorId);

    // Use the rejection logic to send the message
    await queueEmail({
      type: "rejection", // Re-using rejection template for simplicity
      email: (submission?.users as any)?.email,
      reason: `Additional information required: ${message}`
    });

    return NextResponse.json({ success: true, message: "Information request sent." });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}