'use client';
import StatusBanner from './StatusBanner';

/**
 * 🟠 PendingDashboard — shown while verification is under review.
 * Purpose: keep the creator informed, disable actions.
 *
 * @param {{
 *   creatorType: import('../../types/creator').CreatorType|null,
 *   submittedAt?: string|null
 * }} props
 */
export default function PendingDashboard({ creatorType, submittedAt }) {
  const submittedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : 'Recently submitted';

  const DISABLED_TOOLS = [
    { icon: '🎵', label: 'Upload Content', reason: 'Available after approval' },
    { icon: '💰', label: 'Monetization', reason: 'Available after approval' },
    { icon: '📊', label: 'Analytics', reason: 'Available after approval' },
    { icon: '🏅', label: 'Creator Badge', reason: 'Pending verification' },
  ];

  return (
    <div>
      <StatusBanner verificationStatus="pending" />

      {/* Progress card */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Verification in Progress</h2>
            <p className="text-gray-400 text-sm">Submitted on {submittedDate}</p>
          </div>

          {/* Animated pulse badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-300 text-sm font-semibold">Under Review</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pl-5 border-l-2 border-gray-800 space-y-6">
          {[
            { label: 'Application submitted', done: true, date: submittedDate },
            { label: 'Document review', done: false, active: true, date: 'In progress...' },
            { label: 'Identity verification', done: false, date: 'Upcoming' },
            { label: 'Decision & notification', done: false, date: 'Upcoming' },
          ].map((step, i) => (
            <div key={i} className="relative flex items-start gap-3">
              {/* Dot */}
              <div className={`
                absolute -left-[21px] w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${step.done
                  ? 'border-emerald-500 bg-emerald-500'
                  : step.active
                    ? 'border-orange-400 bg-orange-400/20 animate-pulse'
                    : 'border-gray-700 bg-gray-900'
                }
              `}>
                {step.done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.5 7.5L2 6l-.7.7 2.2 2.2 5-5-.7-.7L3.5 7.5z" />
                  </svg>
                )}
              </div>
              <div className="pb-1">
                <p className={`text-sm font-medium ${step.done ? 'text-emerald-400' : step.active ? 'text-orange-300' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{step.date}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-gray-500 bg-gray-800/60 rounded-xl p-3">
          ⏱ Typical review time: <span className="text-gray-300">3–5 business days</span>. You'll receive an email notification when a decision is made.
        </p>
      </div>

      {/* Disabled tools grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Creator Tools — Available After Approval
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DISABLED_TOOLS.map((tool) => (
            <div
              key={tool.label}
              className="p-4 bg-gray-900/40 border border-gray-800/60 rounded-2xl opacity-40 cursor-not-allowed"
            >
              <div className="text-2xl mb-2">{tool.icon}</div>
              <p className="text-sm font-medium text-gray-400">{tool.label}</p>
              <p className="text-xs text-gray-600 mt-1">{tool.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
