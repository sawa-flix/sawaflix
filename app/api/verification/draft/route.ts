import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function PUT(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const cookieStore = await cookies();
  
  let supabase: SupabaseClient;
  let finalUserId: string | null = null;

  // 1. DYNAMIC AUTHENTICATION
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded: any = jwtDecode(token);
      // Ensure we have a valid ID. Fallback to your test ID only if it's the service role.
      finalUserId = decoded.sub || (decoded.role === "service_role" ? "b21d3e41-f405-46bc-b144-319669ec3e0d" : null);

      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Admin access for backend ops
      );
    } catch (e) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
  } else {
    // Standard Browser Session
    supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) finalUserId = user.id;
  }

  if (!finalUserId) {
    return NextResponse.json({ error: "Unauthorized: No User ID found" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // 2. PRODUCTION GUARD: Prevent overwriting a 'pending' or 'approved' submission
    // We only want to 'upsert' if the current status is 'draft' or 'info_requested'
    const { data: existing } = await supabase
      .from("verification_submissions")
      .select("status")
      .eq("creator_id", finalUserId)
      .single();

    if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
      return NextResponse.json({ 
        error: "Forbidden", 
        details: "Cannot edit a submission that is currently under review or already approved." 
      }, { status: 403 });
    }

    // 3. THE UPSERT
    const { data, error } = await supabase
      .from("verification_submissions")
      .upsert(
        {
          creator_id: finalUserId,
          category: body.category || "General",
          form_data: body.form_data || body.formData || {}, 
          status: 'draft', // Reset to draft if they were in 'info_requested' mode
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
      userId: finalUserId,
      data 
    });

  } catch (err: any) {
    console.error("Draft Save Error:", err);
    return NextResponse.json({ 
      error: "Database error", 
      details: err.message 
    }, { status: 500 });
  }
}