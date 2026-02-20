'use client';

/**
 * DashboardShell — common wrapper for all four creator dashboard states.
 * Renders creator info badge, the status banner, and the content passed via children.
 *
 * @param {{
 *   creatorType: import('../../types/creator').CreatorType|null,
 *   verificationStatus: import('../../types/creator').VerificationStatus,
 *   children: React.ReactNode
 * }} props
 */
export default function DashboardShell({ creatorType, verificationStatus, children }) {
  const roleLabel = {
    musician: '🎵 Musician',
    filmmaker: '🎬 Filmmaker',
    influencer: '📱 Influencer',
    visual_artist: '🎨 Visual Artist',
    other: '✨ Creator',
  }[creatorType] ?? '✨ Creator';

  const statusConfig = {
    unverified: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'Unverified', dot: 'bg-yellow-400' },
    pending: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'Pending Review', dot: 'bg-orange-400' },
    approved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Verified', dot: 'bg-emerald-400' },
    rejected: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'Rejected', dot: 'bg-red-400' },
  };

  const status = statusConfig[verificationStatus] ?? statusConfig.unverified;

  return (
    <div className="min-h-full">
      {/* Creator Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">{roleLabel}</p>
        </div>

        {/* Status badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${status.bg} ${status.color}`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${status.dot}`} />
          {status.label}
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
