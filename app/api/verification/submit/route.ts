import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { createHash } from 'crypto';


/**
 * @swagger
 * /api/verification/submit:
 *   post:
 *     summary: Submit verification application
 *     description: Finalizes the creator verification form and sends it for admin review.
 *     tags:
 *       - Creator Verification
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - form_data
 *             properties:
 *               category:
 *                 type: string
 *                 example: Music
 *               form_data:
 *                 type: object
 *                 example:
 *                   stage_name: "DJ Killa"
 *                   country: "Cameroon"
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Missing category or form data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
function stringToUuid(str: string) {
  const hash = createHash('sha256').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${((parseInt(hash.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  let supabase;
  let userId: string;

  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  // 1. Auth Logic
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.sub; 

      if (serviceKey && token === serviceKey) {
        supabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
        const targetUser = req.headers.get("x-user-id");
        if (targetUser) userId = targetUser;
      } else {
        supabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: authHeader } } }
        );
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
  } else {
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await req.json();
    const category = body.category;
    const formData = body.form_data || body.formData;

    if (!category || !formData) {
      return NextResponse.json({ error: "Category and Form Data are required" }, { status: 400 });
    }

    // Extracting nested data based on your specific JSON structure
    const identity = formData.identity || {};
    const professional = formData.professional || {};

    // 2. PRE-FLIGHT PROFILE UPSERT (Parent)
    // Maps your form structure to the creator_profiles columns
    const { error: profileError } = await supabase
      .from("creator_profiles")
      .upsert({ 
          creator_id: userId,
          legal_name: identity.legalName || null,
          stage_name: identity.creatorName || formData.stage_name || "New Creator",
          ethnic_group: identity.ethnicGroup || null,
          bio: professional.bio || formData.bio || null,
          years_active: professional.experienceTime || "0",
          category: category,
          status: 'pending', // Moving to pending state
          is_verified: false,
          updated_at: new Date().toISOString()
      }, { onConflict: 'creator_id' });

    if (profileError) {
      console.error("Profile Sync Error:", profileError.message);
      return NextResponse.json({ error: "Could not link creator profile." }, { status: 500 });
    }

    // 3. THE SUBMISSION (Child)
    const { data: submissionData, error: submissionError } = await supabase
      .from("verification_submissions")
      .upsert(
        {
          creator_id: userId,
          category,
          form_data: formData,
          status: 'pending',
          updated_at: new Date().toISOString(),
        },
        { onConflict: "creator_id" }
      )
      .select();

    if (submissionError) {
      return NextResponse.json({ error: submissionError.message }, { status: 500 });
    }

    // 4. USER TABLE UPDATE
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ 
        verification_status: "pending",
        is_verified: false 
      })
      .eq("id", userId);

    if (userUpdateError) {
      console.error("User Status Update Error:", userUpdateError.message);
    }

    return NextResponse.json({ 
      message: "Application submitted successfully!", 
      status: "pending",
      data: submissionData 
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}