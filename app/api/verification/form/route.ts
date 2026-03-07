import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const cookieStore = await cookies();
    let supabase;

    // Create Supabase client (supports browser or Insomnia testing)
    if (authHeader?.startsWith("Bearer ")) {
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
      supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const user_id = user.id;

    // Fetch creator draft
    const { data, error } = await supabase
      .from("verification_submissions")
      .select("category, status, form_data, updated_at")
      .eq("creator_id", user_id)
      .maybesingle();

    // No draft yet
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({
          message: "No draft found",
          data: null,
        });
      }

      throw error;
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
