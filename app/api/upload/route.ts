import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";
import { createHash } from "crypto";

// --- INFRASTRUCTURE CONFIGURATION ---
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB Limit (Issue #1 Fix)
const ALLOWED_MIMES = ["image/jpeg", "image/png", "application/pdf", "video/mp4"];
const rateLimitMap = new Map<string, number>(); // (Issue #4 Rate Limiting Fix)

const UploadSchema = z.object({
  category: z.enum([
    "national_id",
    "selfie",
    "endorsement_letter",
    "content_sample",
  ]),
});

export async function POST(req: Request) {
  // 1. RATE LIMITING (HIGH SEVERITY FIX - Issue #4)
  const ip = (await headers()).get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  if (rateLimitMap.has(ip) && now - rateLimitMap.get(ip)! < 2000) {
    return NextResponse.json({ error: "Rate limit exceeded. Please wait 2 seconds." }, { status: 429 });
  }
  rateLimitMap.set(ip, now);

  try {
    // --- STEP 2 INTEGRATION: SAFE FORM DATA PARSING ---
    // This catches the server-level crash before it hits your logic
    const formData = await req.formData().catch(() => null);
    
    if (!formData) {
      return NextResponse.json(
        { error: "File too large. Limit 10mb" }, 
        { status: 413 } 
      );
    }

    const file = formData.get("file") as File | null;
    const categoryInput = formData.get("category");

    // 2. VALIDATION (Schema check)
    const validation = UploadSchema.safeParse({ category: categoryInput });
    if (!file || !validation.success) {
      return NextResponse.json({ error: "Invalid file or category" }, { status: 400 });
    }

    // 3. FILE SIZE VALIDATION (Your specific requirement)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Limit 10mb" }, 
        { status: 400 }
      );
    }

    // --- AUTHENTICATION ---
    const authHeader = req.headers.get("Authorization");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabase;

    if (authHeader?.startsWith("Bearer ")) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } },
      );
    } else {
      const cookieStore = await cookies();
      supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    }

    let creator_id: string;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        if (authHeader === `Bearer ${serviceKey}`) {
            creator_id = "admin-tester";
        } else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    } else {
        creator_id = user.id;
    }

    // 4. FILE INTEGRITY & TYPE CHECKS
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = createHash('sha256').update(buffer).digest('hex');

    const type = await fileTypeFromBuffer(buffer);
    if (!type || !ALLOWED_MIMES.includes(type.mime)) {
      return NextResponse.json({ error: "Unsupported or malicious file type detected." }, { status: 400 });
    }

    // 5. STORAGE UPLOAD
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${type.ext}`;
    const filePath = `${creator_id}/${validation.data.category}/${fileName}`;

    const { data, error: uploadError } = await adminClient.storage
      .from("verification-docs")
      .upload(filePath, buffer, { 
        contentType: type.mime,
        upsert: false 
      });

    if (uploadError) throw uploadError;

    // 6. AUDIT LOGGING
    await adminClient.from("verification_submissions").upsert({
        creator_id: creator_id,
        category: validation.data.category,
        updated_at: new Date().toISOString()
    });

    return NextResponse.json({
      message: "File successfully secured and uploaded",
      storagePath: data.path,
      integrityHash: fileHash,
      mimeType: type.mime
    });

  } catch (err: any) {
    console.error(" Upload Error details:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}