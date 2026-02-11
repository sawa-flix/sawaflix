'use client'

import React, { ChangeEvent, useRef, useState, useTransition, useEffect } from 'react';
import { uploadImage } from '../../utils/supabase/storage/client';
import Image from 'next/image';
import { createClient } from '../../utils/supabase/client';
import { User } from '@supabase/supabase-js';

type Profile = {
  profile_image_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  full_name: string | null;
};

// Initial state for the form
const initialState: Profile = {
  profile_image_url: null,
  cover_image_url: null,
  bio: '',
  full_name: '',
};

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(initialState);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  // Fetch the user session on component load
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch the existing user profile data
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, profile_image_url, cover_image_url, bio')
          .eq('id', user.id)
          .single();

        if (userData) {
          setProfile({
            profile_image_url: userData.profile_image_url,
            cover_image_url: userData.cover_image_url,
            bio: userData.bio,
            full_name: userData.full_name,
          });
        }
      }
    };
    fetchUser();
  }, []);

  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfile((prev) => ({
        ...prev,
        profile_image_url: URL.createObjectURL(file),
      }));
    }
  };

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setProfile((prev) => ({
        ...prev,
        cover_image_url: URL.createObjectURL(file),
      }));
    }
  };

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setProfile((prev) => ({
      ...prev,
      bio: e.target.value,
    }));
  };

    const handleFullNameChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setProfile((prev) => ({
      ...prev,
      full_name: e.target.value,
    }));
  };

  const handleUpdateProfile = () => {
    if (!user) {
      alert('You must be logged in to update your profile.');
      return;
    }

    startTransition(async () => {
      let profileImageUrl = profile.profile_image_url;
      let coverImageUrl = profile.cover_image_url;

      // Upload profile image if a new one is selected
      if (profileImageFile) {
        const { imageUrl, error } = await uploadImage({
          file: profileImageFile,
          bucket: 'images',
          folder: `profiles/${user.id}/`,
        });
        if (error) {
          console.error('Profile image upload failed:', error);
          alert('Failed to upload profile image.');
          return;
        }
        profileImageUrl = imageUrl;
      }

      // Upload cover image if a new one is selected
      if (coverImageFile) {
        const { imageUrl, error } = await uploadImage({
          file: coverImageFile,
          bucket: 'images',
          folder: `covers/${user.id}/`,
        });
        if (error) {
          console.error('Cover image upload failed:', error);
          alert('Failed to upload cover image.');
          return;
        }
        coverImageUrl = imageUrl;
      }

      // Update the user's profile in the database
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from('users')
        .update({
          profile_image_url: profileImageUrl,
          cover_image_url: coverImageUrl,
          bio: profile.bio,
        })
        .eq('id', user.id);

      if (dbError) {
        console.error('Database update failed:', dbError);
        alert('Failed to update profile in the database.');
        return;
      }

      alert('Profile updated successfully!');
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-6 text-black">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Update Profile</h1>

        {/* Cover Image Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Cover Image</label>
          <div
            className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center relative"
            onClick={() => coverImageRef.current?.click()}
          >
            {profile.cover_image_url ? (
              <Image
                src={profile.cover_image_url}
                alt="Cover Image"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
                priority={false}
                unoptimized
              />
            ) : (
              <span className="text-gray-500">Click to upload cover image</span>
            )}
          </div>
          <input type="file" hidden ref={coverImageRef} onChange={handleCoverImageChange} accept="image/*" />
        </div>

        {/* Profile Image Section */}
        <div className="mb-6 flex flex-col items-center">
          <label className="block text-gray-700 font-semibold mb-2">Profile Image</label>
          <div
            className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden cursor-pointer flex items-center justify-center relative"
            onClick={() => profileImageRef.current?.click()}
          >
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt="Profile Image"
                fill
                sizes="128px"
                className="object-cover"
                priority={false}
                unoptimized
              />
            ) : (
              <span className="text-gray-500 text-sm">Click to upload</span>
            )}
          </div>
          <input type="file" hidden ref={profileImageRef} onChange={handleProfileImageChange} accept="image/*" />
        </div>
        {/* full name section */}
        <div className="mb-6">
          <label htmlFor="full_name" className="block text-gray-700 font-semibold mb-2">Full name</label>
          <textarea
            id="full_name"
            value={profile.full_name ?? ''}
            onChange={handleFullNameChange}
            className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Update your user name."
          ></textarea>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <label htmlFor="bio" className="block text-gray-700 font-semibold mb-2">Bio</label>
          <textarea
            id="bio"
            value={profile.bio ?? ''}
            onChange={handleBioChange}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us a little about yourself..."
          ></textarea>
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
        >
          {isPending ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;