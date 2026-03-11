'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';
import Step1Category from './Step1Category';
import Step2Identity from './Step2Identity';
import Step3Professional from './Step3Professional';
import Step4Portfolio from './Step4Portfolio';
import Step5Summary from './Step5Summary';
import { getDraft, saveDraft, submitVerification } from '../../lib/verification';
import { useRouter } from 'next/navigation';

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
        documents: { id_url: null, id_name: null, endorsements_url: null, endorsements_name: null }
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadDraft = async () => {
            try {
                const draft = await getDraft();
                if (draft && draft.data) {
                    const { category, status, formData: savedData } = draft.data;
                    
                    // Redirect if already submitted or processed
                    if (status === 'pending') {
                        router.push('/creator/pending');
                        return;
                    } else if (status === 'approved' || status === 'rejected') {
                        router.push('/creator-dashboard');
                        return;
                    }

                    if (savedData) {
                        setFormData(prev => ({ ...prev, ...savedData }));
                        setCurrentStep(savedData.step || 1);
                    } else if (category) {
                        setFormData(prev => ({ ...prev, category }));
                    }
                }
            } catch (e) {
                console.error("Failed to load draft", e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadDraft();
    }, []);

    const persistDraft = async (step, data) => {
        try {
            await saveDraft({
                category: data.category || 'unspecified',
                form_data: { ...data, step }
            });
        } catch (e) {
            console.error("Failed to save draft", e);
        }
    };

    const updateFormData = (key, data) => {
        setFormData(prev => ({
            ...prev,
            [key]: { ...prev[key], ...data }
        }));
        // Clear errors for changed fields
        const changedFields = Object.keys(data);
        setErrors(prev => {
            const next = { ...prev };
            changedFields.forEach(f => delete next[f]);
            return next;
        });
    };

    const handleStep1Update = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
        if (data.category) setErrors(prev => { const n = { ...prev }; delete n.category; return n; });
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.category) newErrors.category = "Please select a creator category to continue.";
        } else if (step === 2) {
            const id = formData.identity || {};
            if (!id.legalName) newErrors.legalName = "Legal Name is required.";
            if (!id.creatorName) newErrors.creatorName = "Creator Name is required.";
            if (!id.ethnicGroup) newErrors.ethnicGroup = "Ethnic Group / Community is required.";
            if (!id.phone) newErrors.phone = "Phone number is required.";
            if (!id.email) newErrors.email = "Email is required.";
            else if (!/\S+@\S+\.\S+/.test(id.email)) newErrors.email = "Please enter a valid email address.";
        } else if (step === 3) {
            const pro = formData.professional || {};
            if (!pro.languages) newErrors.languages = "Languages is required.";
            if (!pro.experienceTime) newErrors.experienceTime = "Experience is required.";
            if (!pro.bio || pro.bio.length < 10) newErrors.bio = "Bio must be at least 10 characters.";
        } else if (step === 4) {
            if (!formData.documents?.id_url) newErrors.id = "Please upload your Government ID to continue.";
            
            // Recording requirement removed as per user request
            /*
            const portfolio = formData.portfolio || {};
            const recordings = portfolio.recordings || [];
            const validRecordings = recordings.filter(r => r.file_url && r.title && r.description);
            if (validRecordings.length < 3) {
                newErrors.recordings = "Please provide at least 3 sample recordings with titles and descriptions.";
            }
            */
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (validateStep(currentStep)) {
            const nextStep = Math.min(currentStep + 1, steps.length);
            setCurrentStep(nextStep);
            await persistDraft(nextStep, formData);
        }
    };

    const handleBack = async () => {
        const prevStep = Math.max(currentStep - 1, 1);
        setCurrentStep(prevStep);
        await persistDraft(prevStep, formData);
        setErrors({});
    };

    const router = useRouter();

    const handleSubmit = async () => {
        try {
            console.log("Submitting:", formData);
            await submitVerification({
                category: formData.category,
                form_data: formData
            });
            // success logic: redirect to creator pending dashboard
            router.push('/creator/pending');
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit verification. Please try again.");
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#0B0E14' }}>
            <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#0B0E14' }} className="h-14 px-8 flex items-center justify-between flex-shrink-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                    </div>
                    <span className="text-lg font-black text-white tracking-tight">SawaFlix</span>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                <div className="hidden lg:block w-[40%] flex-shrink-0 relative overflow-hidden">
                    <img
                        src="/images/image.png"
                        alt="Creator Background"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.3) 100%)' }} />
                    <div className="absolute inset-0" style={{ background: 'rgba(180,0,0,0.15)' }} />

                    <div className="absolute inset-0 flex flex-col justify-start p-10 pt-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                Exclusive Creator Program
                            </div>
                            <h1 className="text-5xl font-black text-white leading-tight">
                                Share Your <br />
                                <span className="text-red-500">Cultural Story</span>
                            </h1>
                            <p className="text-gray-200 text-sm font-semibold leading-relaxed">
                                Join SawaFlix as a verified creator and preserve your cultural heritage for future generations while earning from your authentic content.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1" style={{ backgroundColor: '#0B0E14' }}>
                    <div className="h-full overflow-y-auto px-6 lg:px-10 py-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div className="max-w-lg mx-auto">
                            <div className="flex-shrink-0 mb-8">
                                <ProgressBar currentStep={currentStep} steps={steps} />
                            </div>

                            <div className="flex-1">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        {currentStep === 1 && (
                                            <Step1Category
                                                data={formData}
                                                updateData={handleStep1Update}
                                                errors={errors}
                                            />
                                        )}
                                        {currentStep === 2 && (
                                            <Step2Identity
                                                data={formData.identity}
                                                updateData={(d) => updateFormData('identity', d)}
                                                errors={errors}
                                            />
                                        )}
                                        {currentStep === 3 && (
                                            <Step3Professional
                                                data={formData.professional}
                                                updateData={(d) => updateFormData('professional', d)}
                                                errors={errors}
                                            />
                                        )}
                                        {currentStep === 4 && (
                                            <Step4Portfolio
                                                data={formData.portfolio}
                                                documents={formData.documents}
                                                updatePortfolio={(d) => updateFormData('portfolio', d)}
                                                updateDocuments={(d) => updateFormData('documents', d)}
                                                errors={errors}
                                            />
                                        )}
                                        {currentStep === 5 && (
                                            <Step5Summary
                                                formData={formData}
                                                onSubmit={handleSubmit}
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="flex-shrink-0 mt-6">
                                <div className="flex justify-between items-center mb-6">
                                    {currentStep > 1 ? (
                                        <button
                                            onClick={handleBack}
                                            className="text-gray-500 hover:text-gray-300 font-semibold text-sm transition-colors uppercase tracking-widest"
                                        >
                                            ← Prev
                                        </button>
                                    ) : <div />}

                                    {currentStep < 5 && (
                                        <button
                                            onClick={handleNext}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105"
                                            style={{ backgroundColor: '#fff', color: '#DC2626' }}
                                        >
                                            Continue
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#141820', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}>
                                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm5.11 3.2c-1.3-.4-2.8-.6-4.1-.6-1.3 0-2.8.2-4.1.6C3.48 14.6 2 16.1 2 18v2h18v-2c0-1.9-1.48-3.4-3.11-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-xs">1k+ Creators</p>
                                            <p className="text-gray-500 text-[10px] leading-tight mt-0.5">Join our growing community of verified cultural creators</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: '#141820', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(251,146,60,0.1)' }}>
                                            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-xs">Premium Quality</p>
                                            <p className="text-gray-500 text-[10px] leading-tight mt-0.5">Curated platform ensuring authentic cultural content</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatorWizard;
