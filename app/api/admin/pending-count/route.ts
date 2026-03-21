import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Use the Admin client we just created
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
/**
 * @swagger
 * /api/admin/pending-count:
 *   get:
 *     summary: Get total pending verification count
 *     description: Returns the number of creator verification submissions currently in the pending state. Used for admin dashboard quick insights and notifications.
 *     tags:
 *       - Admin Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pending verification count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pending_count:
 *                   type: integer
 *                   example: 12
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-03-21T22:30:00.000Z
 *       500:
 *         description: Server error while fetching pending count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch pending count
 */
// Ensure this route is not cached so the admin always sees the real-time count
export async function GET() {
  // Use Service Role to bypass RLS and see all submissions
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Optimization: We use { count: 'exact', head: true } 
    // This returns ONLY the number, not the actual rows (very fast)
    const { count, error } = await supabase
      .from("verification_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      console.error("Supabase Count Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: count || 0 
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}