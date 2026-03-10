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

  // 1. DYNAMIC AUTH LOGIC (Removed Hardcoded ID)
  if (token) {
    try {
      // Decode the token to get the ACTUAL user ID from the JWT
      const decoded: any = jwtDecode(token);
      userId = decoded.sub; // This is the 'subject' (User ID) in Supabase JWTs

      if (serviceKey && token === serviceKey) {
        // If it's a Service Role request, we use the Admin Client 
        // Note: For Service Role, you must send a 'x-user-id' header from Insomnia 
        // or ensure the token is a valid User JWT, not just the API Key.
        supabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
        
        // If testing via Insomnia with a raw Service Key, we can use a header to specify the user
        const targetUser = req.headers.get("x-user-id");
        if (targetUser) userId = targetUser;
      } else {
        // Regular User token
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
    // Browser-based session
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      userId = user.id;
    } else {
      return NextResponse.json({ error: "Unauthorized: No user session found" }, { status: 401 });
    }
  }

  try {
    const body = await req.json();
    const category = body.category;
    const form_data = body.form_data || body.formData;

    // 2. VALIDATION: Check required submission data
    if (!category || !form_data) {
      return NextResponse.json({ error: "Category and Form Data are required" }, { status: 400 });
    }

    // 3. THE SUBMISSION
    const { data, error } = await supabase
      .from("verification_submissions")
      .upsert(
        {
          creator_id: userId,
          category,
          form_data,
          status: 'pending', 
          updated_at: new Date().toISOString(),
        },
        { onConflict: "creator_id" }
      )
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Application submitted successfully!", 
      status: "pending",
      data 
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}