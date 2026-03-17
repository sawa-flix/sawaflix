import { createClient } from "@supabase/supabase-js";

/**
 * WARNING: This client uses the Service Role Key.
 * It bypasses all Row Level Security (RLS) policies.
 * ONLY use this in server-side routes (API routes or Server Actions).
 * NEVER use this in client-side components.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase Admin Environment Variables");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});