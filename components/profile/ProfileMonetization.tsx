import { Wallet, Users, Gift, Handshake } from 'lucide-react';

const SECTIONS = [
  { icon: Wallet, label: 'Revenue' },
  { icon: Users, label: 'Memberships' },
  { icon: Gift, label: 'Tips' },
  { icon: Handshake, label: 'Sponsorships' },
];

/**
 * Owner-only. Structure only, per explicit instruction — no backend
 * functionality. A static "coming soon" shell, not a fabricated dashboard.
 */
export function ProfileMonetization() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0E121A] p-5">
      <h2 className="mb-4 text-sm font-bold text-white">Monetization</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SECTIONS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-4 text-center opacity-60">
            <Icon size={18} className="text-white/40" />
            <span className="text-xs font-bold text-white">{label}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Coming soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
