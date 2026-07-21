'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FcGoogle } from 'react-icons/fc';

// import { Suspense } from 'react';
const AuthButton = ({ children, isLoading, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "w-full flex items-center justify-center font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all duration-300 transform active:scale-95 disabled:transform-none disabled:cursor-not-allowed shadow-lg";

  const variants = {
    primary: "bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white hover:shadow-red-500/70 hover:scale-[1.02]",
    google: "bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:shadow-red-500/30",
  };

  return (
    <button
      disabled={isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);


  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const handleGoogleSignUp = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      // Always use the exact origin the user is currently on to prevent PKCE cookie domain mismatches.
      const redirectBase = window.location.origin;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectBase}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError('Unable to continue with Google right now. Please try again.');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setError('Unable to continue with Google right now. Please try again.');
      setIsGoogleLoading(false);
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
              Sign Up
            </h1>


            {!requiresConfirmation && (
              <>

                <div className="my-4 flex items-center ">
                  <div className="h-px flex-1 bg-gray-700" />
                </div>

                <AuthButton
                  type="button"
                  variant="google"
                  isLoading={isGoogleLoading}
                  onClick={handleGoogleSignUp}
                  disabled={loading || isGoogleLoading}
                >
                  <FcGoogle className="w-6 h-6 mr-2" />
                  Continue with Google
                </AuthButton>

                <div className="text-gray-400 text-center mt-6 text-sm sm:text-base space-y-2">
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