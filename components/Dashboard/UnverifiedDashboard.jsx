'use client';
import StatusBanner from './StatusBanner';
import VerificationCTA from './VerificationCTA';

const CHECKLIST = [
  { icon: '🪪', text: 'Valid government-issued ID' },
  { icon: '📸', text: 'Professional profile photo' },
  { icon: '🔗', text: 'Social media or portfolio links' },
  { icon: '📄', text: 'Brief bio about your creative work' },
];

/**
 * 🟡 UnverifiedDashboard — shown when creatorType is set but user hasn't started verification.
 * Purpose: strongly encourage the creator to begin verification.
 *
 * @param {{ creatorType: import('../../types/creator').CreatorType|null }} props
 */
export default function UnverifiedDashboard({ creatorType }) {
  return (
    <div>
      <StatusBanner verificationStatus="unverified" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main card */}
        <div className="lg:col-span-3 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">
            Unlock your full creator potential
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Verified creators on SawaFlix can upload content, receive payments, and display an official creator badge.
            Verification usually takes 3–5 business days.
          </p>

          {/* What you'll unlock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              { icon: '🚀', label: 'Upload music & films' },
              { icon: '💰', label: 'Monetize your content' },
              { icon: '🏅', label: 'Official creator badge' },
              { icon: '📊', label: 'Audience analytics' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-xl">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-gray-300 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <VerificationCTA
            label="Start Verification"
            creatorType={creatorType}
          />
        </div>

        {/* Checklist sidebar */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">What you'll need</h3>
          <ul className="space-y-4">
            {CHECKLIST.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <p className="text-gray-400 text-sm leading-snug pt-1.5">{item.text}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-gray-600 border-t border-gray-800 pt-4">
            All documents are encrypted and reviewed only by our verification team.
          </p>
        </div>
      </div>
    </div>
  );
}
