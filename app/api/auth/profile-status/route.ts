import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

// Admin client bypasses RLS
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ verified: false, role: null }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from("users")
      .select("role, verification_status")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ verified: false, role: null });
    }

    return NextResponse.json({
      verified: profile.verification_status === "approved",
      role: profile.role,
      verification_status: profile.verification_status,
    });
  } catch (e) {
    console.error("Profile status API error:", e);
    return NextResponse.json({ verified: false, role: null }, { status: 500 });
  }
}
