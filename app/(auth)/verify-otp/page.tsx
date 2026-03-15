'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Loader2, RefreshCcw, ChevronLeft } from 'lucide-react';

const RESEND_TIMER_SECONDS = 30;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- State Management ---
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [newSignup, setNewSignup] = useState(false);

  // Refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize with email from query params if coming from signup
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setNewSignup(true);
      setStep('otp');
      handleSendOtpAuto(emailParam);
    }
  }, [searchParams]);

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

  // --- Logic: Auto-send OTP for new signups ---
  const handleSendOtpAuto = async (emailToSend: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });
      const data = await res.json();

      if (res.ok) {
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
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, idx) => { if (/^\d$/.test(char)) newOtp[idx] = char; });
    setOtp(newOtp);
    const nextIdx = Math.min(pastedData.length, 5);
    inputRefs.current[nextIdx]?.focus();
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

            {step === 'email' ? (
              /* --- EMAIL STEP --- */
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-2">
                  Verify Your Email
                </h1>
                <p className="text-gray-400 text-center text-sm mb-6">
                  Enter your email to receive a verification code
                </p>

                {/* Status Messages */}
                <div className="space-y-4 mb-6">
                  {message && (
                    <div className={`p-3 rounded-lg text-sm text-center border ${
                      message.type === 'error'
                        ? 'bg-red-900/30 border-red-700 text-red-400'
                        : 'bg-green-900/30 border-green-700 text-green-400'
                    }`}>
                      {message.text}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-300 shadow-inner shadow-gray-950"
                    required
                    disabled={loading}
                  />

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full px-5 py-2.5 bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white font-bold rounded-xl transition-all duration-300 transform active:scale-95 disabled:transform-none disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* --- OTP STEP --- */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                      Enter Code
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                      Sent to <span className="text-white font-semibold">{email}</span>
                    </p>
                  </div>
                  {!newSignup && (
                    <button
                      onClick={() => {
                        setStep('email');
                        setMessage(null);
                        setOtp(['', '', '', '', '', '']);
                      }}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}
                </div>

                <div className="text-center mb-6 text-sm text-gray-400">
                  <p>
                    Code expires in{' '}
                    <span className="text-red-500 font-bold font-mono">
                      {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                    </span>
                  </p>
                </div>

                {/* Status Messages */}
                <div className="space-y-4 mb-6">
                  {message && (
                    <div className={`p-3 rounded-lg text-sm text-center border ${
                      message.type === 'error'
                        ? 'bg-red-900/30 border-red-700 text-red-400'
                        : 'bg-green-900/30 border-green-700 text-green-400'
                    }`}>
                      {message.text}
                    </div>
                  )}
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-between gap-2" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-300 shadow-inner shadow-gray-950"
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="w-full px-5 py-2.5 bg-red-700 hover:bg-red-600 disabled:bg-red-900 text-white font-bold rounded-xl transition-all duration-300 transform active:scale-95 disabled:transform-none disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      'Verify Account'
                    )}
                  </button>
                </form>

                {timer === 0 && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={loading}
                      className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                      <RefreshCcw size={16} />
                      Resend Code
                    </button>
                  </div>
                )}
              </motion.div>
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #111827 inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
