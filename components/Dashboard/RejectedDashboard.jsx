'use client';
import StatusBanner from './StatusBanner';
import VerificationCTA from './VerificationCTA';

/**
 * 🔴 RejectedDashboard — shown when verification_status = 'rejected'.
 * Purpose: show rejection reason and guide creator to resubmit.
 * Connects back to Beleh's verification wizard.
 *
 * @param {{
 *   creatorType: import('../../types/creator').CreatorType|null,
 *   rejectionReason?: string|null,
 * }} props
 */
export default function RejectedDashboard({ creatorType, rejectionReason }) {
  const COMMON_REASONS = [
    '📷 ID photo was unclear or could not be verified',
    '📋 Portfolio/links were inaccessible or insufficient',
    '📝 Bio did not meet minimum content requirements',
    '🔗 Social media links did not match the submitted identity',
  ];

  const hasSpecificReason = !!rejectionReason;

  return (
    <div>
      <StatusBanner verificationStatus="rejected" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main rejection info */}
        <div className="lg:col-span-3 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="shrink-0 w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Verification Not Approved</h2>
              <p className="text-gray-400 text-sm">
                Don't worry — you can update your information and resubmit. Most creators are approved on the second attempt.
              </p>
            </div>
          </div>

          {/* Rejection reason */}
          {hasSpecificReason ? (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-700/30 rounded-xl">
              <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-1.5">
                Review Feedback
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">{rejectionReason}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-800/60 border border-gray-700/40 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                Common rejection reasons
              </p>
              <ul className="space-y-2">
                {COMMON_REASONS.map((reason) => (
                  <li key={reason} className="text-sm text-gray-400 leading-snug">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <VerificationCTA
              label="Update & Resubmit"
              creatorType={creatorType}
              href="/verification/start"
            />
            <p className="text-xs text-gray-500">
              Your previous answers will be pre-filled
            </p>
          </div>
        </div>

        {/* Tips sidebar */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Tips for resubmission</h3>
          <ul className="space-y-4">
            {[
              { icon: '💡', tip: 'Use a high-resolution, well-lit photo of your ID' },
              { icon: '🔗', tip: 'Ensure all portfolio links are publicly accessible' },
              { icon: '📝', tip: 'Write a compelling bio (minimum 100 words)' },
              { icon: '🎭', tip: 'Confirm your social handles match your real identity' },
            ].map((item) => (
              <li key={item.tip} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <p className="text-sm text-gray-400 leading-snug">{item.tip}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-gray-600 border-t border-gray-800 pt-4">
            Need help? Contact{' '}
            <a href="mailto:support@sawaflix.com" className="text-red-500 hover:underline">
              support@sawaflix.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
