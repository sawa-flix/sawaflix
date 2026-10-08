'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

declare global {
  interface Window {
    google?: any;
  }
}

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

export default function AuthModal({ isOpen, onClose, promptMessage = 'to continue on SawaFlix' }: AuthModalProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleCredential = async (credentialResponse: any) => {
    setError(null);

    if (!credentialResponse.credential) {
      setError('Unable to continue with Google right now. Please try again.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (signInError || !data.user) {
        throw signInError || new Error('No user returned from Supabase');
      }

      // Enrich public.users row with metadata from Google OAuth ID token
      const meta = data.user.user_metadata ?? {};
      const { error: syncError } = await supabase.from('users').upsert(
        {
          id: data.user.id,
          email: data.user.email,
          username: meta.full_name || meta.name || data.user.email?.split('@')[0] || 'User',
          profile_image_url: meta.avatar_url || meta.picture || null,
          verification_status: 'approved',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (syncError) console.error('Profile sync warning:', syncError.message);

      router.refresh();
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err?.message || 'Unable to continue with Google right now. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Initialize Google Sign-In button when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initializeGoogleSignIn = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId || !window.google) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: 350,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      } catch (err) {
        console.error('Failed to initialize Google Sign-In:', err);
      }
    };

    // Load Google Sign-In script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="auth-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            key="auth-modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative z-10 w-full max-w-[390px] bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] p-6 sm:p-7 flex flex-col items-center backdrop-blur-2xl overflow-hidden transition-colors"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)] transition-colors cursor-pointer z-30"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Logo */}
            <div className="relative w-36 h-10 mb-5 flex items-center justify-center">
              {/* Dark mode logo */}
              <Image
                src="/logos_and_pwas/headerLogo..png"
                alt="SawaFlix"
                width={160}
                height={40}
                className="h-8 w-auto object-contain block [[data-theme=light]_&]:hidden"
                priority
              />
              {/* Light mode logo */}
              <Image
                src="/logos_and_pwas/sawa.svg"
                alt="SawaFlix"
                width={245}
                height={57}
                className="h-8 w-auto object-contain hidden [[data-theme=light]_&]:block"
                priority
              />
            </div>

            {/* Heading & Subtitle */}
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-[color:var(--foreground)] font-bold text-xl sm:text-[22px] tracking-tight">
                Sign in {promptMessage}
              </h2>
              <p className="text-[color:var(--muted-foreground)] text-xs sm:text-[13px] leading-relaxed max-w-[280px] mx-auto">
                Join thousands watching and sharing authentic Cameroonian entertainment.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="w-full mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* Google Sign In Button — Native Google Popup */}
            <div className="relative w-full mb-5">
              <div
                id="google-signin-button"
                className="w-full"
              />
            </div>

            {/* Terms and Privacy Footer */}
            <p className="text-[color:var(--muted-foreground)] text-[11px] text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-[color:var(--foreground)] hover:underline transition-colors font-medium" target="_blank" rel="noreferrer">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-[color:var(--foreground)] hover:underline transition-colors font-medium" target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
              .
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
