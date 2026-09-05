'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProfileEditForm, type ProfileEditableFields } from '@/components/profile/ProfileEditForm';
import type { ProfileData } from '@/types/profile';

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push('/login');
          return;
        }

        const { data: row } = await supabase
          .from('users')
          .select(
            `id, username, email, phone, profile_image_url, cover_image_url, bio, created_at,
             region, ethnic_group, village, language_preference, location_region, favored_genres,
             social_links, verification_status, role`
          )
          .eq('id', authUser.id)
          .maybeSingle();

        const socialLinks = row?.social_links ?? null;
        const verificationStatus = (row?.verification_status ?? 'none').toLowerCase();
        const role = (row?.role ?? 'viewer').toLowerCase();

        setProfile({
          id: authUser.id,
          username: row?.username ?? authUser.user_metadata?.full_name ?? 'User',
          email: row?.email ?? authUser.email ?? null,
          bio: row?.bio ?? null,
          profileImageUrl: row?.profile_image_url ?? null,
          coverImageUrl: row?.cover_image_url ?? null,
          createdAt: row?.created_at ?? authUser.created_at ?? new Date().toISOString(),
          verified: verificationStatus === 'approved',
          region: row?.location_region ?? row?.region ?? null,
          village: row?.village ?? null,
          ethnicGroup: row?.ethnic_group ?? null,
          languagePreference: row?.language_preference ?? null,
          favoredGenres: row?.favored_genres ?? [],
          socialLinks,
          website: socialLinks?.website ?? null,
          phone: row?.phone ?? null,
          role: row?.role ?? null,
          isApprovedCreator: role === 'admin' || verificationStatus === 'approved',
          isPendingCreator: role === 'creator' && verificationStatus === 'pending',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    // supabase client instance is stable across renders; router is provided by Next.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (fields: ProfileEditableFields) => {
    setSuccessMessage('');

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Not authenticated');

    // Persists every field the form actually collects.
    const { error } = await supabase
      .from('users')
      .update({
        username: fields.username,
        bio: fields.bio,
        phone: fields.phone,
        region: fields.region,
        village: fields.village,
        language_preference: fields.languagePreference,
        favored_genres: fields.favoredGenres,
        social_links: fields.socialLinks,
      })
      .eq('id', authUser.id);

    if (error) throw error;

    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => router.push('/dashboard/profile'), 1200);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E14]">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto mb-4 animate-spin text-[#CE1126]" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E14]">
        <p className="text-gray-400">Unable to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080C] pb-24 font-sans text-white">
      <div className="mx-auto max-w-3xl px-3.5 py-6 sm:px-6 sm:py-10 md:px-8">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/dashboard/profile"
            className="group mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Profile
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Edit <span className="text-[#CE1126]">Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">Update your personal information and cultural preferences</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-600/30 bg-green-600/10 p-4 text-green-400">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            {successMessage}
          </div>
        )}

        <div className="rounded-xl border border-white/5 bg-[#0E121A] p-6 md:p-8">
          <ProfileEditForm profile={profile} onSave={handleSave} onCancel={() => router.push('/dashboard/profile')} />
        </div>
      </div>
    </div>
  );
}
