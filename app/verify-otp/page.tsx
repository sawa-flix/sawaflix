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

/**
 * SawaFlix Verify OTP Page
 *
 * Logic Highlights:
 * - Two-step flow: Email Input -> OTP Verification
 * - 6-digit split OTP input with keyboard navigation
 * - Resend OTP timer (30s)
 * - Error/Success feedback with icons
 * - Next.js 15 (App Router) compliant
 */

const RESEND_TIMER_SECONDS = 30;

const VerifyOtpPage = () => {
  const router = useRouter();
  // Flow state
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Timer state
  const [timer, setTimer] = useState(0);

  // Refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle Email Submission
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Basic regex validation
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

  // Handle OTP Verification
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
        setMessage({ type: 'success', text: data.message || 'Account verified successfully! Redirecting...' });

        // Auto redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
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

  // OTP Input Logic
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, idx) => {
      if (/^\d$/.test(char)) {
        newOtp[idx] = char;
      }
    });
    setOtp(newOtp);
    // Focus the last filled input or the next one
    const nextIdx = Math.min(pastedData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#0A0D13] flex flex-col font-sans text-white">

      {/* ── Top Navbar ──────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 h-14 bg-[#0A0D13]/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Sawaflix logo icon */}
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

      {/* ── Main Body ────────────────────────────────────── */}
      <main className="flex flex-1 pt-14 min-h-screen">

        {/* ── LEFT PANEL: Cultural Image ─────────────────── */}
        <div className="hidden lg:flex w-[45%] relative overflow-hidden flex-shrink-0">
          {/* Background image */}
          <Image
            src="/otp-bg.jpg"
            alt="Cultural performer playing drums"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Text content over image */}
          <div className="relative z-10 flex flex-col justify-center items-center text-center p-10 h-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/40 bg-red-500/10 text-red-400">
                Exclusive Creator Program
              </span>
            </div>

            <h2 className="text-4xl font-black leading-tight tracking-tight mb-4 drop-shadow-lg">
              Share Your Cultural<br />Story
            </h2>

            <p className="text-gray-300 text-sm leading-relaxed max-w-xs font-medium drop-shadow">
              Join Sawaflix as a verified creator and preserve your cultural heritage for
              future generations while earning from your authentic content.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL: OTP Form ──────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0c1019]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            {/* Card */}
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">

              <AnimatePresence mode="wait">
                {step === 'email' ? (
                  // ── Email Step ──────────────────────────
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-8 text-center">
                      <h1 className="text-2xl font-black text-white mb-2">Verify Your Account</h1>
                      <p className="text-gray-400 text-sm">
                        Enter your email to receive a verification code.
                      </p>
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-5">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                          <Mail size={16} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-gray-600 text-white"
                          required
                          disabled={loading}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-widest active:scale-[0.98]"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            Continue
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>

                ) : (
                  // ── OTP Step ────────────────────────────
                  <motion.div
                    key="otp-step"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-8 text-center">
                      <h1 className="text-2xl font-black text-white mb-2">Verify Your Account</h1>
                      <p className="text-gray-400 text-sm">
                        Enter the 6-digit code sent to your email
                      </p>
                    </div>

                    {/* Timer */}
                    <div className="text-center mb-5">
                      <p className="text-gray-500 text-xs font-mono">
                        Code expires in{' '}
                        <span className="text-white font-bold tabular-nums">
                          {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                        </span>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      {/* OTP Boxes */}
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
                            className="w-11 h-12 text-center text-xl font-black bg-[#0B0E14] border border-gray-700 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-white caret-red-500 disabled:opacity-50"
                            disabled={loading}
                          />
                        ))}
                      </div>

                      {/* Resend */}
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">Didn&apos;t Receive OTP?</p>
                        {timer > 0 ? (
                          <p className="text-gray-600 text-xs font-medium">
                            Resend in <span className="text-gray-400 font-mono font-bold tabular-nums">{timer}s</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-red-500 hover:text-red-400 text-xs font-bold underline underline-offset-2 flex items-center justify-center gap-1 mx-auto transition-colors"
                            disabled={loading}
                          >
                            <RefreshCcw size={11} />
                            Resend Code
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otp.join('').length < 6}
                        className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-widest active:scale-[0.98]"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            Continue
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>

                      {/* Back link */}
                      <button
                        type="button"
                        onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setMessage(null); }}
                        className="w-full flex items-center justify-center gap-1 text-gray-600 hover:text-gray-400 text-xs font-medium transition-colors mt-1"
                      >
                        <ChevronLeft size={13} />
                        back
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Feedback Banner ──────────────────────── */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`mt-5 p-3.5 rounded-xl border flex items-center gap-3 text-sm ${message.type === 'success'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}
                  >
                    {message.type === 'success'
                      ? <CheckCircle2 size={16} className="shrink-0" />
                      : <AlertCircle size={16} className="shrink-0" />}
                    <p className="font-medium text-xs leading-snug">{message.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>{/* /card */}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOtpPage;