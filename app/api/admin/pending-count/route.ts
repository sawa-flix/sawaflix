import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Use the Admin client we just created
import { NextResponse } from "next/server";

// Ensure this route is not cached so the admin always sees the real-time count
export const revalidate = 0; 

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("verification_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      console.error("Pending Count Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pending: count || 0,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
