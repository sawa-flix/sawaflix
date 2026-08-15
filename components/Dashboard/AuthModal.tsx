'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface GoogleIdTokenPayload {
  name?: string;
  given_name?: string;
  picture?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional contextual message, e.g. "to like this video" */
  promptMessage?: string;
}

export default function AuthModal({ isOpen, onClose, promptMessage = 'to interact with Sawaflix' }: AuthModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Full OAuth code flow (not GIS One Tap / signInWithIdToken). Navigates
  // away to Google's consent screen; app/(auth)/auth/callback/route.js
  // exchanges the code and redirects back into the app, so there's nothing
  // left to do here after the call.
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential returned from Google');
      }

      const supabase = createClient();
      const redirectBase = window.location.origin;

      const { data, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        options: {
          redirectTo: `${redirectBase}/auth/callback`,
          scopes: 'openid email profile https://www.googleapis.com/auth/youtube.force-ssl',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError || !data.user) {
        throw signInError || new Error('Sign-in failed');
      }

      const meta = jwtDecode<GoogleIdTokenPayload>(credentialResponse.credential);

      await supabase.from('users').upsert(
        {
          id: data.user.id,
          email: data.user.email,
          username: meta.name || meta.given_name || data.user.email?.split('@')[0],
          profile_image_url: meta.picture || null,
          verification_status: 'approved',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      setSuccessMessage('Signed in successfully!');
      onClose();
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError('Unable to continue with Google right now. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            key="auth-modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[380px] bg-[#0F1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header gradient accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-red-600" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center gap-5 px-8 pt-10 pb-8">
              {/* Logo */}
              <div className="relative w-24 h-8">
                <Image src="/sawalogo.png" alt="Sawaflix" fill className="object-contain" />
              </div>

              {/* Copy */}
              <div className="text-center space-y-1.5">
                <h2 className="text-white font-black text-xl leading-tight">
                  Sign in {promptMessage}
                </h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  Join millions watching the best of Cameroon for free.
                </p>
              </div>

              {/* Google OAuth Button */}
              <div className="relative w-full">
                <motion.button
                  id="auth-modal-google-btn"
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  disabled={isGoogleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-[#1a1a1a] font-bold text-sm hover:bg-white/90 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <Loader2 size={18} className="animate-spin text-gray-500" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.612 14.417 17.64 12 17.64 9.2z" fill="#4285F4" />
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A9.009 9.009 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                  )}
                  {isGoogleLoading ? 'Signing in…' : 'Continue with Google'}
                </motion.button>
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center -mt-2">{error}</p>
              )}

              <p className="text-white/20 text-xs text-center leading-relaxed">
                By signing in you agree to our{' '}
                <span className="text-white/40 underline cursor-pointer">Terms</span> and{' '}
                <span className="text-white/40 underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

