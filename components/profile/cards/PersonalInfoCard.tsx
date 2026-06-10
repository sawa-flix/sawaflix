import Link from 'next/link';
import { Edit2, User, Mail, Phone, Globe, MapPin, Languages } from 'lucide-react';

interface PersonalInfoCardProps {
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  region?: string | null;
  language?: string | null;
  country?: string | null;
}

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
  icon: React.ElementType;
}

function InfoRow({ label, value, icon: Icon }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium min-w-[110px]">
        <Icon size={12} className="text-zinc-600 shrink-0" />
        {label}
      </div>
      <span className="text-white text-xs font-medium text-right truncate max-w-[140px]">
        {value || '—'}
      </span>
    </div>
  );
}

export default function PersonalInfoCard({
  username,
  email,
  phone,
  region,
  language,
  country,
}: PersonalInfoCardProps) {
  return (
    <div className="bg-[#0E121A] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User size={15} className="text-amber-500" />
          <h3 className="text-sm font-bold text-white">Personal Information</h3>
        </div>
        <Link
          href="/dashboard/edit-profile"
          className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
        >
          Edit
        </Link>
      </div>
      <div>
        <InfoRow label="Full Name" value={username} icon={User} />
        <InfoRow label="Email" value={email} icon={Mail} />
        <InfoRow label="Phone Number" value={phone} icon={Phone} />
        <InfoRow label="Region" value={region} icon={MapPin} />
        <InfoRow label="Language" value={language} icon={Languages} />
        <InfoRow label="Country" value={country} icon={Globe} />
      </div>
    </div>
  );
}
