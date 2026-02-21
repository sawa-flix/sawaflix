'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import ProgressBar from './ProgressBar';
import Step1Category from './Step1Category';
import Step2Identity from './Step2Identity';
import Step3Professional from './Step3Professional';
import Step4Portfolio from './Step4Portfolio';
import Step5Summary from './Step5Summary';

const STORAGE_KEY = 'sawaflix_creator_wizard_draft_v2';

const steps = [
    { id: 1, name: 'Category' },
    { id: 2, name: 'Identity' },
    { id: 3, name: 'Professional' },
    { id: 4, name: 'Portfolio' },
    { id: 5, name: 'Summary' },
];

const CreatorWizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        category: '',
        identity: {},
        professional: {},
        portfolio: { recordings: [], links: [] },
        documents: { id: null, endorsements: null }
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const { step, data } = JSON.parse(saved);
                setCurrentStep(step || 1);
                setFormData(data || formData);
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                step: currentStep,
                data: formData
            }));
        }
    }, [currentStep, formData, isLoaded]);

    const updateFormData = (key, data) => {
        setFormData(prev => ({
            ...prev,
            [key]: { ...prev[key], ...data }
        }));
        setError(""); // Clear error when user changes anything
    };

    const handleStep1Update = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
        setError(""); // Clear error
    };

    const validateStep = (step) => {
        setError("");

        if (step === 1) {
            if (!formData.category) {
                setError("Please fill in the field: Category is required");
                return false;
            }
        } else if (step === 2) {
            const result = z.object({
                legalName: z.string().min(1, "Please fill in the field: Legal Name"),
                creatorName: z.string().min(1, "Please fill in the field: Creator Name"),
                ethnicGroup: z.string().min(1, "Please fill in the field: Ethnic Group"),
                phone: z.string().min(1, "Please fill in the field: Phone Number"),
                email: z.string().email("Please enter a valid email address")
            }).safeParse(formData.identity || {});

            if (!result.success) {
                const message = result.error.issues?.[0]?.message || result.error.errors?.[0]?.message || "Please fill in all required fields";
                setError(message);
                return false;
            }
        } else if (step === 3) {
            const result = z.object({
                languages: z.string().min(1, "Please fill in the field: Languages"),
                experienceTime: z.string().min(1, "Please fill in the field: Experience Time"),
                bio: z.string().min(10, "Please fill in the field: Bio (min. 10 characters)")
            }).safeParse(formData.professional || {});

            if (!result.success) {
                const message = result.error.issues?.[0]?.message || result.error.errors?.[0]?.message || "Please fill in all required fields";
                setError(message);
                return false;
            }
        } else if (step === 4) {
            const recordings = formData.portfolio.recordings || [];
            if (recordings.length < 3) {
                setError("Please provide information for at least 3 sample recordings");
                return false;
            }

            for (let i = 0; i < 3; i++) {
                const rec = recordings[i] || {};
                if (!rec.title || !rec.description || !rec.significance) {
                    setError(`Please fill in the field: Sample Recording ${i + 1} is missing information`);
                    return false;
                }
            }

            if (!formData.documents.id) {
                setError("Please fill in the field: Government ID is required");
                return false;
            }
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        console.log("Submitting:", formData);
        alert("Verification submitted successfully!");
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white py-12 px-4 sm:px-6 lg:px-8 font-inter font-inter">
            {/* Header (Same for all steps) */}
            <header className="text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-red-900/10 border border-red-700/30 text-red-500 text-xs font-black uppercase tracking-widest"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                    Exclusive Creator Program
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
                    Share Your <span className="text-red-600">Cultural Story</span>
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                    Join SawaFlix as a verified creator and preserve your cultural heritage for future generations while earning from your authentic content.
                </p>
            </header>

            <ProgressBar currentStep={currentStep} steps={steps} />

            <div className="mt-20 max-w-4xl mx-auto transition-all duration-500">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-[#151C25] rounded-[3rem] border border-gray-800/50 shadow-2xl p-8 md:p-14 relative overflow-hidden"
                    >
                        {/* Glowing Accent */}
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

                        {currentStep === 1 && (
                            <Step1Category
                                data={formData}
                                updateData={handleStep1Update}
                            />
                        )}
                        {currentStep === 2 && (
                            <Step2Identity
                                data={formData.identity}
                                updateData={(d) => updateFormData('identity', d)}
                            />
                        )}
                        {currentStep === 3 && (
                            <Step3Professional
                                data={formData.professional}
                                updateData={(d) => updateFormData('professional', d)}
                            />
                        )}
                        {currentStep === 4 && (
                            <Step4Portfolio
                                data={formData.portfolio}
                                documents={formData.documents}
                                updatePortfolio={(d) => updateFormData('portfolio', d)}
                                updateDocuments={(d) => updateFormData('documents', d)}
                            />
                        )}
                        {currentStep === 5 && (
                            <Step5Summary
                                formData={formData}
                                onSubmit={handleSubmit}
                            />
                        )}

                        {/* Navigation */}
                        <div className="flex flex-col mt-12 pt-10 border-t border-gray-800/50">
                            {error && (
                                <div className="mb-8 p-6 bg-red-500 border border-red-600 rounded-[2rem] flex items-center gap-4 text-white text-sm font-black shadow-2xl animate-pulse">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="uppercase tracking-widest text-[10px] mb-1 opacity-80">Action Required</p>
                                        <p className="text-lg">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 1}
                                    className={`px-8 py-3 rounded-2xl font-black transition-all uppercase tracking-widest text-sm ${currentStep === 1
                                        ? 'opacity-0 pointer-events-none'
                                        : 'bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400'
                                        }`}
                                >
                                    Back
                                </button>

                                {currentStep < 5 && (
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-3 px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all transform hover:scale-[1.05] active:scale-95 shadow-xl shadow-red-900/20 uppercase tracking-widest text-sm"
                                    >
                                        Continue
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Stats Cards (Desktop Only) */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-gray-900/30 p-8 rounded-[2rem] border border-gray-800/50 flex items-center gap-6 group hover:bg-gray-900/50 transition-all">
                    <div className="w-16 h-16 bg-red-900/10 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-black text-2xl mb-1 tracking-tight">1K+ Creators</h4>
                        <p className="text-gray-500 font-medium leading-tight">Join our growing community of verified cultural creators</p>
                    </div>
                </div>
                <div className="bg-gray-900/30 p-8 rounded-[2rem] border border-gray-800/50 flex items-center gap-6 group hover:bg-gray-900/50 transition-all">
                    <div className="w-16 h-16 bg-yellow-900/10 rounded-2xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L9.27 8.64 1 9.33l6 5.21-1.41 8.19L12 18.25l7.41 4.48L18 14.54l6-5.21-8.27-.69L12 1z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-black text-2xl mb-1 tracking-tight">Premium Quality</h4>
                        <p className="text-gray-500 font-medium leading-tight">Curated platform ensuring authentic cultural content</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
            .font-inter { font-family: 'Inter', sans-serif; }
        `}</style>
        </div>
    );
};

export default CreatorWizard;
