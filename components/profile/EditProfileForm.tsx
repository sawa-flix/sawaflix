'use client';

import React, { useState, useRef } from 'react';
import { UserProfile } from './types';
import { Save, X, Loader2, AlertCircle, Upload, Camera, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface EditProfileFormProps {
  user: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

export default function EditProfileForm({
  user,
  onSave,
  onCancel,
}: EditProfileFormProps): React.ReactElement {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    region: user.region,
    country: user.country,
    language: user.language,
    bio: user.bio,
    avatar: user.avatar,
    coverImage: user.coverImage,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || '');
  const [coverPreview, setCoverPreview] = useState<string>(user.coverImage || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file: File, type: 'avatar' | 'cover'): Promise<string | null> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop();
      const path = `${authUser.id}/images/${type}_${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('videos') // Reusing videos bucket since we know it exists from video uploads
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(path);
      return publicUrl;
    } catch (err) {
      console.error(`Upload error for ${type}:`, err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let finalAvatarUrl = formData.avatar;
      let finalCoverUrl = formData.coverImage;

      // Upload files if new ones are selected
      if (avatarFile) {
        const url = await uploadFile(avatarFile, 'avatar');
        if (url) finalAvatarUrl = url;
      }
      if (coverFile) {
        const url = await uploadFile(coverFile, 'cover');
        if (url) finalCoverUrl = url;
      }

      await onSave({
        ...formData,
        avatar: finalAvatarUrl,
        coverImage: finalCoverUrl,
      });
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({
        submit: 'Failed to save profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Quick preview
    const previewUrl = URL.createObjectURL(file);
    
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
    } else {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-600/10 border border-green-600/30 rounded-lg text-green-400 text-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          {successMessage}
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg text-red-400 text-sm flex items-center gap-3">
          <AlertCircle size={16} />
          {errors.submit}
        </div>
      )}

      {/* Profile Images Section */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-300">
          Profile Images
        </label>
        
        {/* Cover Image Upload */}
        <div className="relative w-full h-40 md:h-48 rounded-xl overflow-hidden bg-[#0E121A] border border-white/10 group">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-zinc-900/50 flex flex-col items-center justify-center opacity-50">
              <Camera size={24} className="text-zinc-500 mb-2" />
              <span className="text-xs text-zinc-500 font-medium">Add Cover Photo</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-semibold hover:bg-black/80 transition"
             >
                <Upload size={14} /> Change Cover
             </button>
          </div>
          <input 
            type="file" 
            ref={coverInputRef}
            onChange={(e) => handleFileChange(e, 'cover')}
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Avatar Upload (overlapping cover visually) */}
        <div className="relative -mt-16 ml-6 w-24 h-24 rounded-full border-4 border-[#0B0E14] bg-zinc-800 shadow-xl group">
          {avatarPreview ? (
             <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover rounded-full" />
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center rounded-full text-zinc-500">
                <User size={30} />
             </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
             <Camera size={20} className="text-white" />
          </div>
          <input 
            type="file" 
            ref={avatarInputRef}
            onChange={(e) => handleFileChange(e, 'avatar')}
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 transition ${
            errors.fullName
              ? 'border-red-600/50 focus:border-red-600'
              : 'border-white/10 focus:border-amber-500'
          } focus:outline-none`}
          placeholder="Enter your full name"
        />
        {errors.fullName && (
          <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 transition ${
            errors.email
              ? 'border-red-600/50 focus:border-red-600'
              : 'border-white/10 focus:border-amber-500'
          } focus:outline-none`}
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 transition ${
            errors.phoneNumber
              ? 'border-red-600/50 focus:border-red-600'
              : 'border-white/10 focus:border-amber-500'
          } focus:outline-none`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phoneNumber && (
          <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Region and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Region (Optional)
          </label>
          <input
            type="text"
            name="region"
            value={formData.region || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition"
            placeholder="e.g., North America"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition"
            placeholder="United States"
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Language Preference
        </label>
        <select
          name="language"
          value={formData.language || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#0E121A] border border-white/10 rounded-lg text-white transition focus:border-amber-500 focus:outline-none [&>option]:bg-[#0E121A]"
        >
          <option value="">Select a language...</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Arabic">Arabic</option>
        </select>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Bio (Optional)
        </label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          maxLength={500}
          rows={4}
          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 resize-none transition ${
            errors.bio
              ? 'border-red-600/50 focus:border-red-600'
              : 'border-white/10 focus:border-amber-500'
          } focus:outline-none`}
          placeholder="Tell us about yourself..."
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            {formData.bio?.length || 0} / 500 characters
          </p>
          {errors.bio && <p className="text-red-400 text-xs">{errors.bio}</p>}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-6 py-3 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <X size={18} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-amber-500 rounded-lg text-black font-bold hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin text-black" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
