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
    <form onSubmit={handleSubmit} className="space-y-6 text-[color:var(--foreground)]">
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          <AlertCircle size={16} />
          {errors.submit}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] transition focus:outline-none ${
            errors.fullName
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-[color:var(--border)] focus:border-[color:var(--primary)]'
          }`}
          placeholder="Enter your full name"
        />
        {errors.fullName && (<p className="mt-1 text-xs text-red-500">{errors.fullName}</p>)}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] transition focus:outline-none ${
            errors.email
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-[color:var(--border)] focus:border-[color:var(--primary)]'
          }`}
          placeholder="your.email@example.com"
        />
        {errors.email && (<p className="mt-1 text-xs text-red-500">{errors.email}</p>)}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] transition focus:outline-none ${
            errors.phoneNumber
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-[color:var(--border)] focus:border-[color:var(--primary)]'
          }`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phoneNumber && (<p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>)}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
            Region (Optional)
          </label>
          <input
            type="text"
            name="region"
            value={formData.region || ''}
            onChange={handleChange}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] transition focus:border-[color:var(--primary)] focus:outline-none"
            placeholder="e.g., North America"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] transition focus:outline-none ${
              errors.country
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-[color:var(--border)] focus:border-[color:var(--primary)]'
            }`}
            placeholder="United States"
          />
          {errors.country && (<p className="mt-1 text-xs text-red-500">{errors.country}</p>)}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
          Language Preference
        </label>
        <select
          name="language"
          value={formData.language || ''}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] transition focus:outline-none ${
            errors.language
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-[color:var(--border)] focus:border-[color:var(--primary)]'
          }`}
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
        {errors.language && (<p className="mt-1 text-xs text-red-500">{errors.language}</p>)}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[color:var(--muted-foreground)]">
          Bio (Optional)
        </label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          maxLength={500}
          rows={4}
          className={`w-full resize-none rounded-lg border bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] transition focus:outline-none ${
            errors.bio
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-[color:var(--border)] focus:border-[color:var(--primary)]'
          }`}
          placeholder="Tell us about yourself..."
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-[color:var(--muted-foreground)]">{formData.bio?.length || 0} / 500 characters</p>
          {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
        </div>
      </div>

      <div className="flex gap-4 border-t border-[color:var(--border)] pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[color:var(--border)] px-6 py-3 font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={18} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[color:var(--foreground)] px-6 py-3 font-bold text-[color:var(--background)] shadow-md transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
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
