import Link from 'next/link';
import { Crown, CheckCircle2, CreditCard } from 'lucide-react';

const PREMIUM_FEATURES = [
  'Unlimited Movies & Series',
  'Unlimited Music',
  'Downloads',
  'No Ads',
  'Early Access to New Releases',
];

interface SubscriptionCardProps {
  plan?: string;
  status?: string;
  renewalDate?: string;
}

export default function SubscriptionCard({
  plan = 'Premium',
  status = 'ACTIVE',
  renewalDate = 'December 20, 2026',
}: SubscriptionCardProps) {
  const isActive = status === 'ACTIVE';

  return (
    <div className="bg-[#0E121A] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={15} className="text-amber-500" />
        <h3 className="text-sm font-bold text-white">Subscription Plan</h3>
      </div>

      {/* Plan Badge */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-black text-white tracking-tight">{plan}</span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
            isActive
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30'
          }`}
        >
          {status}
        </span>
      </div>

      {renewalDate && (
        <p className="text-xs text-zinc-500 mb-4">
          Expires on: <span className="text-zinc-300">{renewalDate}</span>
        </p>
      )}

      {/* Features */}
      <div className="space-y-2 mb-5">
        {PREMIUM_FEATURES.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-amber-500 shrink-0" />
            <span className="text-xs text-zinc-300">{feature}</span>
          </div>
        ))}
      </div>

      {/* Manage Button */}
      <Link
        href="/dashboard/settings"
        className="flex items-center justify-center gap-2 w-full py-2.5 border border-amber-500/40 rounded-lg text-amber-500 text-xs font-bold hover:bg-amber-500/10 transition-all"
      >
        <CreditCard size={13} />
        Manage Subscription
      </Link>
    </div>
  );
}
