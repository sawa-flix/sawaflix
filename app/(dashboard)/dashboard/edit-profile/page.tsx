'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { UserProfile } from '@/components/profile/types';
import { DEFAULT_USER_PROFILE } from '@/components/profile/constants';
import { ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Edit Profile Page
 * Allows users to edit their profile information
 * Integrates with Supabase for authentication and data updates
 */

export default function EditProfilePage(): React.ReactElement {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/login');
          return;
        }

        // Fetch profile from database
        const { data: profileData, error } = await supabase
          .from('users')
          .select(
            'id, username, email, profile_image_url, cover_image_url, bio, created_at'
          )
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setUser({
            ...DEFAULT_USER_PROFILE,
            id: authUser.id,
            email: authUser.email || '',
            fullName: authUser.user_metadata?.full_name || 'User',
          });
        } else if (profileData) {
          setUser({
            ...DEFAULT_USER_PROFILE,
            id: authUser.id,
            email: authUser.email || '',
            fullName: profileData.username || 'User',
            avatar: profileData.profile_image_url || DEFAULT_USER_PROFILE.avatar,
            coverImage:
              profileData.cover_image_url || DEFAULT_USER_PROFILE.coverImage,
            bio: profileData.bio || DEFAULT_USER_PROFILE.bio,
            joinDate: new Date(profileData.created_at).toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'long',
              }
            ),
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  // Handle save
  const handleSave = async (data: Partial<UserProfile>) => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error('Not authenticated');
      }

      // Update profile in database
      const { error } = await supabase
        .from('users')
        .update({
          username: data.fullName,
          email: data.email,
          bio: data.bio,
          profile_image_url: data.avatar,
          cover_image_url: data.coverImage,
        })
        .eq('id', authUser.id);

      if (error) {
        throw error;
      }

      setSuccessMessage('Profile updated successfully!');
      setUser((prev) =>
        prev ? { ...prev, ...data } : null
      );

      // Redirect after success
      setTimeout(() => {
        router.push('/dashboard/profile');
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-[#CE1126] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <p className="text-gray-400">Unable to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080C] text-white font-sans pb-32" style={{ zoom: '0.85' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Profile
          </Link>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Edit <span className="text-[#CE1126]">Profile</span>
            </h1>
            <p className="text-gray-400">
              Update your personal information and preferences
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg text-green-400 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-600/10 border border-red-600/30 rounded-lg text-red-400 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            {errorMessage}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-[#0E121A] border border-white/5 rounded-xl p-6 md:p-8">
          <EditProfileForm
            user={user}
            onSave={handleSave}
            onCancel={() => router.push('/dashboard/profile')}
          />
        </div>
      </div>
    </div>
  );
}

