import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("🔍 GET /api/verification/form - Retrieving Draft");

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let creator_id: string;
    if (user) {
      creator_id = user.id;
    } else {
      const visitorId = req.headers.get("x-visitor-id");
      
      if (visitorId) {
        creator_id = `anon-${visitorId}`;
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }


    // Retrieve the latest verification submission for this user/visitor
    const { data, error } = await supabase
      .from("verification_submissions")
      .select("category, status, form_data")
      .eq("creator_id", creator_id)
      .maybeSingle();


    if (error) {
      console.error("❌ DB Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: "No draft found", data: null });
    }

    // Map DB fields to the expected frontend structure if necessary
    // Example Response says: { "message": "...", "data": { "category": "...", "status": "...", "formData": { ... } } }
    return NextResponse.json({
      message: "Draft retrieved successfully",
      data: {
        category: data.category,
        status: data.status,
        formData: data.form_data
      }
    });

  } catch (err: any) {
    console.error("Critical Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
