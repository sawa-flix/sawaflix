import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function PUT(req: Request) {
  console.log("💾 PUT /draft - Start");
  const authHeader = req.headers.get("Authorization");
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to regular user client.");
  }

  let supabase;
  let finalUserId: string;

  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  // 1. AUTHENTICATION HANDLING
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      
      if (serviceKey && token === serviceKey) {
        // IMPORTANT: Use your actual User UID from Supabase Auth for testing
        finalUserId = "b21d3e41-f405-46bc-b144-319669ec3e0d"; 
        supabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
      } else {
        finalUserId = decoded.sub;
        supabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: authHeader } } }
        );
      }
    } catch (e) {
      console.error("❌ Token Decode Error:", e);
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
  } else {
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      finalUserId = user.id;
    } else {
      const visitorId = req.headers.get("x-visitor-id");
      if (visitorId) {
        finalUserId = `anon-${visitorId}`; // Use a prefix to distinguish in DB if needed
        console.log(`💾 Anonymous Draft: ${finalUserId}`);
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
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
