'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Tv, Sparkles, Users, Film, Smile, Heart, 
  FileText, Play, Clock, Compass, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { BACKEND_URL } from '../../lib/apiConfig';

export default function OnboardingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  // Onboarding Selection State
  const [language, setLanguage] = useState('');
  const [userType, setUserType] = useState('');
  const [preferredGenres, setPreferredGenres] = useState([]);
  const [preferredVideoLength, setPreferredVideoLength] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
        if (session) {
          setToken(session.access_token);
        }
      } catch (err) {
        console.error('Error fetching Supabase session for onboarding:', err);
      }
    }
    fetchSession();
  }, []);

  if (!isOpen) return null;

  const handleGenreToggle = (genre) => {
    setPreferredGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStatusMessage('Saving your preferences...');

    const payload = {
      userId,
      language,
      preferredGenres,
      userType,
      preferredVideoLength
    };

    console.log('Sending onboarding payload:', payload);

    try {
      const response = await fetch(`${BACKEND_URL}/api/user/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned code: ${response.status}`);
      }

      console.log('Onboarding submitted successfully');
    } catch (err) {
      console.warn('API onboarding failed, falling back to local simulation:', err.message);
    } finally {
      // Set completed key in localStorage so the user is not locked out of testing
      localStorage.setItem('sawaflix_onboarding_completed_test', 'true');
      setIsSubmitting(false);
      onClose();
    }
  };

  // Check if current step selections are valid
  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!language;
      case 2:
        return !!userType;
      case 3:
        return preferredGenres.length >= 2;
      case 4:
        return !!preferredVideoLength;
      default:
        return false;
    }
  };

  // Variants for modal steps animation
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#0B0E14] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-red-800/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Progress indicator */}
        <div className="pt-8 px-8 flex justify-between items-center z-10">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map(idx => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step 
                    ? 'w-8 bg-[#E50914]' 
                    : idx < step 
                      ? 'w-3 bg-red-950 border border-red-800/30' 
                      : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Step {step} of 4
          </span>
        </div>

        {/* Scrollable middle section */}
        <div className="flex-1 px-8 py-6 z-10 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-white text-3xl font-black tracking-tight leading-tight">
                    Choose Language
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Select your preferred language for content delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { code: 'en', label: 'English', desc: 'Read and listen in English' },
                    { code: 'fr', label: 'Français', desc: 'Lire et écouter en Français' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between group ${
                        language === lang.code
                          ? 'border-[#E50914] bg-[#E50914]/10 text-white shadow-lg shadow-red-950/20'
                          : 'border-white/5 bg-white/5 hover:border-white/20 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2.5 rounded-xl ${language === lang.code ? 'bg-[#E50914]' : 'bg-white/5'} transition-colors`}>
                          <Globe size={20} />
                        </div>
                        {language === lang.code && (
                          <CheckCircle2 size={20} className="text-[#E50914]" />
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="font-bold text-base text-white">{lang.label}</p>
                        <p className="text-xs text-gray-400 mt-1">{lang.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-white text-3xl font-black tracking-tight leading-tight">
                    What describes you best?
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Tell us how you plan to use Sawaflix.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'viewer', label: 'Viewer', desc: 'I want to watch & discover content', icon: Tv },
                    { id: 'creator', label: 'Creator', desc: 'I want to publish my creative content', icon: Sparkles },
                    { id: 'both', label: 'Both', desc: 'I want to watch and upload content', icon: Users }
                  ].map(role => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setUserType(role.id)}
                        className={`p-4 rounded-xl border text-left transition-all duration-300 flex items-center justify-between ${
                          userType === role.id
                            ? 'border-[#E50914] bg-[#E50914]/10 text-white shadow-lg shadow-red-950/20'
                            : 'border-white/5 bg-white/5 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2.5 rounded-lg ${userType === role.id ? 'bg-[#E50914]' : 'bg-white/5'}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{role.label}</p>
                            <p className="text-xs text-gray-400">{role.desc}</p>
                          </div>
                        </div>
                        {userType === role.id && (
                          <CheckCircle2 size={18} className="text-[#E50914]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-white text-3xl font-black tracking-tight leading-tight">
                    Pick your interests
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Select at least 2 genres (selected {preferredGenres.length}).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
                  {[
                    { id: 'action', label: 'Action', icon: Film },
                    { id: 'comedy', label: 'Comedy', icon: Smile },
                    { id: 'drama', label: 'Drama', icon: Heart },
                    { id: 'documentary', label: 'Documentary', icon: FileText },
                    { id: 'romance', label: 'Romance', icon: Heart },
                    { id: 'thriller', label: 'Thriller', icon: Play }
                  ].map(genre => {
                    const Icon = genre.icon;
                    const isSelected = preferredGenres.includes(genre.id);
                    return (
                      <button
                        key={genre.id}
                        onClick={() => handleGenreToggle(genre.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-300 flex items-center justify-between ${
                          isSelected
                            ? 'border-[#E50914] bg-[#E50914]/10 text-white shadow-lg shadow-red-950/20'
                            : 'border-white/5 bg-white/5 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon size={16} className={isSelected ? 'text-[#E50914]' : 'text-gray-400'} />
                          <span className="font-semibold text-xs">{genre.label}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#E50914] flex items-center justify-center">
                            <span className="text-[10px] text-white">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-white text-3xl font-black tracking-tight leading-tight">
                    Preferred Video Length
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    What style of videos do you prefer?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'short', label: 'Short', desc: '<15 min', icon: Clock },
                    { id: 'medium', label: 'Medium', desc: '15-60 min', icon: Clock },
                    { id: 'long', label: 'Long', desc: '>60 min', icon: Clock },
                    { id: 'any', label: 'Any', desc: 'No preference', icon: Compass }
                  ].map(len => {
                    const Icon = len.icon;
                    return (
                      <button
                        key={len.id}
                        onClick={() => setPreferredVideoLength(len.id)}
                        className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
                          preferredVideoLength === len.id
                            ? 'border-[#E50914] bg-[#E50914]/10 text-white shadow-lg'
                            : 'border-white/5 bg-white/5 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon size={18} className={preferredVideoLength === len.id ? 'text-[#E50914]' : 'text-gray-400'} />
                          {preferredVideoLength === len.id && <CheckCircle2 size={16} className="text-[#E50914]" />}
                        </div>
                        <div className="mt-4">
                          <p className="font-bold text-xs text-white">{len.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{len.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="px-8 pb-8 pt-4 flex items-center justify-between bg-black/40 border-t border-white/5 z-10">
          <button
            onClick={handleBack}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
              step > 1 
                ? 'text-gray-400 hover:text-white cursor-pointer' 
                : 'text-gray-700 cursor-not-allowed opacity-50'
            }`}
            disabled={step === 1 || isSubmitting}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid() || isSubmitting}
            className={`px-8 py-3.5 rounded-full font-bold text-sm flex items-center space-x-2 transition-all cursor-pointer ${
              isStepValid() && !isSubmitting
                ? 'bg-[#E50914] hover:bg-[#C11119] text-white shadow-lg shadow-red-950/20'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{isSubmitting ? 'Saving...' : step === 4 ? 'Get Started' : 'Continue'}</span>
            {!isSubmitting && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
