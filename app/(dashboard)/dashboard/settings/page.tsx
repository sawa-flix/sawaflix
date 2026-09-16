'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { BACKEND_URL } from '@/lib/apiConfig';
import { 
  Loader2, 
  AlertTriangle, 
  User, 
  Mail, 
  ShieldAlert, 
  Bell, 
  Globe, 
  Film, 
  LogOut, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Sliders
} from 'lucide-react';
import { handleSignOut } from '@/app/(auth)/actions';
import { useTheme } from '@/components/ThemeProvider';

const THEME_OPTIONS = [
  { value: 'system' as const, label: 'System default' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
];

interface UserProfile {
  id?: string;
  username?: string | null;
  email?: string | null;
  profile_image_url?: string | null;
  role?: string | null;
  verification_status?: string | null;
  created_at?: string | null;
  location_region?: string | null;
  region?: string | null;
  language_preference?: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const { preference, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const themeOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/dashboard');
          return;
        }

        // Fetch user data from public.users
        const { data: userRow } = await supabase
          .from('users')
          .select('id, username, email, profile_image_url, role, verification_status, created_at, location_region, region, language_preference')
          .eq('id', session.user.id)
          .maybeSingle();

        setProfile({
          id: session.user.id,
          username: userRow?.username || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: userRow?.email || session.user.email || 'Not set',
          profile_image_url: userRow?.profile_image_url || session.user.user_metadata?.avatar_url || null,
          role: userRow?.role || 'viewer',
          verification_status: userRow?.verification_status || 'none',
          created_at: userRow?.created_at || session.user.created_at,
          location_region: userRow?.location_region || userRow?.region || 'Cameroon',
          language_preference: userRow?.language_preference || 'English',
        });

        if ('Notification' in window) {
          setPushNotificationEnabled(Notification.permission === 'granted');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported in this browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      alert('Notifications are already enabled on your device.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushNotificationEnabled(permission === 'granted');
    } catch (e) {
      console.error('Error requesting notification permission:', e);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your SawaFlix account? This action cannot be undone and all your content will be permanently lost."
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
        const errData = await res.json().catch(() => ({}));
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
      <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[color:var(--primary)]" size={36} />
          <p className="text-[color:var(--muted-foreground)] text-sm font-medium">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-[color:var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders size={20} className="text-[color:var(--primary)]" />
              <h1 className="text-2xl sm:text-3xl font-black text-[color:var(--foreground)] tracking-tight">Account & Settings</h1>
            </div>
            <p className="text-[color:var(--muted-foreground)] text-sm">Manage your SawaFlix preferences, cultural profile, and account security.</p>
          </div>

          <Link
            href="/dashboard/edit-profile"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)] text-[color:var(--background)] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] shrink-0"
          >
            <User size={15} />
            <span>Edit Full Profile</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[color:var(--danger-bg)] border border-[color:var(--danger-fg)]/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="text-[color:var(--danger-fg)] shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-[color:var(--danger-fg)]">{error}</p>
          </div>
        )}

        <div className="space-y-6">

          {/* Account Overview Card */}
          <div className="bg-[color:var(--surface-elevated)] border border-[color:var(--border)] rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,15,15,0.04)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[color:var(--foreground)] flex items-center gap-2.5">
                <User size={18} className="text-[color:var(--primary)]" />
                Account Overview
              </h2>
              {profile?.verification_status === 'approved' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[color:var(--success-bg)] text-[color:var(--success-fg)] border border-[color:var(--success-fg)]/25">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-[color:var(--background-secondary)] border border-[color:var(--border)] mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[color:var(--background-secondary)] to-[color:var(--surface)] border border-[color:var(--border)] shrink-0 flex items-center justify-center">
                {profile?.profile_image_url ? (
                  <Image src={profile.profile_image_url} alt={profile.username || 'User'} fill className="object-cover" unoptimized />
                ) : (
                  <Image src="/logos_and_pwas/android-chrome-192x192.png" alt="SawaFlix" width={32} height={32} className="object-contain" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[color:var(--foreground)] truncate">{profile?.username}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-[color:var(--surface-hover)] text-[color:var(--foreground-secondary)] font-medium capitalize">
                    {profile?.role || 'Viewer'}
                  </span>
                </div>
                <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5 truncate">{profile?.email}</p>
                <p className="text-[11px] text-[color:var(--muted-foreground)] mt-1">Region: {profile?.location_region || 'Cameroon'}</p>
              </div>
              <Link 
                href="/dashboard/profile"
                className="text-xs font-semibold text-[color:var(--primary)] hover:text-[color:var(--primary-strong)] flex items-center gap-1 shrink-0 transition-colors"
              >
                View Public Profile <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          {/* Preferences & Experience Card */}
          <div className="bg-[color:var(--surface-elevated)] border border-[color:var(--border)] rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,15,15,0.04)]">
            <h2 className="text-base font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2.5">
              <Sparkles size={18} className="text-[color:var(--warning-fg)]" />
              App & Streaming Preferences
            </h2>

            <div className="space-y-4">
              {/* Appearance */}
              <div className="p-4 rounded-xl bg-[color:var(--background-secondary)] border border-[color:var(--border)]">
                <div>
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Appearance</h4>
                  <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Choose how SawaFlix looks, or match your device.</p>
                </div>
                {themeMounted && (
                  <div
                    role="radiogroup"
                    aria-label="Theme"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4"
                    onKeyDown={(event) => {
                      const currentIndex = THEME_OPTIONS.findIndex((option) => option.value === preference);
                      let nextIndex = currentIndex;

                      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                        nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
                      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                        nextIndex = (currentIndex - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
                      } else if (event.key !== 'Home' && event.key !== 'End') {
                        return;
                      }

                      if (event.key === 'Home') nextIndex = 0;
                      if (event.key === 'End') nextIndex = THEME_OPTIONS.length - 1;
                      event.preventDefault();
                      const nextOption = THEME_OPTIONS[nextIndex];
                      setTheme(nextOption.value);
                      themeOptionRefs.current[nextIndex]?.focus();
                    }}
                  >
                    {THEME_OPTIONS.map((option) => {
                      const isSelected = preference === option.value;
                      return (
                        <button
                          key={option.value}
                          ref={(element) => {
                            themeOptionRefs.current[THEME_OPTIONS.indexOf(option)] = element;
                          }}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={isSelected ? 0 : -1}
                          onClick={() => setTheme(option.value)}
                          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] ${
                            isSelected
                              ? 'border-[color:var(--primary)] bg-[color:var(--primary-soft)] text-[color:var(--foreground)]'
                              : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface-hover)]'
                          }`}
                        >
                          <span>{option.label}</span>
                          <span
                            aria-hidden="true"
                            className={`h-3.5 w-3.5 rounded-full border-2 ${
                              isSelected
                                ? 'border-[color:var(--primary)] bg-[color:var(--primary)]'
                                : 'border-[color:var(--muted-foreground)]'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Push Notifications Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--background-secondary)] border border-[color:var(--border)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[color:var(--surface)] text-[color:var(--muted-foreground)] shrink-0">
                    <Bell size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Push Notifications</h4>
                    <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Receive alerts when new music, movies, or community stories release.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pushNotificationEnabled 
                      ? 'bg-[color:var(--success-bg)] text-[color:var(--success-fg)] border border-[color:var(--success-fg)]/20' 
                      : 'bg-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)] text-[color:var(--background)] shadow'
                  }`}
                >
                  {pushNotificationEnabled ? 'Enabled' : 'Enable'}
                </button>
              </div>

              {/* Autoplay Reels */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--background-secondary)] border border-[color:var(--border)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[color:var(--surface)] text-[color:var(--muted-foreground)] shrink-0">
                    <Film size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Autoplay Reels & Videos</h4>
                    <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Automatically stream preview videos as you scroll through feeds.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    autoplayEnabled ? 'bg-[color:var(--primary)] justify-end' : 'bg-[color:var(--secondary)] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Language Preference */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--background-secondary)] border border-[color:var(--border)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[color:var(--surface)] text-[color:var(--muted-foreground)] shrink-0">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Language & Regional Content</h4>
                    <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Preferred language: {profile?.language_preference || 'English'}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/edit-profile"
                  className="text-xs font-semibold text-[color:var(--foreground)] hover:text-[color:var(--foreground)] px-3 py-1.5 rounded-lg bg-[color:var(--surface)] hover:bg-[color:var(--surface-hover)] border border-[color:var(--border)] transition-colors"
                >
                  Change
                </Link>
              </div>
            </div>
          </div>

          {/* Account Actions & Sign Out */}
          <div className="bg-[color:var(--surface-elevated)] border border-[color:var(--border)] rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,15,15,0.04)]">
            <h2 className="text-base font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2.5">
              <LogOut size={18} className="text-[color:var(--muted-foreground)]" />
              Session & Logout
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[color:var(--background-secondary)] border border-[color:var(--border)]">
              <div>
                <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Sign Out of SawaFlix</h4>
                <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">Securely log out of this session on your current device.</p>
              </div>
              <button
                type="button"
                onClick={() => handleSignOut()}
                className="px-5 py-2 rounded-xl bg-[color:var(--surface)] hover:bg-[color:var(--surface-hover)] text-[color:var(--foreground)] font-bold text-xs transition-colors cursor-pointer border border-[color:var(--border)] active:scale-[0.98]"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[color:var(--danger-bg)] border border-[color:var(--danger-fg)]/25 rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_20px_rgba(220,38,38,0.05)]">
            <h2 className="text-base font-bold text-[color:var(--danger-fg)] mb-2 flex items-center gap-2">
              <ShieldAlert size={18} />
              Danger Zone
            </h2>
            <p className="text-xs sm:text-sm text-[color:var(--muted-foreground)] mb-6 leading-relaxed">
              Permanently delete your account, uploaded media, watch history, and personal preferences. This action cannot be reversed.
            </p>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[color:var(--primary)] hover:bg-[color:var(--primary-strong)] text-white font-bold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 active:scale-[0.98]"
            >
              {deleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Deleting Account…</span>
                </>
              ) : (
                'Permanently Delete Account'
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
