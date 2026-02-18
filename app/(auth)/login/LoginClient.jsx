'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithPassword, signInWithGoogle, resetPassword, checkAuth } from '../actions';

const SubmitButton = ({ children, isLoading }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full flex items-center justify-center bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white font-bold py-3 sm:py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-red-500/70 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
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

export default function LoginPage() {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);
  const [email, setEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  // Check if user is already logged in
  useEffect(() => {
    async function checkIfLoggedIn() {
      try {
        const result = await checkAuth();
        if (result.authenticated) {
          console.log('🟢 User already logged in, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (err) {
        console.log('Not logged in');
      }
    }

    checkIfLoggedIn();
  }, [router]);

  // Handle success messages from URL parameters
  useEffect(() => {
    const message = searchParams.get('message');
    const errorParam = searchParams.get('error');

    if (message === 'password_updated_success' || message === 'password_updated') {
      setSuccessMessage('✅ Password updated successfully! You can now login with your new password.');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('message');
      newUrl.searchParams.delete('error');
      router.replace(newUrl.pathname + newUrl.search);
    } else if (message === 'signed_out') {
      setSuccessMessage('You have been signed out successfully.');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('message');
      router.replace(newUrl.pathname + newUrl.search);
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setResetMessage(null);
    setIsLoading(true);
    setIsRedirecting(false);
    hasRedirected.current = false;

    const formData = new FormData(e.currentTarget);

    try {
      console.log('🟡 Attempting login...');
      const result = await signInWithPassword(formData);

      if (result?.error) {
        // Show the error message
        setError(result.error);
      } else if (result?.success) {
        // Login successful - redirect to dashboard
        console.log('🟢 Login successful, redirecting to dashboard');
        setIsRedirecting(true);
        hasRedirected.current = true;

        // Short delay to show loading state
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);

      } else {
        // Unexpected response
        setError("Login failed. Please try again.");
      }

    } catch (err) {
      // Check if this error is actually a successful redirect
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        console.log('🟢 Login successful (NEXT_REDIRECT caught)');
        setIsRedirecting(true);
        hasRedirected.current = true;
        // Don't show error - redirect is happening
        return;
      }

      // This is a real error
      console.error('Login error:', err);

      if (err?.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('Please confirm your email before logging in.');
      } else if (err?.message?.includes('rate limit')) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      // Only stop loading if we're not redirecting
      if (!hasRedirected.current) {
        setIsLoading(false);
      }
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setResetMessage(null);
    setIsResetting(true);

    if (!email) {
      setError('Please enter your email to reset the password.');
      setIsResetting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setIsResetting(false);
      return;
    }

    try {
      const result = await resetPassword({ email });

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setResetMessage(result.message || '✅ Password reset link sent to your email.');
        setEmail('');
      } else {
        setResetMessage('✅ Password reset link sent to your email.');
        setEmail('');
      }
    } catch (err) {
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }
      setError('Failed to send reset email. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setResetMessage(null);
    setIsGoogleLoading(true);

    try {
      console.log('🟡 Initiating Google sign-in...');
      // Call the server action - it will redirect automatically
      await signInWithGoogle();
      // If we reach here, something went wrong
      setError('Google sign in initiation failed. Please try again.');
      setIsGoogleLoading(false);
    } catch (err) {
      // NEXT_REDIRECT is expected and means redirect is happening
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        console.log('🟢 Google OAuth redirect in progress');
        return; // Let the redirect happen
      }

      console.error('Google sign in error:', err);
      setError('Google sign in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-inter">
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
              Sign In
            </h1>

            {isRedirecting && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg animate-fadeIn">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-green-400 text-sm text-center">Login successful! Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            {successMessage && !isRedirecting && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg animate-fadeIn">
                <p className="text-green-400 text-sm text-center">{successMessage}</p>
              </div>
            )}

            {error && !isRedirecting && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg animate-fadeIn">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {resetMessage && !isRedirecting && (
              <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg animate-fadeIn">
                <p className="text-blue-400 text-sm text-center">{resetMessage}</p>
              </div>
            )}

            {!isRedirecting && (
              <>
                <form onSubmit={handleFormSubmit} className="space-y-6 sm:space-y-8">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-3 sm:py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-300 shadow-inner shadow-gray-950"
                      required
                      disabled={isLoading || isGoogleLoading}
                      autoComplete="email"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      className="w-full px-5 py-3 sm:py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-300 shadow-inner shadow-gray-950 pr-12"
                      required
                      disabled={isLoading || isGoogleLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isGoogleLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors disabled:cursor-not-allowed"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395m-4.64-2.115a4.5 4.5 0 113.35-6.425M21.75 12C20.462 7.662 16.44 4.5 12 4.5c-.993 0-1.953.138-2.863.395m-4.64-2.115a4.5 4.5 0 113.35-6.425" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm sm:text-base">
                    <label className="flex items-center text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        className="w-5 h-5 mr-2 appearance-none border border-gray-600 rounded-md bg-gray-800 checked:bg-red-600 checked:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        disabled={isLoading || isGoogleLoading}
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isResetting || isLoading || isGoogleLoading}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      {isResetting ? 'Sending...' : 'Forgot password?'}
                    </button>
                  </div>

                  <SubmitButton isLoading={isLoading || isRedirecting}>
                    {isRedirecting ? 'Redirecting...' : 'Sign In'}
                  </SubmitButton>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black/85 text-gray-400 font-medium">or</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <form onSubmit={handleGoogleSignIn}>
                    <button
                      type="submit"
                      disabled={isGoogleLoading || isLoading || isRedirecting}
                      className="w-full flex items-center justify-center px-5 py-3 sm:py-4 bg-gray-900 border border-gray-700 rounded-xl text-white hover:bg-gray-800 disabled:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-red-500/30 disabled:cursor-not-allowed"
                    >
                      {isGoogleLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <div className="w-6 h-6 mr-3">
                          <svg viewBox="0 0 24 24" className="w-full h-full">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                        </div>
                      )}
                      {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                    </button>
                  </form>
                </div>

                <div className="text-gray-400 text-center mt-8 text-sm sm:text-base">
                  Are you new to SawaFlix?{' '}
                  <Link
                    href="/sign-up"
                    className="text-red-500 hover:underline hover:text-red-400 transition-colors font-medium"
                    onClick={(e) => {
                      if (isLoading || isGoogleLoading || isRedirecting) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Sign up
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

        input[type="checkbox"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          display: inline-block;
          position: relative;
          vertical-align: middle;
          cursor: pointer;
        }

        input[type="checkbox"]:checked:after {
          content: '✔';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.8rem;
          color: white;
        }
      `}</style>
    </div>
  );
}