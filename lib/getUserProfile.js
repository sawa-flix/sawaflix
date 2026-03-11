import { createClient } from "@/utils/supabase/server";

export async function getUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email?.split("@")[0],
      category: user.user_metadata?.category || "viewer",
      verificationStatus: "unverified",
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username || user.email?.split("@")[0],
    category: profile.role || "viewer",
    verificationStatus: profile.verification_status || "unverified",

  };
}
