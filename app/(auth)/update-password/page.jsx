'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import { Eye, EyeOff, ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';

function UpdatePasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initSession = async () => {
      setIsVerifying(true);
      const supabase = createClient();
      const code = searchParams.get('code');
      const token_hash = searchParams.get('token_hash');

      try {
        if (code) {
          // Standard PKCE code from our callback redirect
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError.message);
            setError('This reset link is invalid or has expired. Please request a new one.');
            setIsVerifying(false);
            return;
          }
        } else if (token_hash) {
          // Older token_hash style reset links
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'recovery',
          });
          if (verifyError) {
            console.error('Token hash verify error:', verifyError.message);
            setError('This reset link is invalid or has expired. Please request a new one.');
            setIsVerifying(false);
            return;
          }
        }

        // Check we now have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('No active session. Please use the link from your reset email.');
          setIsVerifying(false);
          return;
        }

        setSessionReady(true);
      } catch (err) {
        console.error('Session init error:', err);
        setError('Something went wrong verifying your reset link. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    initSession();
  }, [searchParams]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        console.error('Password update error:', updateError.message);
        if (updateError.message.includes('Auth session missing')) {
          setError('Session expired. Please request a new password reset link.');
        } else {
          setError(updateError.message);
        }
        return;
      }

      setMessage('Password updated successfully! Redirecting to login...');

      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login?message=password_updated_success');
      }, 2000);

    } catch (err) {
      console.error('Password update exception:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E14]">
        <div className="w-full max-w-md p-8 space-y-6 bg-black/40 backdrop-blur-md rounded-3xl text-white border border-gray-800 shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/10 border border-red-600/20 mb-4">
              <Lock size={28} className="text-red-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold">Verifying Reset Link</h1>
            <p className="text-gray-400 mt-2 text-sm">Please wait a moment...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-black/40 backdrop-blur-md rounded-3xl text-white border border-gray-800 shadow-2xl">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/10 border border-red-600/20 mb-4">
            <Lock size={28} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Set New Password</h1>
          {sessionReady && !message && (
            <p className="text-gray-400 mt-2 text-sm">
              Enter your new password below. Minimum 6 characters.
            </p>
          )}
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-green-400 text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 text-sm font-medium">{error}</p>
              {(error.includes('expired') || error.includes('invalid') || error.includes('new password reset')) && (
                <button
                  onClick={() => router.push('/login')}
                  className="mt-2 text-red-300 hover:text-white underline text-xs font-medium transition-colors"
                >
                  Request a new reset link
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form - only show when session is ready and no success message */}
        {sessionReady && !message && (
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {/* New Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-5 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent pr-12 disabled:opacity-50 transition-all"
                required
                minLength={6}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 disabled:opacity-30 transition-colors"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-5 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent pr-12 disabled:opacity-50 transition-all"
                required
                minLength={6}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 disabled:opacity-30 transition-colors"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="flex items-center gap-2">
                <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 8 ? 'bg-green-500' : password.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className={`text-xs ${password.length >= 8 ? 'text-green-400' : password.length >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {password.length >= 8 ? 'Strong' : password.length >= 6 ? 'Good' : 'Too short'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-600/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating Password...
                </span>
              ) : 'Update Password'}
            </button>
          </form>
        )}

        {/* Back to login */}
        <div className="text-center pt-2 border-t border-gray-800">
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E14]">
        <div className="w-full max-w-md p-8 bg-black/40 backdrop-blur-md rounded-3xl text-white border border-gray-800">
          <h1 className="text-2xl font-bold text-center">Loading...</h1>
        </div>
      </div>
    }>
      <UpdatePasswordContent />
    </Suspense>
  );
}