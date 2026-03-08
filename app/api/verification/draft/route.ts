import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js"; // Add this for testing support
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const cookieStore = await cookies(); // FIX 1: Added await
    let supabase;

    // FIX 2: Support for both Browser and Insomnia/Service Role testing
    if (authHeader?.startsWith("Bearer ")) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use Service Role for backend overrides
        { global: { headers: { Authorization: authHeader } } }
      );
    } else {
      supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    }

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creatorId = user.id;

    // 2. Parse request body safely
    const body = await req.json().catch(() => ({}));

    const category = body.category || "General";
    const formData = body.form_data || body.formData || {};

    // 3. Check existing submission status
    const { data: existingSubmission } = await supabase
      .from("verification_submissions")
      .select("status")
      .eq("creator_id", creatorId)
      .maybeSingle();

    // 4. Prevent editing locked submissions (Security Guard)
    if (existingSubmission && (existingSubmission.status === "pending" || existingSubmission.status === "approved")) {
      return NextResponse.json(
        { 
          error: "Submission locked", 
          message: "Cannot edit a submission that is pending review or already approved." 
        }, 
        { status: 403 }
      );
    }

    // 5. Upsert draft (Create or Update)
    const { data, error } = await supabase
      .from("verification_submissions")
      .upsert(
        {
          creator_id: creatorId,
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
    console.error("Draft Save Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
