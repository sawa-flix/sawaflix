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
import ReactPlayer from 'react-player/youtube';

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
const AD_DURATION = 30; // 30 seconds
const PROCESSING_DURATION = 5; // 5 seconds

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
    <div 
      className="fixed inset-0 z-[9999] bg-[#0B0E14]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className={`relative w-full transition-all duration-500 ease-out flex justify-center items-center ${
          flowState === FLOW.WATCHING ? 'max-w-5xl' : 'max-w-2xl'
        }`} 
        onClick={(e) => e.stopPropagation()}
      >
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
            onClose={onClose}
          />
        )}

        {/* Step 7: Success */}
        {flowState === FLOW.SUCCESS && (
          <SuccessScreen
            plan={selectedPlan}
            onStartWatching={() => setFlowState(FLOW.WATCHING)}
            onClose={onClose}
          />
        )}

        {/* Step 8: Video Player */}
        {flowState === FLOW.WATCHING && (
          <PremiumVideoPlayer movie={movie} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEP 2 — AD PLAYER
// ════════════════════════════════════════════════════════════════
function AdPlayer({ movie, onComplete, onClose }) {
  const [timeLeft, setTimeLeft] = useState(AD_DURATION);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Unmuted by default based on request, but browsers might block autoplay. Let's try unmuted.
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
    <div className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-[#111]">
        <div className="flex items-center gap-3">
          <span className="bg-[#FCD116] text-black text-[10px] sm:text-xs font-black px-3 py-1 rounded uppercase tracking-wider">
            Movie Preview
          </span>
          <span className="text-white/70 text-xs sm:text-sm font-semibold select-none cursor-pointer" onClick={handleDevSkip}>
            {formatTime(elapsed)} / {formatTime(AD_DURATION)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* Ad Video Area (YouTube) */}
      <div className="relative w-full aspect-video bg-black pointer-events-none overflow-hidden">
        <ReactPlayer
          url="https://www.youtube.com/watch?v=9wW_UHl_br4"
          playing={!isPaused}
          muted={isMuted}
          controls={false}
          width="130%"
          height="130%"
          style={{ position: 'absolute', top: '-15%', left: '-15%', pointerEvents: 'none' }}
          config={{ youtube: { playerVars: { disablekb: 1, modestbranding: 1 } } }}
        />
        {/* Transparent overlay to completely block interaction with YouTube iframe */}
        <div className="absolute inset-0 z-10" />
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#0a0a0a] px-4 sm:px-6 py-3 sm:py-4">
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
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors cursor-pointer z-20"
            >
              {isPaused ? <Play size={16} fill="white" className="text-white ml-0.5" /> : <Pause size={16} className="text-white" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors cursor-pointer z-20"
            >
              {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
            </button>
          </div>

          <div className="text-right">
            <p className="text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
              Preview ends in
            </p>
            <p className="text-white text-lg sm:text-xl font-black tabular-nums">
              {timeLeft}s
            </p>
          </div>
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
    <div className="w-full max-w-2xl bg-[#0B0E14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
      {/* Header */}
      <div className="relative px-6 pt-6 pb-4 border-b border-white/5 bg-[#111]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} className="text-white" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
          Choose a Plan
        </h2>
        <p className="text-white/50 text-sm font-medium mt-1">
          Unlock <span className="text-white font-bold">{movie.title}</span> ({movie.year})
        </p>
      </div>

      {/* Plans Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className={`w-full flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-[#FCD116]/10 border-[#FCD116]"
                    : "bg-white/5 border-transparent hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {/* Check Indicator */}
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? "border-[#FCD116] bg-[#FCD116]" : "border-white/20"
                }`}>
                  {isSelected && <Check size={12} strokeWidth={4} className="text-black" />}
                </div>

                <h3 className="text-white font-bold text-base mb-1">{plan.label}</h3>
                <p className="text-white/50 text-xs mb-4">{plan.desc}</p>
                <div className="mt-auto">
                  <p className="text-white font-black text-2xl">
                    {plan.price.toLocaleString()}
                  </p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">FCFA</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div>
          <button
            onClick={onContinue}
            disabled={!selectedPlan}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedPlan
                ? "bg-[#FCD116] hover:bg-[#e5bc14] text-black shadow-[0_0_20px_rgba(252,209,22,0.3)]"
                : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
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

  const isMTN = paymentMethod === 'mtn';
  const cardGradient = isMTN ? 'from-[#FFCB05] to-[#D4A800]' : 'from-[#FF6600] to-[#CC5200]';
  const textColor = isMTN ? 'text-black' : 'text-white';
  const logoBg = isMTN ? 'bg-black text-[#FFCB05]' : 'bg-white text-[#FF6600]';

  return (
    <div className="w-full max-w-md bg-[#0B0E14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scaleIn relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex justify-between items-start">
        <div>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
            Payment Details
          </p>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            Checkout
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} className="text-white" />
        </button>
      </div>

      <div className="px-6 pb-2">
        {/* Digital Payment Card Visualization */}
        <div className={`relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${cardGradient} p-6 shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 transform hover:scale-[1.02]`}>
          
          {/* SIM Chip & Logo */}
          <div className="flex justify-between items-start z-10">
            <div className={`w-12 h-9 rounded-md backdrop-blur-sm border flex items-center justify-center ${isMTN ? 'bg-black/10 border-black/20' : 'bg-white/30 border-white/40'}`}>
              <div className={`w-8 h-5 border rounded-sm grid grid-cols-3 gap-0.5 ${isMTN ? 'border-black/20' : 'border-white/30'}`}>
                <div className={`border-r border-b ${isMTN ? 'border-black/20' : 'border-white/30'}`} />
                <div className={`border-r border-b ${isMTN ? 'border-black/20' : 'border-white/30'}`} />
                <div className={`border-b ${isMTN ? 'border-black/20' : 'border-white/30'}`} />
                <div className={`border-r ${isMTN ? 'border-black/20' : 'border-white/30'}`} />
                <div className={`border-r ${isMTN ? 'border-black/20' : 'border-white/30'}`} />
                <div className="" />
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm ${logoBg}`}>
              {isMTN ? "MTN MoMo" : "Orange Money"}
            </div>
          </div>

          {/* Card Number Input Area */}
          <div className="z-10 mt-auto">
            <label className={`text-[9px] font-bold uppercase tracking-[0.2em] opacity-70 ${textColor} mb-2 block`}>
              Mobile Money Number
            </label>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-bold opacity-80 ${textColor}`}>+237</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                placeholder="6 75 12 34 56"
                className={`w-full bg-transparent text-2xl sm:text-3xl font-black outline-none placeholder:${textColor} placeholder:opacity-30 tracking-[0.1em] tabular-nums ${textColor}`}
              />
            </div>
          </div>

          {/* Card Footer */}
          <div className={`flex justify-between items-end mt-6 z-10 ${textColor}`}>
            <div>
              <div className="text-[7px] font-bold uppercase tracking-[0.2em] opacity-70 mb-1">Total Amount</div>
              <div className="font-black text-sm tracking-widest">{plan?.price.toLocaleString()} FCFA</div>
            </div>
            <div className="text-right">
              <div className="text-[7px] font-bold uppercase tracking-[0.2em] opacity-70 mb-1">Movie</div>
              <div className="font-bold text-xs tracking-widest uppercase truncate max-w-[120px]">{movie.title}</div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isMTN ? 'bg-white/40' : 'bg-white/20'}`} />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Network Selector */}
      <div className="px-6 py-4 flex gap-3">
        <button
          onClick={() => setPaymentMethod("mtn")}
          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer ${
            isMTN ? "bg-[#FFCB05] text-black border-[#FFCB05] shadow-[0_0_15px_rgba(255,203,5,0.2)]" : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isMTN ? 'bg-black' : 'bg-[#FFCB05]'}`} /> MTN
        </button>
        <button
          onClick={() => setPaymentMethod("orange")}
          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer ${
            !isMTN ? "bg-[#FF6600] text-white border-[#FF6600] shadow-[0_0_15px_rgba(255,102,0,0.2)]" : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${!isMTN ? 'bg-white' : 'bg-[#FF6600]'}`} /> Orange
        </button>
      </div>

      {/* Footer Buttons */}
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={onPay}
          disabled={!isValid}
          className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isValid
              ? "bg-[#CE1126] hover:bg-[#a30d1e] text-white shadow-[0_0_20px_rgba(206,17,38,0.3)]"
              : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
          }`}
        >
          <Shield size={16} /> Pay Securely
        </button>

        <button
          onClick={onBack}
          className="w-full mt-4 py-2 text-white/40 hover:text-white/70 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
        >
          ← Change Plan
        </button>
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
function ProcessingScreen({ plan, onComplete, onClose }) {
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
    <div className="w-full max-w-sm bg-[#0B0E14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative p-8 animate-scaleIn text-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer z-10"
      >
        <X size={16} className="text-white" />
      </button>

      {/* Circular Timer */}
      <div className="relative w-32 h-32 mx-auto mb-8 mt-4">
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
          <Lock size={20} className="text-white/40 mb-1" />
          <span className="text-white text-2xl font-black tabular-nums">
            {timeLeft}s
          </span>
        </div>
      </div>

      <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
        Processing Payment
      </h2>
      <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed">
        Check your phone to confirm the transaction.
      </p>

      {/* Pulsing dots */}
      <div className="flex justify-center items-center gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-[#CE1126] animate-pulse" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-[#CE1126] animate-pulse" style={{ animationDelay: "300ms" }} />
        <div className="w-2 h-2 rounded-full bg-[#CE1126] animate-pulse" style={{ animationDelay: "600ms" }} />
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CE1126] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#CE1126]/30">
        <Shield size={12} />
        Do not close this window
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STEP 7 — SUCCESS SCREEN
// ════════════════════════════════════════════════════════════════
function SuccessScreen({ plan, onStartWatching, onClose }) {
  return (
    <div className="w-full max-w-sm bg-[#0B0E14] border border-[#009639]/30 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,150,57,0.1)] relative p-8 animate-scaleIn text-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer z-10"
      >
        <X size={16} className="text-white" />
      </button>

      {/* Success Checkmark */}
      <div className="relative w-28 h-28 mx-auto mb-8 mt-4">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#009639" strokeWidth="4" className="animate-drawCircle" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#009639] flex items-center justify-center animate-popIn shadow-[0_0_20px_rgba(0,150,57,0.4)]">
            <Check size={32} className="text-white" strokeWidth={4} />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3 text-[#009639]">
        Payment Successful!
      </h2>
      <p className="text-white/70 text-sm font-medium mb-8">
        Your payment of <span className="text-white font-bold">{plan?.price.toLocaleString()} FCFA</span> was processed.
      </p>

      <button
        onClick={onStartWatching}
        className="w-full py-4 bg-[#CE1126] hover:bg-[#a30d1e] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(206,17,38,0.3)] cursor-pointer"
      >
        <Play size={18} fill="currentColor" /> Start Watching Movie
      </button>

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
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [downloadToast, setDownloadToast] = useState(false);
  
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(hideTimer.current);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleDownload = () => {
    if (!movie) return;
    try {
      const stored = localStorage.getItem('sawaflix_downloads');
      let downloads = stored ? JSON.parse(stored) : [];
      if (!downloads.some(d => d.id === movie.id)) {
        downloads.push(movie);
        localStorage.setItem('sawaflix_downloads', JSON.stringify(downloads));
      }
      setDownloadToast(true);
      setTimeout(() => setDownloadToast(false), 3000);
    } catch (e) {
      console.error("Failed to save download", e);
    }
  };

  const handleSeek = (e) => {
    if (!duration || !playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(percent);
    setProgress(percent * 100);
  };

  const formatVideoTime = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black flex items-center justify-center cursor-none overflow-hidden animate-scaleIn ${
        isFullscreen ? 'w-screen h-screen fixed inset-0 z-[99999]' : 'w-full aspect-video rounded-2xl border border-white/10 shadow-2xl'
      }`}
      onMouseMove={handleMouseMove}
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {/* Video Content (YouTube Embed via ReactPlayer) */}
      <div className="absolute inset-0 bg-black pointer-events-none">
        <ReactPlayer
          ref={playerRef}
          url="https://www.youtube.com/watch?v=uNuCCkTFyAQ"
          playing={isPlaying}
          controls={false}
          width="100%"
          height="100%"
          onProgress={({ played, playedSeconds }) => {
            setProgress(played * 100);
            setPlayedSeconds(playedSeconds);
          }}
          onDuration={(d) => setDuration(d)}
          style={{ pointerEvents: 'none' }}
          config={{ youtube: { playerVars: { disablekb: 1, modestbranding: 1, rel: 0 } } }}
        />
        {/* Semi-transparent overlay to keep movie dark vibe if needed, but usually we want clear video */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Custom Download Toast Notification */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-black/80 backdrop-blur-md border border-[#FCD116]/30 shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${
        downloadToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'
      }`}>
        <div className="w-6 h-6 rounded-full bg-[#FCD116]/20 flex items-center justify-center">
          <Download size={14} className="text-[#FCD116]" />
        </div>
        <span className="text-white text-sm font-semibold tracking-wide">Downloading... Video saved offline!</span>
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
        className={`absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X size={18} className="text-white" />
          </button>
          <h3 className="text-white font-bold text-sm sm:text-base uppercase tracking-tight">
            {movie.title}
          </h3>
        </div>
      </div>

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 sm:px-6 pb-4 sm:pb-6 pt-12 transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrubber */}
        <div 
          className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group relative"
          onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
        >
          <div
            className="h-full bg-[#CE1126] rounded-full relative transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#CE1126] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); playerRef.current?.seekTo(playedSeconds - 10); }}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <SkipBack size={18} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
              className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause size={24} className="text-white" />
              ) : (
                <Play size={24} fill="white" className="text-white ml-1" />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); playerRef.current?.seekTo(playedSeconds + 10); }}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <SkipForward size={18} className="text-white" />
            </button>
            <span className="text-white/80 text-sm font-semibold tabular-nums ml-2 hidden sm:inline">
              {formatVideoTime(playedSeconds)} / {formatVideoTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Download size={18} className="text-white" />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer hidden sm:flex">
              <Settings size={18} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize size={18} className="text-white" /> : <Maximize size={18} className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
