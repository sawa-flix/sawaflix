// @ts-check
'use server';

import { createClient } from '../../utils/supabase/server';

/**
 * Fetches the authenticated user's creator profile from Supabase.
 * Call this from Server Components and Route Handlers.
 *
 * @returns {Promise<import('../../types/creator').CreatorProfile|null>}
 */
export async function getCreatorProfile() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('creator_type, verification_status, rejection_reason, submitted_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('🔴 getCreatorProfile DB error:', error.message);
      // Still return minimal profile — user is authenticated
      return {
        id: user.id,
        email: user.email ?? '',
        creatorType: null,
        verificationStatus: 'unverified',
        rejectionReason: null,
        submittedAt: null,
      };
    }

    return {
      id: user.id,
      email: user.email ?? '',
      creatorType: data?.creator_type ?? null,
      verificationStatus: data?.verification_status ?? 'unverified',
      rejectionReason: data?.rejection_reason ?? null,
      submittedAt: data?.submitted_at ?? null,
    };
  } catch (err) {
    console.error('🔴 getCreatorProfile unexpected error:', err);
    return null;
  }
}
