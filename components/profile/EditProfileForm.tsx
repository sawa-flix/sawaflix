'use client';

import React, { useState } from 'react';
import { UserProfile } from './types';
import { Save, X, Loader2, AlertCircle } from 'lucide-react';

interface EditProfileFormProps {
  user: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

/**
 * EditProfileForm Component
 * Form for editing user profile information with validation
 * Handles fullName, email, phoneNumber, region, country, language, bio
 */

function EditProfileForm({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

    if (!formData.country?.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.language?.trim()) {
      newErrors.language = 'Language preference is required';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
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
              : 'border-white/10 focus:border-[#CE1126]'
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
              : 'border-white/10 focus:border-[#CE1126]'
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
              : 'border-white/10 focus:border-[#CE1126]'
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
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#CE1126] focus:outline-none transition"
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
            className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 transition ${
              errors.country
                ? 'border-red-600/50 focus:border-red-600'
                : 'border-white/10 focus:border-[#CE1126]'
            } focus:outline-none`}
            placeholder="United States"
          />
          {errors.country && (
            <p className="text-red-400 text-xs mt-1">{errors.country}</p>
          )}
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
          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white transition ${
            errors.language
              ? 'border-red-600/50 focus:border-red-600'
              : 'border-white/10 focus:border-[#CE1126]'
          } focus:outline-none`}
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
        {errors.language && (
          <p className="text-red-400 text-xs mt-1">{errors.language}</p>
        )}
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
              : 'border-white/10 focus:border-[#CE1126]'
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
          className="flex-1 px-6 py-3 bg-white hover:bg-zinc-100 rounded-xl text-[#0E121A] font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin text-zinc-700" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default EditProfileForm;
