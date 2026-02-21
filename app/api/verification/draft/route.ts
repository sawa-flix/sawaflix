import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function PUT(req: Request) {
  console.log("💾 PUT /draft - Start");
  const authHeader = req.headers.get("Authorization");
  const cookieStore = await cookies();
  
  let supabase: SupabaseClient;
  let finalUserId: string;

  // 1. AUTHENTICATION HANDLING
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded: any = jwtDecode(token);
      
      if (decoded.role === "service_role") {
        // IMPORTANT: Use your actual User UID from Supabase Auth for testing
        finalUserId = "b21d3e41-f405-46bc-b144-319669ec3e0d"; 
      } else {
        finalUserId = decoded.sub;
      }

      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    } catch (e) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
  } else {
    supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    finalUserId = user.id;
  }

  try {
    const body = await req.json();

    // 2. THE UPSERT WITH STATUS CONTROL
    const { data, error } = await supabase
      .from("verification_submissions")
      .upsert(
        {
          creator_id: finalUserId,
          category: body.category,
          form_data: body.form_data,
          // FIX: Explicitly set status to 'unverified' so it is NOT 'pending'
          status: 'unverified', 
          updated_at: new Date().toISOString(),
        },
        { onConflict: "creator_id" }
      )
      .select();

    if (error) {
      console.error("❌ DB Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Success: Draft saved as 'unverified'");
    return NextResponse.json({ message: "Draft saved successfully", data });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}