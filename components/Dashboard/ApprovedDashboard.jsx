'use client';
import Link from 'next/link';
import StatusBanner from './StatusBanner';

const CREATOR_TOOLS = [
  { icon: '🎵', label: 'Upload Content', href: '/upload', description: 'Share music, films & more' },
  { icon: '💰', label: 'Monetization', href: '/monetization', description: 'Earn from your content' },
  { icon: '📊', label: 'Analytics', href: '/analytics', description: 'Track your performance' },
  { icon: '🏅', label: 'Creator Profile', href: '/profile', description: 'Your verified public page' },
];

/**
 * 🟢 ApprovedDashboard — shown when verification_status = 'approved'.
 * Purpose: unlock the creator experience, show full access.
 *
 * @param {{ creatorType: import('../../types/creator').CreatorType|null }} props
 */
export default function ApprovedDashboard({ creatorType }) {
  const roleLabel = {
    musician: 'Musician',
    filmmaker: 'Filmmaker',
    influencer: 'Influencer',
    visual_artist: 'Visual Artist',
    other: 'Creator',
  }[creatorType] ?? 'Creator';

  return (
    <div>
      <StatusBanner verificationStatus="approved" />

      {/* Welcome hero card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/80 via-gray-900/80 to-gray-900 border border-emerald-500/30 rounded-2xl p-6 mb-6">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Verified badge */}
          <div className="shrink-0 w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">Welcome, Verified {roleLabel}!</h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                VERIFIED
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              You now have full access to all creator tools on SawaFlix. Your audience is waiting.
            </p>
          </div>
        </div>
      </div>

      {/* Creator Tools Grid */}
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Your Creator Tools
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {CREATOR_TOOLS.map((tool) => (
          <Link
            key={tool.label}
            href={tool.href}
            className="group p-4 bg-gray-900/60 border border-gray-800 hover:border-emerald-600/50 rounded-2xl transition-all duration-200 hover:bg-gray-800/60 hover:scale-[1.02]"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
              {tool.icon}
            </div>
            <p className="text-sm font-semibold text-gray-200">{tool.label}</p>
            <p className="text-xs text-gray-500 mt-1 leading-snug">{tool.description}</p>
          </Link>
        ))}
      </div>

      {/* Quick start prompt */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold text-sm">Ready to create?</p>
          <p className="text-gray-500 text-xs mt-0.5">Upload your first piece of content and start building your audience.</p>
        </div>
        <Link
          href="/upload"
          className="shrink-0 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
        >
          Upload Now
        </Link>
      </div>
    </div>
  );
}
