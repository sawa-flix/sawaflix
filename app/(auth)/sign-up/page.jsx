'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '../actions';

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  // Handle auto-redirect when session is created
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        console.log('🟢 Redirecting to dashboard...');
        router.push('/dashboard');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isRedirecting, router]);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await signInWithGoogle();
      // The redirect happens in the server action
    } catch (error) {
      console.error('🔴 Google signup error:', error);
      
      // Check if this is a redirect error (which means success)
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        console.log('🟢 Google signup successful, redirecting...');
        setIsRedirecting(true);
        return;
      }
      
      setError("Google sign up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-inter">
      {/* Background Image with Dark Overlay */}
      <Image
        src="/hero-bg.png"
        alt="Background"
        fill
        quality={100}
        className="z-0 object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/1920x1080/000000/FFFFFF?text=Error+Loading+Image";
          e.currentTarget.srcset = "";
        }}
        priority
      />
      <div className="absolute inset-0 bg-black opacity-70 z-10"></div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-red-500/50">
          <div className="absolute inset-0 z-0 animate-spin-border-gradient" style={{
            background: 'conic-gradient(from var(--angle), #000000 0%, #ff0000 10%, #8b0000 20%, #000000 30%, #000000 100%)',
            borderRadius: '1.5rem',
            padding: '2px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'exclude'
          }}></div>

          <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-3xl p-8 sm:p-10 md:p-12 w-full border border-gray-800">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white text-center mb-8 tracking-wide drop-shadow-[0_0_8px_rgba(255,0,0,0.7)]">
              Sign Up
            </h1>
            
            {isRedirecting && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg animate-fadeIn">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-green-400 text-sm text-center">Redirecting to dashboard...</p>
                </div>
              </div>
            )}
            
            {error && !isRedirecting && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg animate-fadeIn">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
            
            {successMessage && !isRedirecting && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg animate-fadeIn">
                <p className="text-green-400 text-sm text-center">{successMessage}</p>
              </div>
            )}

            {!isRedirecting && (
              <>
                <div className="text-center mb-8">
                  <p className="text-gray-300 text-lg mb-2">Welcome! Sign up with your Google account</p>
                  <p className="text-gray-400 text-sm">Create an account quickly and securely</p>
                </div>

                <div className="space-y-6">
                  <button
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading || isRedirecting}
                    className="w-full flex items-center justify-center px-5 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white hover:bg-gray-800 disabled:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-red-500/30 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                  >
                    {googleLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Connecting with Google...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 mr-3">
                          <svg viewBox="0 0 24 24" className="w-full h-full">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </div>
                        <span className="font-semibold">Sign Up with Google</span>
                      </>
                    )}
                  </button>

                  <div className="text-gray-400 text-center text-sm">
                    By signing up, you agree to our{' '}
                    <Link href="/terms" className="text-red-500 hover:underline hover:text-red-400 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-red-500 hover:underline hover:text-red-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                <div className="text-gray-400 text-center mt-8 text-sm sm:text-base">
                  Already have an account?{' '}
                  <Link href="/login" className="text-red-500 hover:underline hover:text-red-400 transition-colors">
                    Sign In
                  </Link>
                </div>
              </>
            )}

            <div className="mt-6 text-xs text-gray-600 text-center leading-relaxed">
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

        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes rotate-gradient {
          to {
            --angle: 360deg;
          }
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
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}