'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { BACKEND_URL } from '@/lib/apiConfig';
import { Loader2, AlertTriangle, User, Mail, ShieldAlert } from 'lucide-react';
import { handleSignOut } from '@/app/(auth)/actions';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${BACKEND_URL}/api/creator/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to load profile');
        }

        const data = await res.json();
        setProfile(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone and all your content will be permanently lost."
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${BACKEND_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: session.user.email })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete account');
      }

      // Automatically sign out after successful deletion
      await handleSignOut();
      
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting your account.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 w-full mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-2 text-sm">Manage your account preferences and data.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Info Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-gray-400" />
            Account Overview
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-black/50 p-4 rounded-xl border border-gray-800/50">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <User size={12} /> Username
              </div>
              <div className="text-gray-200 font-medium">{profile?.username || 'Not set'}</div>
            </div>
            
            <div className="bg-black/50 p-4 rounded-xl border border-gray-800/50">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Mail size={12} /> Email
              </div>
              <div className="text-gray-200 font-medium">{profile?.email || 'Not set'}</div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-950/10 border border-red-900/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-red-500 mb-2 flex items-center gap-2">
            <ShieldAlert size={18} />
            Danger Zone
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 text-red-500 font-semibold rounded-xl border border-red-600/20 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
