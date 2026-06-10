import Link from 'next/link';
import { Shield, Key, Smartphone, Lock } from 'lucide-react';

interface SecurityCardProps {
  twoFactorEnabled?: boolean;
  activeDevices?: number;
}

export default function SecurityCard({
  twoFactorEnabled = true,
  activeDevices = 3,
}: SecurityCardProps) {
  return (
    <div className="bg-[#0E121A] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={15} className="text-amber-500" />
        <h3 className="text-sm font-bold text-white">Security</h3>
      </div>

      {/* Password Row */}
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Key size={13} className="text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-400">Password</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-xs tracking-widest">••••••••••</span>
          <Link
            href="/dashboard/settings"
            className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
          >
            Change
          </Link>
        </div>
      </div>

      {/* 2FA Row */}
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Smartphone size={13} className="text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-400">Two-Factor Authentication</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              twoFactorEnabled ? 'text-green-400' : 'text-zinc-500'
            }`}
          >
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <Link
            href="/dashboard/settings"
            className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
          >
            Manage
          </Link>
        </div>
      </div>

      {/* Active Devices Row */}
      <div className="flex items-center justify-between py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Smartphone size={13} className="text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-400">Active Devices</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-300 font-semibold">{activeDevices} Devices</span>
          <Link
            href="/dashboard/settings"
            className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
          >
            Manage
          </Link>
        </div>
      </div>

      {/* Security Settings Button */}
      <div className="mt-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-white/10 rounded-lg text-zinc-300 text-xs font-bold hover:bg-white/5 transition-all"
        >
          <Lock size={13} />
          Security Settings
        </Link>
      </div>
    </div>
  );
}
