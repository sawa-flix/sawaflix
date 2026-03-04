import { createClient } from "../utils/supabase/server";

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile || {
    id: user.id,
    email: user.email,
    username: user.email?.split('@')[0],
    category: "viewer", // Default fallback
  };
}