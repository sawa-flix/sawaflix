import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // FIX 1: Params is a Promise
) {
  // FIX 2: Await the params
  const { id: creatorId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json().catch(() => ({}));
    const notes = body.notes || body.reason; // Supports both 'notes' or 'reason' keys

    // Validation: Admin MUST provide a reason for rejection
    if (!notes || notes.length < 5) {
      return NextResponse.json(
        { error: "A valid rejection reason (minimum 5 characters) is required." },
        { status: 400 }
      );
    }

    // 1. Update the Submission Status to 'rejected'
    const { error: subError } = await supabase
      .from("verification_submissions")
      .update({
        status: "rejected",
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq("creator_id", creatorId);

    if (subError) throw subError;

    // 2. Ensure Creator Profile is NOT verified
    const { error: profileError } = await supabase
      .from("creator_profiles")
      .update({
        is_verified: false
      })
      .eq("creator_id", creatorId);

    if (profileError) throw profileError;

    // 3. Update Global User Record (Security measure)
    await supabase
      .from("users") 
      .update({
        is_verified: false,
        verification_status: "rejected"
      })
      .eq("id", creatorId);

    return NextResponse.json({
      success: true,
      message: "Creator application rejected successfully.",
      status: "rejected"
    });

  } catch (err: unknown) {
    console.error("Rejection Error:", (err instanceof Error ? err.message : "Unknown error"));
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "Unknown error") },
      { status: 500 }
    );
  }
}
