import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";

const UploadSchema = z.object({
  category: z.enum([
    "national_id",
    "selfie",
    "endorsement_letter",
    "content_sample",
  ]),
});

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const authHeader = req.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  /**
   * 1. Initialize the Supabase Client (SSR compatible)
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be ignored if middleware is handling session refreshes
          }
        },
      },
    }
  );

  try {
    let creator_id: string;

    /**
     * 2. Authentication Check
     * Priority: Service Role Key (for testing/admin) -> User Session (for users)
     */
    const isServiceRole = authHeader === `Bearer ${serviceKey}`;

    if (isServiceRole) {
      creator_id = "admin-tester";
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: "Unauthorized", details: authError?.message || "No user found" },
          { status: 401 }
        );
      }
      creator_id = user.id;
    }

    /**
     * 3. Form Data & Validation
     */
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const categoryInput = formData.get("category");

    const validation = UploadSchema.safeParse({ category: categoryInput });

    if (!file || !validation.success) {
      return NextResponse.json(
        { error: "Invalid file or category", details: validation.error?.format() },
        { status: 400 }
      );
    }

    /**
     * 4. File Type Detection
     */
    const buffer = Buffer.from(await file.arrayBuffer());
    const type = await fileTypeFromBuffer(buffer);

    if (!type) {
      return NextResponse.json(
        { error: "Could not determine file type" },
        { status: 400 }
      );
    }

    /**
     * 5. Upload to Storage via Admin Client
     * (We use the Service Role client here to bypass RLS for verification docs)
     */
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    return NextResponse.json({
      message: "Success!",
      storagePath: data.path,
    });

  } catch (err: any) {
    console.error("Critical Error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}