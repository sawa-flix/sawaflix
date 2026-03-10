import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/verification/form:
 *   get:
 *     summary: Get creator verification draft
 *     description: Retrieves the saved draft verification form for the authenticated creator.
 *     tags:
 *       - Creator Verification
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Draft retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  try {
    // 1. Get the header (Standardize casing)
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

    // 2. Initialize the client based on the source of the request
    let supabase;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Use standard createClient for Swagger/Postman
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );
    } else {
      // Use cookies for the browser/frontend
      const cookieStore = await cookies(); // Must be awaited in Next.js 15
      supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    }

    // 3. Perform the user check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Supabase Auth Error:", authError?.message); // Check your terminal for this!
      return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
    }
    const user_id = user.id;

    // Fetch creator draft
    const { data, error } = await supabase
      .from("verification_submissions")
      .select("category, status, form_data, updated_at")
      .eq("creator_id", user_id)
      .maybeSingle();

    if (error) throw error;

    // If draft doesn't exist yet
    if (!data) {
      return NextResponse.json({
        message: "No draft found",
        data: null,
      });
    }

    return NextResponse.json({
      message: "Draft retrieved successfully",
      data: {
        category: data.category,
        status: data.status,
        formData: data.form_data,
        lastUpdated: data.updated_at,
      },
    });

  } catch (err: any) {
    console.error("Fetch Draft Error:", err.message);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}