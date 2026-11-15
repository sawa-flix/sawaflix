'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  UploadCloud, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  getOrganizationApplication, 
  respondToInfoRequest, 
  uploadEvidenceDocument 
} from '@/lib/organizationVerification';
import DashboardWrapper from '@/components/Dashboard/DashboardWrapper';

export default function OrganizationStatusPage() {
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [infoResponseText, setInfoResponseText] = useState('');
  const [additionalFile, setAdditionalFile] = useState(null);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getOrganizationApplication();
        if (res && res.data) {
          setAppData(res.data);
        } else {
          // Fallback sample pending state for verification if no draft exists
          setAppData({
            status: 'pending',
            organization: { legalName: 'Applicant Organization' },
            submittedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error fetching application status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!infoResponseText.trim() && !additionalFile) return;

    setIsSubmittingInfo(true);
    try {
      let uploadedDoc = null;
      if (additionalFile) {
        uploadedDoc = await uploadEvidenceDocument(additionalFile, 'supplementary_evidence');
      }

      await respondToInfoRequest(appData?.id || 'current', {
        ...appData,
        infoResponse: infoResponseText,
        supplementaryDoc: uploadedDoc,
        status: 'pending', // Returns to reviewable queue
      });

      setSubmitSuccess(true);
      setAppData((prev) => ({ ...prev, status: 'pending' }));
    } catch (err) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  if (loading) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardWrapper>
    );
  }

  const status = appData?.status || 'pending';
  const orgName = appData?.organization?.legalName || 'Your Organization';

  return (
    <DashboardWrapper>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Status Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* 1. PENDING REVIEW */}
          {status === 'pending' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <Clock size={32} />
              </div>
              <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                Application Under Review
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {orgName}
              </h1>
              <p className="text-sm text-neutral-400 max-w-lg mx-auto">
                Your organization verification application is currently queued for review by SawaFlix Super Admins. We will verify your official credentials and contact the designated administrator.
              </p>

              {/* Guard Notice: No creator-admin / publishing access */}
              <div className="mt-6 p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center gap-3 text-left">
                <ShieldAlert size={20} className="text-amber-500 shrink-0" />
                <p className="text-xs text-neutral-400">
                  <strong className="text-neutral-200">Access Restricted:</strong> Creator administrator credentials and media publishing access will be provided only after official approval.
                </p>
              </div>
            </div>
          )}

          {/* 2. INFORMATION REQUESTED */}
          {status === 'info_requested' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-semibold rounded-full uppercase">
                    Action Required
                  </span>
                  <h1 className="text-xl font-bold text-white mt-1">Additional Information Requested</h1>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 text-xs text-blue-200">
                <strong>Reviewer Note:</strong>
                <p className="mt-1 text-neutral-300">
                  {appData?.reviewNotes || 'Please upload a clearer copy of your Certificate of Incorporation or an authorized Letter of Representation.'}
                </p>
              </div>

              {submitSuccess ? (
                <div className="p-4 rounded-xl bg-green-950/30 border border-green-800 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> Your response has been submitted and returned to the review queue.
                </div>
              ) : (
                <form onSubmit={handleInfoSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Your Response / Clarification
                    </label>
                    <textarea
                      rows={3}
                      value={infoResponseText}
                      onChange={(e) => setInfoResponseText(e.target.value)}
                      placeholder="Provide the requested details or answers here..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Attach Supplementary Document (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={(e) => setAdditionalFile(e.target.files?.[0])}
                      className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingInfo}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/30 disabled:opacity-50"
                  >
                    {isSubmittingInfo ? 'Submitting...' : 'Submit Response & Resubmit'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 3. APPROVED */}
          {status === 'approved' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <span className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                Organization Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome to SawaFlix, {orgName}!
              </h1>
              <p className="text-sm text-neutral-400 max-w-lg mx-auto">
                An invitation claim link has been emailed to your designated administrator ({appData?.representative?.email || 'your registered email'}). Follow the link to activate your organization creator-admin workspace.
              </p>
            </div>
          )}

          {/* 4. REJECTED */}
          {status === 'rejected' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                <XCircle size={32} />
              </div>
              <span className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                Application Declined
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Application Not Approved
              </h1>
              {appData?.reviewNotes && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-xs text-red-300 max-w-lg mx-auto text-left">
                  <strong>Feedback from Reviewer:</strong>
                  <p className="mt-1">{appData.reviewNotes}</p>
                </div>
              )}
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                You may review and address the feedback to submit a new application once eligibility criteria are satisfied.
              </p>
              <div className="pt-2">
                <Link
                  href="/creator/organization/apply"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Review & Reapply
                </Link>
              </div>
            </div>
          )}

          {/* Submitted Summary Overview */}
          <div className="mt-8 pt-8 border-t border-neutral-800 text-left">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
              Submitted Organization Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-300">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
                <span className="text-neutral-500 block mb-0.5">Registration</span>
                <span className="font-semibold text-white">
                  {appData?.registration?.country || 'N/A'} • {appData?.registration?.registrationNumber || 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
                <span className="text-neutral-500 block mb-0.5">Designated Administrator</span>
                <span className="font-semibold text-white">
                  {appData?.representative?.fullName || 'N/A'} ({appData?.representative?.email || 'N/A'})
                </span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 sm:col-span-2">
                <span className="text-neutral-500 block mb-0.5">Sectors</span>
                <span className="font-semibold text-white">
                  {Array.isArray(appData?.organization?.sectors)
                    ? appData.organization.sectors.join(', ')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
