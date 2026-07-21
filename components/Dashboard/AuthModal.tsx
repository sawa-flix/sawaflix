'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional contextual message, e.g. "to like this video" */
  promptMessage?: string;
}

export default function AuthModal({ isOpen, onClose, promptMessage = 'to interact with Sawaflix' }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect back to the exact page the user was on
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
        },
      });

      if (error) {
        console.error('[AuthModal] OAuth Error:', error.message);
        setIsLoading(false);
      }
      // On success, browser is redirected — loading state stays until navigation
    } catch (err) {
      console.error('[AuthModal] Unexpected Error:', err);
      setIsLoading(false);
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
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#CE1126] via-[#007A5E] to-[#FCD116]" />

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
                  Join millions watching the best of Cameroon — for free.
                </p>
              </div>

              {/* Google OAuth Button */}
              <motion.button
                id="auth-modal-google-btn"
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-[#1a1a1a] font-bold text-sm hover:bg-white/90 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin text-gray-500" />
                ) : (
                  <FcGoogle className="w-5 h-5" />
                )}
                {isLoading ? 'Signing in…' : 'Continue with Google'}
              </motion.button>

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
