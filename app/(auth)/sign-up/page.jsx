'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signUpWithPassword, signInWithGoogle } from '@/app/(auth)/actions';

import { Suspense } from 'react';

/**
 * AuthButton Component
 * Handles the loading state and styling for auth buttons
 */
const AuthButton = ({ children, isLoading, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "w-full flex items-center justify-center font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 transform active:scale-95 disabled:transform-none disabled:cursor-not-allowed shadow-lg";

  const variants = {
    primary: "bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white hover:shadow-red-500/70 hover:scale-[1.02]",
    google: "bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:shadow-red-500/30",
  };

  return (
    <button
      disabled={isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
};

function SignUpContent() {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role'); // ?role=creator

  /**
   * Handle Email Sign Up
   */
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Reset state
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    // Client-side validation
    const password = formData.get('password');
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // Ensure role-based category is explicitly set in FormData
    const category = role === 'creator' ? 'creator' : 'client';
    formData.set('category', category);

    try {
      const result = await signUpWithPassword(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        if (result.requiresEmailConfirmation) {
          setRequiresConfirmation(true);
          setSuccessMessage(result.message || 'Please check your email to confirm your account.');
          // Don't set loading to false here to keep the UI in "success" state
        } else {
          setSuccessMessage('Sign up successful! Redirecting...');
          // Redirect based on role logic from result or state
          setTimeout(() => {
            if (role === 'creator') {
              router.push('/creator/verify');
            } else {
              router.push('/dashboard');
            }
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Handle Google Sign Up
   */
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // signInWithGoogle handles redirect internally
      await signInWithGoogle();
    } catch (err) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }
      console.error('Google OAuth error:', err);
      setError('Google sign up failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden font-inter">
      <Image
        src="/hero-bg.png"
        alt="Background"
        fill
        quality={100}
        className="z-0 object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black opacity-70 z-10"></div>

      <div className="relative z-20 flex items-center justify-center h-screen px-4 py-4">
        <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-red-500/50">
          <div className="absolute inset-0 z-0 animate-spin-border-gradient" style={{
            background: 'conic-gradient(from var(--angle), #000000 0%, #ff0000 10%, #8b0000 20%, #000000 30%, #000000 100%)',
            borderRadius: '1.5rem',
            padding: '2px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'exclude'
          }}></div>

          <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 w-full border border-gray-800">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4 tracking-wide drop-shadow-[0_0_8px_rgba(255,0,0,0.7)]">
              {role === 'creator' ? 'Creator Sign Up' : 'Sign Up'}
            </h1>

            {/* Status Messages */}
            <div className="space-y-4 mb-4">
              {successMessage && (
                <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center animate-fadeIn ${requiresConfirmation
                  ? 'bg-blue-900/40 border-blue-700 text-blue-200'
                  : 'bg-green-900/40 border-green-700 text-green-200'
                  }`}>
                  <div className="flex items-center gap-2">
                    {requiresConfirmation ? (
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <p className="font-bold">{requiresConfirmation ? 'Check Your Email' : 'Success!'}</p>
                  </div>
                  <p className="text-sm opacity-90">{successMessage}</p>
                  {requiresConfirmation && (
                    <p className="text-xs mt-2 text-blue-300 italic">This message cannot be dismissed until you confirm your email.</p>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg animate-fadeIn text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>

            {/* ===== Signup Form (Hidden on confirmation state) ===== */}
            {!requiresConfirmation && (
              <>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email address"
                    autoComplete="email"
                    className="w-full px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-300 shadow-inner shadow-gray-950"
                    disabled={loading || googleLoading}
                  />

                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Password"
                    autoComplete="new-password"
                    className="w-full px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-300 shadow-inner shadow-gray-950"
                    disabled={loading || googleLoading}
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number (optional)"
                    autoComplete="tel"
                    className="w-full px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-300 shadow-inner shadow-gray-950"
                    disabled={loading || googleLoading}
                  />

                  <AuthButton type="submit" isLoading={loading}>
                    {role === 'creator' ? 'Create Creator Account' : 'Create Account'}
                  </AuthButton>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black/85 text-gray-400 font-medium whitespace-nowrap">or</span>
                  </div>
                </div>

                <AuthButton
                  onClick={handleGoogleSignUp}
                  variant="google"
                  isLoading={googleLoading}
                  disabled={loading}
                >
                  <div className="w-6 h-6 mr-3">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  Sign Up with Google
                </AuthButton>

                <div className="text-gray-400 text-center mt-6 text-sm sm:text-base space-y-2">
                  <p>
                    {role === 'creator' ? (
                      <>Are you a viewer? <Link href="/sign-up" className="text-red-500 hover:underline">Sign up as Client</Link></>
                    ) : (
                      <>Want to become a creator? <Link href="/sign-up?role=creator" className="text-red-500 hover:underline">Creator</Link></>
                    )}
                  </p>
                  <p>
                    Already have an account?{' '}
                    <Link href="/login" className="text-red-500 hover:underline font-medium">Sign In</Link>
                  </p>
                </div>
              </>
            )}

            <div className="mt-8 text-xs text-gray-600 text-center leading-relaxed">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
              <button
                className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                onClick={() => window.open('https://www.google.com/recaptcha/about/', '_blank')}
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotate-gradient { to { --angle: 360deg; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin-border-gradient { animation: rotate-gradient 8s linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #111827 inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
