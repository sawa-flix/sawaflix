'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { resetPassword } from '../actions';
import BrandLoader from '@/components/BrandLoader';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await resetPassword({ email });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSent(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background */}
      <Image
        src="/hero-bg.png"
        alt="Background"
        fill
        quality={85}
        className="z-0 object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black opacity-75 z-10" />

      <div className="relative z-20 flex items-center justify-center h-screen px-4">
        <div className="relative w-full max-w-md">
          {/* Glowing animated border */}
          <div className="absolute inset-0 z-0 rounded-3xl" style={{
            background: 'conic-gradient(from 0deg, #000000 0%, #e50914 10%, #8b0000 20%, #000000 30%, #000000 100%)',
            padding: '2px',
            borderRadius: '1.5rem',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'exclude',
            animation: 'spin 8s linear infinite',
          }} />

          <div className="relative z-10 bg-black/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 shadow-2xl shadow-red-900/30">

            {/* Logo */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-black text-white tracking-wide">
                Sawa<span className="text-red-600">Flix</span>
              </h1>
            </div>

            {sent ? (
              /* ── Success State ─────────────────────────────────── */
              <div className="text-center space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600/10 border border-green-600/30 mx-auto">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Check Your Inbox</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    We have sent a password reset link to <span className="text-white font-medium">{email}</span>.
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    Don't see it? Check your spam folder.
                  </p>
                </div>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors hover:underline"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              /* ── Request Form ──────────────────────────────────── */
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white text-center">Forgot Password?</h2>
                  <p className="text-gray-400 text-sm text-center mt-2 leading-relaxed">
                    Enter the email address linked to your account and we'll send you a reset link.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856C18.448 19 19 18.105 19 17.05V6.95C19 5.895 18.448 5 17.918 5H6.082C5.552 5 5 5.895 5 6.95v10.1C5 18.105 5.552 19 6.082 19z" />
                    </svg>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      autoFocus
                      className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:opacity-50 transition-all duration-200"
                      style={{ WebkitBoxShadow: '0 0 0 1000px #111 inset', WebkitTextFillColor: 'white' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-3 px-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-600/25 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending Reset Link...
                      </span>
                    ) : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            )}

            {/* Back to login */}
            <div className="mt-6 text-center border-t border-gray-800 pt-5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-black"><BrandLoader /></div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
