'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const creatorProfileSchema = z.object({
    legalName: z.string().min(2),
    

})