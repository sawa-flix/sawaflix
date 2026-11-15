'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  FileCheck2, 
  UserCheck, 
  Globe, 
  Video, 
  UploadCloud, 
  CheckSquare, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  FileText
} from 'lucide-react';
import { 
  ORGANIZATION_TYPES, 
  INITIAL_SECTOR_LIST, 
  DOCUMENT_TYPES 
} from '@/constants/organizationVerification';
import { 
  getOrganizationApplication, 
  saveOrganizationDraft, 
  uploadEvidenceDocument, 
  submitOrganizationApplication 
} from '@/lib/organizationVerification';

const STEPS = [
  { id: 1, title: 'Organization', icon: Building2 },
  { id: 2, title: 'Registration', icon: FileCheck2 },
  { id: 3, title: 'Representative', icon: UserCheck },
  { id: 4, title: 'Presence', icon: Globe },
  { id: 5, title: 'Content', icon: Video },
  { id: 6, title: 'Evidence', icon: UploadCloud },
  { id: 7, title: 'Declaration', icon: CheckSquare },
];

export default function OrganizationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const [formData, setFormData] = useState({
    organization: {
      legalName: '',
      brandName: '',
      organizationType: '',
      sectors: [],
      otherSector: '',
    },
    registration: {
      country: '',
      registrationNumber: '',
      taxId: '',
    },
    representative: {
      fullName: '',
      email: '',
      phone: '',
      title: '',
      preferredContact: 'email',
    },
    presence: {
      summary: '',
      website: '',
      socials: {
        instagram: '',
        youtube: '',
        linkedin: '',
        x: '',
      },
    },
    content: {
      intendedTypes: [],
      portfolioUrl: '',
      samplesSummary: '',
    },
    evidence: {},
    declaration: {
      authorized: false,
      acceptTerms: false,
      accuracyConfirmation: false,
    },
  });

  // Load existing draft or check status
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const app = await getOrganizationApplication();
        if (app && app.data) {
          const { status, currentStep: savedStep, ...data } = app.data;
          if (status === 'pending' || status === 'info_requested' || status === 'rejected' || status === 'approved') {
            router.push('/creator/organization/status');
            return;
          }
          setFormData((prev) => ({ ...prev, ...data }));
          if (savedStep) setCurrentStep(savedStep);
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    checkDraft();
  }, [router]);

  const updateSection = (section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    // clear error for this field
    if (errors[`${section}.${key}`]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[`${section}.${key}`];
        return updated;
      });
    }
  };

  const toggleSector = (sectorLabel) => {
    const current = formData.organization.sectors || [];
    const exists = current.includes(sectorLabel);
    const updated = exists ? current.filter((s) => s !== sectorLabel) : [...current, sectorLabel];
    updateSection('organization', 'sectors', updated);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveOrganizationDraft(formData, currentStep);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Step-by-step validations
  const validateCurrentStep = () => {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.organization.legalName.trim()) errs['organization.legalName'] = 'Legal name is required';
      if (!formData.organization.organizationType) errs['organization.organizationType'] = 'Organization type is required';
      if (!formData.organization.sectors || formData.organization.sectors.length === 0) {
        errs['organization.sectors'] = 'Select at least one sector';
      }
    } else if (currentStep === 2) {
      if (!formData.registration.country.trim()) errs['registration.country'] = 'Country of operation is required';
      if (!formData.registration.registrationNumber.trim()) errs['registration.registrationNumber'] = 'Registration number / ID is required';
    } else if (currentStep === 3) {
      if (!formData.representative.fullName.trim()) errs['representative.fullName'] = 'Full name is required';
      if (!formData.representative.email.trim() || !/\S+@\S+\.\S+/.test(formData.representative.email)) {
        errs['representative.email'] = 'Valid official email is required';
      }
      if (!formData.representative.title.trim()) errs['representative.title'] = 'Title / Authority is required';
    } else if (currentStep === 4) {
      if (!formData.presence.summary.trim() || formData.presence.summary.trim().length < 30) {
        errs['presence.summary'] = 'Provide a brief summary of at least 30 characters';
      }
    } else if (currentStep === 6) {
      const docs = formData.evidence || {};
      if (!docs.certificate_of_incorporation) {
        errs['evidence.certificate_of_incorporation'] = 'Certificate of incorporation is required';
      }
    } else if (currentStep === 7) {
      if (!formData.declaration.authorized) errs['declaration.authorized'] = 'Must confirm authorization';
      if (!formData.declaration.acceptTerms) errs['declaration.acceptTerms'] = 'Must accept platform terms';
      if (!formData.declaration.accuracyConfirmation) errs['declaration.accuracyConfirmation'] = 'Must confirm accuracy of information';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;
    await saveOrganizationDraft(formData, currentStep + 1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFileUpload = async (e, docId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(docId);
    try {
      const uploaded = await uploadEvidenceDocument(file, docId);
      setFormData((prev) => ({
        ...prev,
        evidence: {
          ...prev.evidence,
          [docId]: uploaded,
        },
      }));
      if (errors[`evidence.${docId}`]) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[`evidence.${docId}`];
          return updated;
        });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const removeDoc = (docId) => {
    setFormData((prev) => {
      const updated = { ...prev.evidence };
      delete updated[docId];
      return { ...prev, evidence: updated };
    });
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setIsSubmitting(true);
    try {
      await submitOrganizationApplication(formData);
      router.push('/creator/organization/status');
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest text-red-600 uppercase">
              Organization Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Apply as a Creator Organization
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Onboard your production company, media house, or record label to publish on SawaFlix.
            </p>
          </div>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl transition"
          >
            <Save size={14} className={isSaving ? 'animate-spin' : ''} />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>

        {saveSuccessNotice && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-400 bg-green-950/40 border border-green-800 px-3 py-2 rounded-lg">
            <CheckCircle2 size={14} /> Draft progress saved successfully.
          </div>
        )}

        {/* Stepper / Progress Bar */}
        <div className="mt-6 grid grid-cols-7 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : isDone
                      ? 'bg-green-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[10px] font-medium mt-1.5 hidden sm:block truncate ${
                    isActive ? 'text-white' : 'text-neutral-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-2xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: ORGANIZATION */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">1. Organization Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Legal Registered Name *
                  </label>
                  <input
                    type="text"
                    value={formData.organization.legalName}
                    onChange={(e) => updateSection('organization', 'legalName', e.target.value)}
                    placeholder="e.g., Sahel Media Productions Ltd."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  {errors['organization.legalName'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['organization.legalName']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Public / Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.organization.brandName}
                    onChange={(e) => updateSection('organization', 'brandName', e.target.value)}
                    placeholder="e.g., Sahel Studios"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Organization Type *
                </label>
                <select
                  value={formData.organization.organizationType}
                  onChange={(e) => updateSection('organization', 'organizationType', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                >
                  <option value="">Select organization type</option>
                  {ORGANIZATION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors['organization.organizationType'] && (
                  <p className="text-xs text-red-500 mt-1">{errors['organization.organizationType']}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Content Sectors (Select all that apply) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {INITIAL_SECTOR_LIST.map((sector) => {
                    const selected = (formData.organization.sectors || []).includes(sector.label);
                    return (
                      <button
                        type="button"
                        key={sector.id}
                        onClick={() => toggleSector(sector.label)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          selected
                            ? 'bg-red-600/20 border-red-600 text-white font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        {sector.label}
                      </button>
                    );
                  })}
                </div>
                {errors['organization.sectors'] && (
                  <p className="text-xs text-red-500 mt-1.5">{errors['organization.sectors']}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: REGISTRATION */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">2. Official Registration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Country of Registration / Operation *
                  </label>
                  <input
                    type="text"
                    value={formData.registration.country}
                    onChange={(e) => updateSection('registration', 'country', e.target.value)}
                    placeholder="e.g., Nigeria, Kenya, Côte d'Ivoire"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  {errors['registration.country'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['registration.country']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Company Registration / Business Identifier *
                  </label>
                  <input
                    type="text"
                    value={formData.registration.registrationNumber}
                    onChange={(e) => updateSection('registration', 'registrationNumber', e.target.value)}
                    placeholder="e.g., RC 1234567 or PV-9981"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  {errors['registration.registrationNumber'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['registration.registrationNumber']}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Tax Identification Number (TIN) (Optional)
                </label>
                <input
                  type="text"
                  value={formData.registration.taxId}
                  onChange={(e) => updateSection('registration', 'taxId', e.target.value)}
                  placeholder="e.g., TIN-998877"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: REPRESENTATIVE */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">3. Designated Creator Administrator</h2>
              <p className="text-xs text-neutral-400">
                This representative will receive the invitation to claim the organization creator-admin account upon approval.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Representative Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.representative.fullName}
                    onChange={(e) => updateSection('representative', 'fullName', e.target.value)}
                    placeholder="e.g., Amara Diallo"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  {errors['representative.fullName'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['representative.fullName']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Official Work Email *
                  </label>
                  <input
                    type="email"
                    value={formData.representative.email}
                    onChange={(e) => updateSection('representative', 'email', e.target.value)}
                    placeholder="representative@yourorg.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  {errors['representative.email'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['representative.email']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.representative.phone}
                    onChange={(e) => updateSection('representative', 'phone', e.target.value)}
                    placeholder="+225 07 00 00 00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Title / Position in Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.representative.title}
                    onChange={(e) => updateSection('representative', 'title', e.target.value)}
                    placeholder="e.g., Managing Director, Head of Content"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  {errors['representative.title'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['representative.title']}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PRESENCE */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">4. Public & Media Presence</h2>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Organization Summary / Mission *
                </label>
                <textarea
                  rows={4}
                  value={formData.presence.summary}
                  onChange={(e) => updateSection('presence', 'summary', e.target.value)}
                  placeholder="Describe your organization's mission, audience, and creative focus..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600"
                />
                {errors['presence.summary'] && (
                  <p className="text-xs text-red-500 mt-1">{errors['presence.summary']}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Official Website
                  </label>
                  <input
                    type="url"
                    value={formData.presence.website}
                    onChange={(e) => updateSection('presence', 'website', e.target.value)}
                    placeholder="https://www.yourorganization.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    YouTube Channel / Media Link
                  </label>
                  <input
                    type="url"
                    value={formData.presence.socials.youtube}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        presence: {
                          ...prev.presence,
                          socials: { ...prev.presence.socials, youtube: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://youtube.com/@channel"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: CONTENT */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">5. Content & Portfolio</h2>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Portfolio / Reel / Catalog URL
                </label>
                <input
                  type="url"
                  value={formData.content.portfolioUrl}
                  onChange={(e) => updateSection('content', 'portfolioUrl', e.target.value)}
                  placeholder="Link to Vimeo, Google Drive showcase, or Media Kit"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Intended Content / Catalog Overview
                </label>
                <textarea
                  rows={3}
                  value={formData.content.samplesSummary}
                  onChange={(e) => updateSection('content', 'samplesSummary', e.target.value)}
                  placeholder="Outline the type and frequency of content you plan to publish (e.g., 2 feature films, 12 weekly comedy episodes)..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 6: EVIDENCE & DOCUMENTS */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white">6. Verification Evidence Documents</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Upload official documentation to confirm legal identity. All documents are encrypted, stored securely, and only accessible by authorized SawaFlix reviewers. Max 10MB per file (.PDF, .PNG, .JPG).
                </p>
              </div>

              <div className="space-y-4">
                {DOCUMENT_TYPES.map((doc) => {
                  const uploaded = formData.evidence?.[doc.id];
                  const isUploading = uploadingDoc === doc.id;
                  const hasErr = errors[`evidence.${doc.id}`];

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-xl border transition ${
                        hasErr
                          ? 'border-red-500 bg-red-950/20'
                          : uploaded
                          ? 'border-green-600/40 bg-green-950/20'
                          : 'border-neutral-800 bg-neutral-950'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <FileText
                            size={20}
                            className={uploaded ? 'text-green-500' : 'text-neutral-500'}
                          />
                          <div>
                            <p className="text-sm font-semibold text-white">{doc.label}</p>
                            {uploaded ? (
                              <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 size={12} /> {uploaded.fileName || 'Document attached'}
                              </p>
                            ) : (
                              <p className="text-xs text-neutral-500">Required format: PDF or Image</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {uploaded ? (
                            <button
                              type="button"
                              onClick={() => removeDoc(doc.id)}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-800/60 bg-red-950/40"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          ) : (
                            <label className="cursor-pointer text-xs font-semibold px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center gap-2">
                              <UploadCloud size={14} className={isUploading ? 'animate-spin' : ''} />
                              {isUploading ? 'Uploading...' : 'Upload File'}
                              <input
                                type="file"
                                accept=".pdf,image/png,image/jpeg,image/webp"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => handleFileUpload(e, doc.id)}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                      {hasErr && <p className="text-xs text-red-500 mt-2">{hasErr}</p>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 7: DECLARATION & SUBMISSION */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white">7. Platform Terms & Authorization</h2>

              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 text-xs text-neutral-300">
                <p>
                  <strong>Summary of Application:</strong> {formData.organization.legalName} ({formData.registration.country})
                </p>
                <p>
                  <strong>Designated Admin:</strong> {formData.representative.fullName} ({formData.representative.email})
                </p>
                <p>
                  <strong>Sectors:</strong> {(formData.organization.sectors || []).join(', ') || 'None selected'}
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declaration.authorized}
                    onChange={(e) => updateSection('declaration', 'authorized', e.target.checked)}
                    className="mt-1 accent-red-600 rounded"
                  />
                  <span className="text-xs text-neutral-300">
                    I confirm that I am duly authorized to legally represent this organization and submit this application on its behalf.
                  </span>
                </label>
                {errors['declaration.authorized'] && (
                  <p className="text-xs text-red-500 ml-6">{errors['declaration.authorized']}</p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declaration.acceptTerms}
                    onChange={(e) => updateSection('declaration', 'acceptTerms', e.target.checked)}
                    className="mt-1 accent-red-600 rounded"
                  />
                  <span className="text-xs text-neutral-300">
                    I agree to SawaFlix's Creator Platform Terms of Service, Content Guidelines, and Privacy Policy.
                  </span>
                </label>
                {errors['declaration.acceptTerms'] && (
                  <p className="text-xs text-red-500 ml-6">{errors['declaration.acceptTerms']}</p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declaration.accuracyConfirmation}
                    onChange={(e) => updateSection('declaration', 'accuracyConfirmation', e.target.checked)}
                    className="mt-1 accent-red-600 rounded"
                  />
                  <span className="text-xs text-neutral-300">
                    I certify that all documentation and information provided are authentic, accurate, and current.
                  </span>
                </label>
                {errors['declaration.accuracyConfirmation'] && (
                  <p className="text-xs text-red-500 ml-6">{errors['declaration.accuracyConfirmation']}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed text-neutral-500'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-red-600/30"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/30"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
