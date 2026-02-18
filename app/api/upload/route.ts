import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
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
  const authHeader = req.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabase;

  const expectedHeader = `Bearer ${serviceKey}`;
  const isServiceRole = authHeader === expectedHeader;

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

  try {
    let creator_id: string;

    if (isServiceRole) {
      creator_id = "admin-tester";
    } else {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            details: authError?.message || "No user found",
          },
          { status: 401 },
        );
      }
      creator_id = user.id;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const categoryInput = formData.get("category");

    const validation = UploadSchema.safeParse({ category: categoryInput });
    if (!file || !validation.success) {
      return NextResponse.json(
        { error: "Invalid file or category" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = await fileTypeFromBuffer(buffer);

    if (!type)
      return NextResponse.json(
        { error: "Could not determine file type" },
        { status: 400 },
      );

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${type.ext}`;
    const filePath = `${creator_id}/${validation.data.category}/${fileName}`;

    const { data, error: uploadError } = await adminClient.storage
      .from("verification-docs")
      .upload(filePath, buffer, { contentType: type.mime });

    if (uploadError) throw uploadError;

    return NextResponse.json({
      message: "Success!",
      storagePath: data.path,
    });
  } catch (err: any) {
    console.error("Critical Error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
