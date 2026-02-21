import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  console.log("🚀 POST /submit - Finalizing Submission");
  const cookieStore = await cookies();
  const authHeader = req.headers.get("Authorization");
  
  let supabase;
  let userId: string;

  // 1. AUTH LOGIC (Supports Insomnia Service Role + Real Users)
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded: any = jwtDecode(token);
    userId = decoded.role === "service_role" ? "b21d3e41-f405-46bc-b144-319669ec3e0d" : decoded.sub;
    
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  } else {
    supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    userId = user.id;
  }

  try {
    const body = await req.json();
    const { category, form_data } = body;

    // 2. VALIDATION: Ensure critical fields exist before "Submitting"
    if (!category || !form_data) {
      return NextResponse.json({ error: "Category and Form Data are required for submission" }, { status: 400 });
    }

    // 3. THE SUBMISSION (Update status to 'pending')
    const { data, error } = await supabase
      .from("verification_submissions")
      .upsert(
        {
          creator_id: userId,
          category,
          form_data,
          status: 'pending', // <--- This is the key change!
          updated_at: new Date().toISOString(),
        },
        { onConflict: "creator_id" }
      )
      .select();

    if (error) {
      console.error("❌ Submission Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ SUCCESS: Creator is now PENDING review");
    return NextResponse.json({ 
      message: "Application submitted successfully!", 
      status: "pending",
      data 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}