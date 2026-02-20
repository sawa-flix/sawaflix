'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveCreatorRole } from '../(auth)/actions';
import { CREATOR_ROLES } from '../../types/creator';

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select a creator role to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await saveCreatorRole(selectedRole);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Role save error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600/20 border border-red-600/30 mb-4">
            <span className="text-3xl">🎭</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            What kind of creator are you?
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto">
            Select your primary creator role. This helps us personalize your dashboard and verification process.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {CREATOR_ROLES.map((role) => {
            const isSelected = selectedRole === role.value;
            return (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                disabled={isLoading}
                className={`
                  relative p-5 rounded-2xl border-2 text-left transition-all duration-200
                  hover:scale-[1.02] active:scale-[0.98] cursor-pointer
                  ${isSelected
                    ? 'border-red-500 bg-red-600/10 shadow-lg shadow-red-500/20'
                    : 'border-gray-700/50 bg-gray-900/60 hover:border-gray-600 hover:bg-gray-800/60'
                  }
                  disabled:cursor-not-allowed disabled:opacity-60
                `}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`
                    shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                    ${isSelected ? 'bg-red-600/20' : 'bg-gray-800'}
                  `}>
                    {role.icon}
                  </div>
                  <div>
                    <p className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {role.label}
                    </p>
                    <p className="text-sm text-gray-400 leading-snug">
                      {role.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className="
              w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-2
              px-8 py-4 rounded-xl font-bold text-lg
              bg-red-600 hover:bg-red-500 text-white
              disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-red-500/30
            "
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                Continue
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>

          <p className="text-xs text-gray-600 text-center">
            You can update your creator role later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
