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
import StatusModal from '../Dashboard/StatusModal';

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
        documents: { selfie_url: null, selfie_name: null, national_id_url: null, national_id_name: null, endorsement_letter_url: null, endorsement_letter_name: null }
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

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
            if (!id.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required.";
            if (!id.stage_name) newErrors.stage_name = "Stage Name is required.";
            if (!id.bio) newErrors.bio = "Bio is required.";
        } else if (step === 3) {
            const pro = formData.professional || {};
            if (!pro.experienceTime) newErrors.experienceTime = "Experience is required.";
            if (!pro.bio || pro.bio.length < 10) newErrors.bio = "Professional bio must be at least 10 characters.";
        } else if (step === 4) {
            if (!formData.documents?.national_id_url) newErrors.national_id = "Please upload your National ID to continue.";
            if (!formData.documents?.selfie_url) newErrors.selfie = "Please upload a Selfie to continue.";
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
        setIsSubmitting(true);
        try {
            console.log("Submitting:", formData);
            const result = await submitVerification({
                category: formData.category,
                form_data: {
                    identity: formData.identity,
                    professional: formData.professional,
                    documents: {
                        selfie_url: formData.documents.selfie_url,
                        national_id_url: formData.documents.national_id_url,
                        endorsement_letter_url: formData.documents.endorsement_letter_url
                    },
                    links: formData.portfolio?.links?.filter(l => l.trim() !== '') || []
                }
            });
            console.log("✅ Submission success:", result);
            
            // Show premium success modal
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Application Received',
                message: 'Thank you for applying to be a SawaFlix Creator. Our team will review your submission within 5 business days.'
            });
            
        } catch (error) {
            console.error("❌ Submission failed:", error);
            setIsSubmitting(false);
            
            // Show premium error modal
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Submission Failed',
                message: 'We encountered an error while processing your application. Please check your connection and try again.'
            });
        }
    };

    const handleModalClose = () => {
        if (modal.type === 'success') {
            window.location.href = '/dashboard';
        } else {
            setModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const showModal = (type, title, message) => {
        setModal({ isOpen: true, type, title, message });
    };

    if (!isLoaded) return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 sm:p-8 font-sans text-white antialiased overflow-hidden rounded-[2.5rem] bg-[#0B0E14]">
            <div className="w-full max-w-4xl h-[70vh] bg-[#131722] rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col animate-pulse">
                <div className="h-24 bg-[#0B0E14] border-b border-white/5 flex flex-col items-center justify-center px-6 py-6 shrink-0 rounded-t-[2.5rem]">
                    <div className="h-6 w-64 bg-white/10 rounded-full mb-3"></div>
                    <div className="h-3 w-40 bg-white/5 rounded-full"></div>
                </div>
                <div className="flex-1 p-6 sm:p-10 space-y-8 overflow-hidden">
                    <div className="flex justify-between items-center max-w-2xl mx-auto w-full mb-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-2 w-full mx-1 bg-white/5 rounded-full"></div>
                        ))}
                    </div>
                    <div className="space-y-6 max-w-2xl mx-auto w-full">
                        <div className="h-14 bg-white/5 rounded-2xl w-full"></div>
                        <div className="h-14 bg-white/5 rounded-2xl w-full"></div>
                        <div className="h-14 bg-white/5 rounded-2xl w-full"></div>
                    </div>
                </div>
                <div className="h-20 bg-[#0B0E14] border-t border-white/5 flex justify-between items-center px-6 rounded-b-[2.5rem] shrink-0">
                    <div className="h-8 w-24 bg-white/5 rounded-full"></div>
                    <div className="h-12 w-40 bg-white/10 rounded-2xl"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 sm:p-8 font-sans text-white antialiased overflow-hidden rounded-tl-3xl rounded-bl-3xl bg-[#0B0E14]">
            {/* Cinematic Overlay - removed background image for cleaner youtube-like look */}
            <div className="absolute inset-0 bg-[#0B0E14] z-0" />

            <style jsx>{`
                .glass-card {
                    background: #131722;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
            `}</style>
            
            <div className="absolute inset-0 z-0 pointer-events-none" />

            {/* Centralized Creator Application Card */}
            <div className="relative z-10 w-full max-w-4xl bg-transparent flex flex-col max-h-full py-4">
                
                {/* Header Context */}
                <div className="relative pb-6 flex flex-col sm:flex-row sm:items-end justify-between overflow-hidden shrink-0 border-b border-white/10 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                            Creator Verification
                        </h1>
                        <p className="text-zinc-400 text-sm font-medium">
                            Complete your profile to unlock creator tools.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 text-left sm:text-right">
                        <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">
                            Step {currentStep} of {steps.length}
                        </p>
                        <p className="text-white text-sm font-bold mt-1">
                            {steps[currentStep - 1]?.name}
                        </p>
                    </div>
                </div>

                {/* Form Content Area */}
                <div className="flex-1 flex flex-col relative overflow-y-auto scrollbar-hide pb-20">
                    <div className="w-full mb-8 shrink-0">
                        <ProgressBar currentStep={currentStep} steps={steps} />
                    </div>

                    <div className="max-w-2xl mx-auto w-full flex-1 pb-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                {currentStep === 1 && (
                                    <Step1Category data={formData} updateData={handleStep1Update} errors={errors} showModal={showModal} />
                                )}
                                {currentStep === 2 && (
                                    <Step2Identity data={formData.identity} updateData={(d) => updateFormData('identity', d)} errors={errors} showModal={showModal} />
                                )}
                                {currentStep === 3 && (
                                    <Step3Professional data={formData.professional} updateData={(d) => updateFormData('professional', d)} errors={errors} showModal={showModal} />
                                )}
                                {currentStep === 4 && (
                                    <Step4Portfolio data={formData.portfolio} documents={formData.documents} updatePortfolio={(d) => updateFormData('portfolio', d)} updateDocuments={(d) => updateFormData('documents', d)} errors={errors} showModal={showModal} />
                                )}
                                {currentStep === 5 && (
                                    <Step5Summary formData={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} showModal={showModal} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-between shrink-0 z-20 mt-8">
                    <div>
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group rounded-full hover:bg-white/5"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                        )}
                    </div>

                    <div>
                        {currentStep < 5 && (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-full font-bold text-sm transition-all flex items-center gap-2 group"
                            >
                                Continue
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Success/Error Modal */}
            <StatusModal
                isOpen={modal.isOpen}
                onClose={handleModalClose}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                actionText={modal.type === 'success' ? 'Go to Dashboard' : 'Try Again'}
            />
        </div>
    );
};

export default CreatorWizard;
