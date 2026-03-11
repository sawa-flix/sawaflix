import { createClient } from "@/utils/supabase/server";

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id, username, role, verification_status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: profile.id,
    username: profile.username || user.email,
    category: profile.role || 'client',
    verificationStatus: profile.verification_status || 'unverified',
  };
}
