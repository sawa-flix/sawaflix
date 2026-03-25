import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { createHash } from 'crypto';

function stringToUuid(str: string) {
  const hash = createHash('sha256').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${((parseInt(hash.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function POST(req: Request) {
  console.log("🚀 POST /submit - Finalizing Submission");
  const authHeader = req.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to regular user client.");
  }

  let supabase;
  let userId: string;

  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  // 1. AUTH LOGIC (Supports Insomnia Service Role + Real Users)
  if (token) {
    try {
      const decoded = jwtDecode<{ sub?: string; [key: string]: string | number | boolean }>(token);
      if (serviceKey && token === serviceKey) {
        userId = "b21d3e41-f405-46bc-b144-319669ec3e0d";
        supabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
      } else {
        userId = decoded.sub;
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
      userId = user.id;
    } else {
      const visitorId = req.headers.get("x-visitor-id");
      if (visitorId) {
        userId = stringToUuid(`anon-${visitorId}`);
        console.log(`🚀 Anonymous Submission: ${userId}`);
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
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

  } catch (err: unknown) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
