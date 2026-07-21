'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkAuth } from '@/app/(auth)/actions';
import { createClient } from '@/utils/supabase/client';
import { FcGoogle } from 'react-icons/fc';

import { Suspense } from 'react';

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

function LoginContent() {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      // Always use the exact origin the user is currently on to prevent PKCE cookie domain mismatches.
      const redirectBase = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectBase}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            
          },
          scope:'https://www.googleapi.com/auth/youtube.force-ssl'

        },
      });

      if (error) {
        setError('Unable to continue with Google right now. Please try again.');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setError('Unable to continue with Google right now. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => { 
    const syncTokens = async()=>{
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if(session?.provider_token){
        console.log("Syncing google tokens...")
        try{await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/sync-tokens`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json' },
          body:JSON.stringify({
            provider_token: session.provider_token,
            provider_refresh_token: session.provider_refresh_token,
          }),
        },
      
      );
    }catch(err){
          console.error("Failed to sync tokens:", err);
      }
    }
      }

    syncTokens()
  }, [])

  // Removed auto-redirect to allow users to see the login page even if logged in
  // Check if user is already logged in (optional check, but don't force redirect now)
  useEffect(() => {
    async function checkIfLoggedIn() {
      try {
        const result = await checkAuth();
        if (result.authenticated) {
          console.log('🟢 User already logged in, role:', result.role);
          const targetPath = result.role === 'admin' ? '/admin' : '/dashboard';
          router.push(targetPath);
        }
      } catch (err) {
        console.log('Not logged in');
      }
    }
    checkIfLoggedIn();
  }, [router]);

  // Handle URL messages (errors, signs out)
  useEffect(() => {
    const message = searchParams.get('message');
    const errorParam = searchParams.get('error');

    if (message === 'signed_out') {
      setSuccessMessage('You have been signed out successfully.');
    } else if (errorParam) {
      // Map raw Supabase/callback error codes to human-friendly messages
      const errorMessages = {
        auth_failed: 'Sign-in failed. Please try again or use a different method.',
        auth_config_missing: 'Authentication is not configured correctly. Please contact support.',
        callback_error: 'An error occurred during sign-in. Please try again.',
        signout_failed: 'Sign-out failed. Please try again.',
      };
      setError(errorMessages[errorParam] || decodeURIComponent(errorParam));
    }

    if (message || errorParam) {
      // Clean URL after consuming messages
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('message');
      newUrl.searchParams.delete('error');
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);


  return (
    <div className="h-screen w-full relative overflow-hidden font-inter">
      <Image
        src="/hero-bg.png"
        alt="Background"
        fill
        sizes="100vw"
        quality={100}
        className="z-0 object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black opacity-70 z-10"></div>

      <div className="relative z-20 flex items-center justify-center h-screen px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-red-500/50">
          {/* Glowing Border Animation */}
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
              Sign In
            </h1>

            {/* Success/Error Alerts */}
            <div className="space-y-4 mb-4">
              {isRedirecting && (
                <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg animate-fadeIn flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-green-400 text-sm">Logging in... Redirecting...</p>
                </div>
              )}

              {successMessage && !isRedirecting && (
                <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg animate-fadeIn text-green-400 text-sm text-center">
                  {successMessage}
                </div>
              )}

              {error && !isRedirecting && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg animate-fadeIn text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>

            {!isRedirecting && (
              <>

                <AuthButton
                  type="button"
                  variant="google"
                  isLoading={isGoogleLoading}
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                >
                  <FcGoogle className="w-6 h-6 mr-2" />
                  Continue with Google
                </AuthButton>

                <div className="text-gray-400 text-center mt-6 text-sm sm:text-base">
                  <p>
                    Are you new to SawaFlix?{" "}
                    <Link
                      href="/sign-up"
                      className="text-red-500 hover:underline hover:text-red-400 transition-colors font-medium"
                    >
                      Sign up
                    </Link>
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

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes rotate-gradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-spin-border-gradient {
          animation: rotate-gradient 8s linear infinite;
          transform-origin: center;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #111827 inset !important;
          box-shadow: 0 0 0 1000px #111827 inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}