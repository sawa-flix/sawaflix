'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  ChevronLeft
} from 'lucide-react';

import { createClient } from '@/utils/supabase/client';

const RESEND_TIMER_SECONDS = 30;

const VerifyOtpPage = () => {
  const router = useRouter();

  // --- State Management ---
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);

  // Refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Logic: Timer ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Logic: API Handlers ---
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep('otp');
        setTimer(RESEND_TIMER_SECONDS);
        setMessage({ type: 'success', text: 'Verification code sent to your email.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send OTP.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otpString = otp.join('');

    if (otpString.length < 6) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit code.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpString }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Account verified! Redirecting...' });
        setTimeout(() => {
          data.pendingReview ? router.push('/creator/pending') : router.push('/dashboard');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid or expired code.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Verification failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Logic: OTP Input Interaction ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, idx) => { newOtp[idx] = char; });
    setOtp(newOtp);
    const nextIdx = Math.min(pastedData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#0A0D13] flex flex-col font-sans text-white">
      {/* --- Top Navbar --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 h-14 bg-[#0A0D13]/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-white font-black tracking-tight text-lg">
            Sawa<span className="text-red-500">flix</span>
          </span>
        </div>
      </header>

      <main className="flex flex-1 pt-14 min-h-screen">
        {/* --- LEFT PANEL: Cultural Branding --- */}
        <div className="hidden lg:flex w-[45%] relative overflow-hidden flex-shrink-0">
          <Image
            src="/otp-bg.jpg"
            alt="Cultural Storytelling"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D13] via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 h-full">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/40 bg-red-500/10 text-red-400">
                Creator Verification
              </span>
            </div>
            <h2 className="text-5xl font-black leading-tight tracking-tighter mb-6">
              Empowering <br /> <span className="text-red-500">Authentic</span> Voices
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
              Verify your identity to unlock creator tools, manage your content, and share your heritage with the world.
            </p>
          </div>
        </div>

        {/* --- RIGHT PANEL: Functional Form --- */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0c1019]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#111827]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">

              <AnimatePresence mode="wait">
                {step === 'email' ? (
                  /* --- EMAIL STEP --- */
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-8">
                      <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
                      <p className="text-gray-400 text-sm">Enter your email to receive a secure code.</p>
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-5">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500/60 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-gray-600"
                          required
                          disabled={loading}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full bg-red-700 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-widest active:scale-[0.98] shadow-lg shadow-red-900/20"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                          <>Send Code <ArrowRight size={18} /></>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  /* --- OTP STEP --- */
                  <motion.div
                    key="otp-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-black text-white mb-2">Verify OTP</h1>
                        <p className="text-gray-400 text-sm">
                          Sent to <span className="text-white font-bold">{email}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => { setStep('email'); setMessage(null); }}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-gray-500 text-xs font-mono uppercase tracking-tighter">
                        Resend Available in <span className="text-red-600 font-bold tabular-nums">
                          {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                        </span>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                      <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => { inputRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="w-12 h-14 text-center text-2xl font-black bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-white"
                            disabled={loading}
                          />
                        ))}
                      </div>

                      <div className="space-y-4">
                        <button
                          type="submit"
                          disabled={loading || otp.join('').length < 6}
                          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest active:scale-[0.98]"
                        >
                          {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>Verify Account <Lock size={18} /></>
                          )}
                        </button>

                        <div className="text-center">
                          {timer === 0 ? (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="text-red-500 hover:text-red-400 text-xs font-bold underline underline-offset-4 flex items-center justify-center gap-2 mx-auto"
                            >
                              <RefreshCcw size={14} /> Resend New Code
                            </button>
                          ) : (
                            <p className="text-gray-600 text-xs font-medium">Wait {timer}s to resend</p>
                          )}
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* --- Feedback Banner --- */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-6 p-4 rounded-2xl border flex items-center gap-3 ${message.type === 'success'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}
                  >
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-xs font-bold leading-tight">{message.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-gray-600 text-[10px] mt-10 uppercase tracking-[0.2em] font-bold opacity-60">
              Protected by Sawaflix Identity Guard
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOtpPage;