import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1️ AUTHENTICATION (Supports Browser & Insomnia)
    const authHeader = req.headers.get("Authorization");
    const cookieStore = await cookies(); // FIX: Added await
    let supabase;

    if (authHeader?.startsWith("Bearer ")) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      );
    } else {
      supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creatorId = user.id;

    // 2️ FETCH EXISTING SUBMISSION
    const { data: submission, error } = await supabase
      .from("verification_submissions")
      .select("category, status, form_data")
      .eq("creator_id", creatorId)
      .maybeSingle();

    if (error) throw error;

    if (!submission) {
      return NextResponse.json(
        { error: "No draft found. Please complete the verification form first." },
        { status: 400 }
      );
    }

    // 3️ PREVENT RESUBMISSION (Security Guard)
    if (submission.status === "pending" || submission.status === "approved") {
      return NextResponse.json(
        { error: "Forbidden", message: "Submission already under review or approved." },
        { status: 403 }
      );
    }

    const formData = submission.form_data || {};

    // 4️ REQUIRED DOCUMENT CHECK
    // Note: Checking for _path keys as per our secure upload logic
    if (!formData.selfie_path || !formData.national_id_path) {
      return NextResponse.json(
        {
          error: "Missing required documents",
          message: "Selfie and National ID must be uploaded before final submission.",
          missing: {
            selfie: !formData.selfie_path,
            national_id: !formData.national_id_path
          }
        },
        { status: 400 }
      );
    }

    // 5️ UPDATE STATUS TO PENDING
    const { data: updated, error: updateError } = await supabase
      .from("verification_submissions")
      .update({
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("creator_id", creatorId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 6️ SUCCESS
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! It is now under review.",
      status: "pending",
      data: updated,
    });

  } catch (err: any) {
    console.error("Submit Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}