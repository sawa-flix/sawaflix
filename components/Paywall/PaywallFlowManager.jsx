"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  X,
  Lock,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Download,
  Settings,
  Monitor,
  Smartphone,
  Wifi,
  Shield,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

// ─── FLOW STATES ───────────────────────────────────────────────
const FLOW = {
  IDLE: "IDLE",
  PLAYING_AD: "PLAYING_AD",
  SELECTING_PLAN: "SELECTING_PLAN",
  ENTERING_PAYMENT: "ENTERING_PAYMENT",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  WATCHING: "WATCHING",
};

// ─── PLANS DATA ────────────────────────────────────────────────
const PLANS = [
  { id: "1day", label: "Rented for 1 Day", price: 500, duration: "1 day", desc: "Watch offline for 1 day" },
  { id: "1week", label: "1 Week Access", price: 1500, duration: "7 days", desc: "Watch offline for 7 days" },
  { id: "1month", label: "1 Month Access", price: 3500, duration: "30 days", desc: "Watch offline for 30 days" },
  { id: "forever", label: "Own Forever", price: 5000, duration: "Unlimited", desc: "Watch forever, anytime" },
];

// ─── DEV MODE (triple-click the ad timer to skip) ──────────────
const AD_DURATION = 180; // 3 minutes in seconds
const PROCESSING_DURATION = 30; // 30 seconds

// ════════════════════════════════════════════════════════════════
// MAIN EXPORT — PaywallFlowManager
// ════════════════════════════════════════════════════════════════
export default function PaywallFlowManager({ movie, onClose }) {
  const [flowState, setFlowState] = useState(FLOW.PLAYING_AD);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Step 2: Ad Player */}
      {flowState === FLOW.PLAYING_AD && (
        <AdPlayer
          movie={movie}
          onComplete={() => setFlowState(FLOW.SELECTING_PLAN)}
          onClose={onClose}
        />
      )}

      {/* Steps 3 & 4: Plan Selection */}
      {flowState === FLOW.SELECTING_PLAN && (
        <PlansModal
          movie={movie}
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
          onContinue={() => setFlowState(FLOW.ENTERING_PAYMENT)}
          onClose={onClose}
        />
      )}

      {/* Step 5: Mobile Money Payment */}
      {flowState === FLOW.ENTERING_PAYMENT && (
        <MobileMoneyPayment
          movie={movie}
          plan={selectedPlan}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onPay={() => setFlowState(FLOW.PROCESSING)}
          onBack={() => setFlowState(FLOW.SELECTING_PLAN)}
          onClose={onClose}
        />
      )}

      {/* Step 6: Processing */}
      {flowState === FLOW.PROCESSING && (
        <ProcessingScreen
          plan={selectedPlan}
          onComplete={() => setFlowState(FLOW.SUCCESS)}
        />
      )}

      {/* Step 7: Success */}
      {flowState === FLOW.SUCCESS && (
        <SuccessScreen
          plan={selectedPlan}
          onStartWatching={() => setFlowState(FLOW.WATCHING)}
        />
      )}

      {/* Step 8: Video Player */}
      {flowState === FLOW.WATCHING && (
        <PremiumVideoPlayer movie={movie} onClose={onClose} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEP 2 — AD PLAYER
// ════════════════════════════════════════════════════════════════
function AdPlayer({ movie, onComplete, onClose }) {
  const [timeLeft, setTimeLeft] = useState(AD_DURATION);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const devClickCount = useRef(0);

  useEffect(() => {
    if (isPaused) return;
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onComplete]);

  const elapsed = AD_DURATION - timeLeft;
  const progressPct = (elapsed / AD_DURATION) * 100;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleDevSkip = () => {
    devClickCount.current += 1;
    if (devClickCount.current >= 3) {
      setTimeLeft(0);
    }
    setTimeout(() => { devClickCount.current = 0; }, 1500);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black">
      {/* Ad Video Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Simulated ad background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10 px-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-4xl sm:text-5xl">🥤</span>
            </div>
            <p className="text-white/90 text-xl sm:text-3xl font-black uppercase tracking-wide mb-2">
              Top Soft Drink
            </p>
            <p className="text-white/60 text-sm sm:text-lg italic font-medium">
              "Vivez l'instant présent"
            </p>
            <button className="mt-6 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 mx-auto">
              <ExternalLink size={14} /> Learn More
            </button>
          </div>
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 py-4 z-20">
          <div className="flex items-center gap-3">
            <span className="bg-[#FCD116] text-black text-[10px] sm:text-xs font-black px-3 py-1 rounded uppercase tracking-wider">
              Ad
            </span>
            <span className="text-white/70 text-xs sm:text-sm font-semibold" onClick={handleDevSkip}>
              Ad 1 of 1 · {formatTime(elapsed)} / {formatTime(AD_DURATION)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#0a0a0a] border-t border-white/10 px-4 sm:px-6 py-3 sm:py-4">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-[#FCD116] rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isPaused ? <Play size={18} fill="white" className="text-white ml-0.5" /> : <Pause size={18} className="text-white" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
            </button>
          </div>

          <div className="text-center">
            <p className="text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
              Ad will finish in
            </p>
            <p className="text-white text-lg sm:text-2xl font-black tabular-nums">
              {formatTime(timeLeft)}
            </p>
          </div>

          <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
            <Maximize size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEPS 3 & 4 — PLANS MODAL
// ════════════════════════════════════════════════════════════════
function PlansModal({ movie, selectedPlan, onSelectPlan, onContinue, onClose }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} className="text-white" />
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Continue Watching
          </h2>
          <p className="text-white/50 text-sm font-medium mt-1">
            {movie.title} · {movie.year}
          </p>
        </div>

        {/* Plans List */}
        <div className="px-6 py-5 space-y-3">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-[#CE1126]/10 border-[#CE1126]/60"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {/* Radio */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? "border-[#CE1126] bg-[#CE1126]" : "border-white/30"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                {/* Plan Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{plan.label}</p>
                  <p className="text-white/40 text-xs">{plan.desc}</p>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-white font-black text-base">
                    {plan.price.toLocaleString()}{" "}
                    <span className="text-white/50 text-xs font-semibold">FCFA</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onContinue}
            disabled={!selectedPlan}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedPlan
                ? "bg-[#CE1126] hover:bg-[#a30d1e] text-white shadow-lg"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            Continue to Payment
          </button>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-semibold uppercase tracking-widest">
              <Download size={14} /> Offline
            </div>
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-semibold uppercase tracking-widest">
              <Monitor size={14} /> All Devices
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.35s ease-out forwards; }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEP 5 — MOBILE MONEY PAYMENT
// ════════════════════════════════════════════════════════════════
function MobileMoneyPayment({ movie, plan, paymentMethod, setPaymentMethod, phoneNumber, setPhoneNumber, onPay, onBack, onClose }) {
  const isValid = phoneNumber.replace(/\s/g, "").length >= 9;

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 1) return digits;
    if (digits.length <= 3) return `${digits[0]} ${digits.slice(1)}`;
    if (digits.length <= 5) return `${digits[0]} ${digits.slice(1, 3)} ${digits.slice(3)}`;
    if (digits.length <= 7) return `${digits[0]} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    return `${digits[0]} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} className="text-white" />
          </button>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
            You are paying for
          </p>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            {movie.title}
          </h2>
          <p className="text-white/50 text-sm font-medium">
            {plan?.label} · <span className="text-white font-bold">{plan?.price.toLocaleString()} FCFA</span>
          </p>
        </div>

        {/* Payment Methods */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">
            Select Payment Method
          </p>

          {/* MTN MoMo */}
          <button
            onClick={() => setPaymentMethod("mtn")}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
              paymentMethod === "mtn"
                ? "bg-[#FFCB05]/10 border-[#FFCB05]/40"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              paymentMethod === "mtn" ? "border-[#CE1126] bg-[#CE1126]" : "border-white/30"
            }`}>
              {paymentMethod === "mtn" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#FFCB05] flex items-center justify-center shrink-0">
              <span className="text-black font-black text-xs leading-none">MTN</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">MTN Mobile Money</p>
              <p className="text-white/40 text-xs">MoMo</p>
            </div>
          </button>

          {/* Orange Money */}
          <button
            onClick={() => setPaymentMethod("orange")}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
              paymentMethod === "orange"
                ? "bg-[#FF6600]/10 border-[#FF6600]/40"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              paymentMethod === "orange" ? "border-[#CE1126] bg-[#CE1126]" : "border-white/30"
            }`}>
              {paymentMethod === "orange" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#FF6600] flex items-center justify-center shrink-0">
              <span className="text-white font-black text-[10px] leading-none">OM</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">Orange Money</p>
              <p className="text-white/40 text-xs">Orange</p>
            </div>
          </button>
        </div>

        {/* Phone Number */}
        <div className="px-6 pb-5">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">
            Phone Number
          </p>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#CE1126]/50 transition-colors">
            <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-white/10">
              <span className="text-sm">🇨🇲</span>
              <span className="text-white/70 text-sm font-bold">+237</span>
              <ChevronDown size={14} className="text-white/30" />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
              placeholder="6 75 12 34 56"
              className="flex-1 bg-transparent text-white text-sm font-semibold outline-none placeholder:text-white/20 tabular-nums tracking-wider"
            />
          </div>
        </div>

        {/* Pay Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onPay}
            disabled={!isValid}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isValid
                ? "bg-[#CE1126] hover:bg-[#a30d1e] text-white shadow-lg"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            <Shield size={16} />
            Pay {plan?.price.toLocaleString()} FCFA
          </button>

          <button
            onClick={onBack}
            className="w-full mt-3 py-2 text-white/40 hover:text-white/70 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
          >
            ← Back to Plans
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.35s ease-out forwards; }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEP 6 — PROCESSING SCREEN
// ════════════════════════════════════════════════════════════════
function ProcessingScreen({ plan, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(PROCESSING_DURATION);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progressPct = ((PROCESSING_DURATION - timeLeft) / PROCESSING_DURATION) * 100;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="w-full h-full flex items-center justify-center bg-black p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Circular Timer */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="#CE1126"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Lock size={24} className="text-white/50 mb-2" />
            <span className="text-white text-2xl sm:text-3xl font-black tabular-nums">
              {timeLeft}s
            </span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-3">
          Processing Payment
        </h2>
        <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed">
          Please wait while we process your payment.
        </p>

        {/* Pulsing dots */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#CE1126] animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#CE1126] animate-pulse" style={{ animationDelay: "300ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#CE1126] animate-pulse" style={{ animationDelay: "600ms" }} />
        </div>

        <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
          <Shield size={14} />
          Do not close this window or press back
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEP 7 — SUCCESS SCREEN
// ════════════════════════════════════════════════════════════════
function SuccessScreen({ plan, onStartWatching }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black p-6">
      <div className="flex flex-col items-center text-center max-w-sm animate-scaleIn">
        {/* Success Checkmark */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-8">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#009639" strokeWidth="4" className="animate-drawCircle" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#009639] flex items-center justify-center animate-popIn">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
          Payment Successful!
        </h2>
        <p className="text-white/60 text-sm font-medium mb-2">
          Your payment of <span className="text-white font-bold">{plan?.price.toLocaleString()} FCFA</span> was successful.
        </p>
        <p className="text-white/40 text-sm font-medium mb-10">
          Enjoy your movie.
        </p>

        <button
          onClick={onStartWatching}
          className="w-full max-w-xs py-3.5 bg-[#CE1126] hover:bg-[#a30d1e] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <Play size={18} fill="currentColor" /> Start Watching
        </button>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }

        @keyframes drawCircle {
          from { stroke-dasharray: 340; stroke-dashoffset: 340; }
          to { stroke-dasharray: 340; stroke-dashoffset: 0; }
        }
        .animate-drawCircle { animation: drawCircle 0.8s ease-out 0.2s forwards; stroke-dasharray: 340; stroke-dashoffset: 340; }

        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-popIn { animation: popIn 0.5s ease-out 0.6s forwards; opacity: 0; }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEP 8 — PREMIUM VIDEO PLAYER
// ════════════════════════════════════════════════════════════════
function PremiumVideoPlayer({ movie, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setIsPlaying(false); return 100; }
        return p + 0.05;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(hideTimer.current);
  }, []);

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center cursor-none"
      onMouseMove={handleMouseMove}
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {/* Video Content (Simulated with movie poster) */}
      <div className="absolute inset-0">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          className="object-cover opacity-80"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Play/Pause Center Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-pulse">
            <Play size={32} fill="white" className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} className="text-white" />
          </button>
          <h3 className="text-white font-bold text-sm sm:text-base uppercase tracking-tight">
            {movie.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
            <Monitor size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent px-4 sm:px-6 pb-4 sm:pb-6 pt-12 transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrubber */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group relative">
          <div
            className="h-full bg-[#CE1126] rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#CE1126] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setProgress(Math.max(0, progress - 5))}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <SkipBack size={16} className="text-white" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} fill="white" className="text-white ml-0.5" />
              )}
            </button>
            <button
              onClick={() => setProgress(Math.min(100, progress + 5))}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <SkipForward size={16} className="text-white" />
            </button>
            <span className="text-white/60 text-xs font-semibold tabular-nums ml-2 hidden sm:inline">
              {Math.floor(progress * 1.26)}:00 / 2:06:00
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer hidden sm:flex">
              <Download size={16} className="text-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer hidden sm:flex">
              <Settings size={16} className="text-white" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize size={16} className="text-white" /> : <Maximize size={16} className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
