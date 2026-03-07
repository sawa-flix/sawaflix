'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signUpWithPassword, signInWithGoogle } from '@/app/(auth)/actions';

function SignUpContent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    if (role === 'creator') {
      formData.set('category', 'creator');
    } else {
      formData.set('category', 'client');
    }

    try {
      const result = await signUpWithPassword(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (role === 'creator') {
        router.push('/creator/verify');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      await signInWithGoogle(role === 'creator' ? 'creator' : 'client');
    } catch {
      setError('Google sign up failed.');
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
          <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 w-full border border-gray-800">

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4">
              {role === 'creator' ? 'Creator Sign Up' : 'Sign Up'}
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-3">

              <input
                type="email"
                name="email"
                required
                placeholder="Email address"
                className="w-full px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />

              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="Password"
                className="w-full px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone number (optional)"
                className="w-full px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl"
              >
                {loading
                  ? 'Creating...'
                  : role === 'creator'
                    ? 'Create Creator Account'
                    : 'Create Account'}
              </button>

            </form>

            <div className="relative my-4 text-center text-gray-400">or</div>

            <button
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full bg-gray-900 border border-gray-700 text-white py-3 rounded-xl"
            >
              {googleLoading ? 'Connecting...' : 'Sign Up with Google'}
            </button>

            <div className="text-gray-400 text-center mt-4 space-y-2">

              <p>
                {role === 'creator' ? (
                  <>
                    Are you a viewer?{" "}
                    <Link href="/sign-up" className="text-red-500">
                      Sign up as Client
                    </Link>
                  </>
                ) : (
                  <>
                    Want to become a creator?{" "}
                    <Link href="/sign-up?role=creator" className="text-red-500">
                      Creator
                    </Link>
                  </>
                )}
              </p>

              <p>
                Already have an account?{" "}
                <Link href="/login" className="text-red-500">
                  Sign In
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}