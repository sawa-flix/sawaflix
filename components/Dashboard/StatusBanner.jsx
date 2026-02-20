'use client';

/**
 * StatusBanner — full-width colored banner below the shell header.
 * Maps verificationStatus to a themed banner with icon + message.
 *
 * @param {{ verificationStatus: import('../../types/creator').VerificationStatus }} props
 */
export default function StatusBanner({ verificationStatus }) {
  const banners = {
    unverified: {
      icon: '🔑',
      title: 'Your account is not yet verified',
      message: 'Complete verification to unlock uploads, monetization, and your creator badge.',
      className: 'border-yellow-500/30 bg-gradient-to-r from-yellow-950/60 to-yellow-900/20 text-yellow-200',
      iconBg: 'bg-yellow-500/20',
    },
    pending: {
      icon: '⏳',
      title: 'Verification under review',
      message: 'Our team is reviewing your submission. You\'ll be notified once a decision is made.',
      className: 'border-orange-500/30 bg-gradient-to-r from-orange-950/60 to-orange-900/20 text-orange-200',
      iconBg: 'bg-orange-500/20',
    },
    approved: {
      icon: '✅',
      title: 'You are a verified creator!',
      message: 'Full access unlocked. Welcome to the SawaFlix creator community.',
      className: 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-emerald-900/20 text-emerald-200',
      iconBg: 'bg-emerald-500/20',
    },
    rejected: {
      icon: '❌',
      title: 'Verification was not approved',
      message: 'There was an issue with your submission. Please review the feedback and resubmit.',
      className: 'border-red-500/30 bg-gradient-to-r from-red-950/60 to-red-900/20 text-red-200',
      iconBg: 'bg-red-500/20',
    },
  };

  const banner = banners[verificationStatus] ?? banners.unverified;

  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border mb-6 ${banner.className}`}>
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl ${banner.iconBg}`}>
        {banner.icon}
      </div>
      <div>
        <p className="font-semibold text-sm">{banner.title}</p>
        <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{banner.message}</p>
      </div>
    </div>
  );
}
