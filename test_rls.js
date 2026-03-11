const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const admin = createClient(supabaseUrl, supabaseAdminKey);
  const { data: adminUser } = await admin
    .from("users")
    .select("*")
    .limit(1)
    .single();
  if (!adminUser) return console.log("No user found");
  console.log("Admin sees:", adminUser.id, adminUser.verification_status);

  const client = createClient(supabaseUrl, supabaseAnonKey);

  // Can we read it anonymously?
  const { data: anonData, error: anonErr } = await client
    .from("users")
    .select("verification_status")
    .eq("id", adminUser.id);
  console.log("Anon read error:", anonErr);
  console.log("Anon read data:", anonData);
}
run();
