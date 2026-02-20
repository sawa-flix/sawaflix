// @ts-check
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../utils/supabase/client';

/**
 * Client-side hook to get and subscribe to the current user's creator status.
 * Used by dashboard components to reactively update when backend flips status.
 *
 * @returns {{
 *   user: import('@supabase/supabase-js').User|null,
 *   creatorType: import('../types/creator').CreatorType|null,
 *   verificationStatus: import('../types/creator').VerificationStatus,
 *   rejectionReason: string|null,
 *   submittedAt: string|null,
 *   isLoading: boolean,
 *   error: string|null,
 *   refetch: () => Promise<void>,
 * }}
 */
export function useCreatorStatus() {
  const [user, setUser] = useState(null);
  const [creatorType, setCreatorType] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const [rejectionReason, setRejectionReason] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      const { data, error: dbError } = await supabase
        .from('users')
        .select('creator_type, verification_status, rejection_reason, submitted_at')
        .eq('id', currentUser.id)
        .single();

      if (dbError) {
        console.error('🔴 useCreatorStatus DB error:', dbError.message);
        setError('Could not load creator profile');
      } else {
        setCreatorType(data?.creator_type ?? null);
        setVerificationStatus(data?.verification_status ?? 'unverified');
        setRejectionReason(data?.rejection_reason ?? null);
        setSubmittedAt(data?.submitted_at ?? null);
      }
    } catch (err) {
      console.error('🔴 useCreatorStatus error:', err);
      setError('Unexpected error loading creator profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Supabase Realtime subscription — reacts to Boyema's admin approvals/rejections instantly
  useEffect(() => {
    const supabase = createClient();
    let channel = null;

    async function setupSubscription() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      channel = supabase
        .channel(`creator-status-${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${currentUser.id}`,
          },
          (payload) => {
            console.log('🟡 Creator status updated via realtime:', payload.new);
            const updated = payload.new;
            if (updated.creator_type !== undefined) setCreatorType(updated.creator_type);
            if (updated.verification_status !== undefined) setVerificationStatus(updated.verification_status);
            if (updated.rejection_reason !== undefined) setRejectionReason(updated.rejection_reason);
            if (updated.submitted_at !== undefined) setSubmittedAt(updated.submitted_at);
          }
        )
        .subscribe();
    }

    setupSubscription();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return {
    user,
    creatorType,
    verificationStatus,
    rejectionReason,
    submittedAt,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
