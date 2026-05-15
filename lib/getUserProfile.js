import { createClient } from "../utils/supabase/server";
import { BACKEND_URL } from "./apiConfig";

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get session for token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  try {
    // Fetch profile from backend to get cultural metadata and personalization
    const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      next: { revalidate: 0 } // Don't cache profile
    });

    if (res.ok) {
      const backendProfile = await res.json();
      return {
        ...backendProfile,
        id: user.id,
        email: user.email,
        username: backendProfile.username || user.email?.split('@')[0],
      };
    }
  } catch (err) {
    console.error('Error fetching backend profile:', err);
  }

  // Fallback to Supabase if backend is down or fails
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: submission } = await supabase
    .from('verification_submissions')
    .select('status, category')
    .eq('creator_id', user.id)
    .maybeSingle();

  return {
    ...(profile || {
        id: user.id,
        email: user.email,
        username: user.email?.split('@')[0],
    }),
    category: submission?.category || profile?.category || 'viewer',
    verificationStatus: submission?.status || 'none',
    verification_status: profile?.verification_status || submission?.status || 'none',
    role: profile?.role || 'viewer'
  };
}
