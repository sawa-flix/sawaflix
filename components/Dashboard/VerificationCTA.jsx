'use client';
import Link from 'next/link';

/**
 * VerificationCTA — the call-to-action button that takes a creator into the verification wizard.
 * All paths from Unverified and Rejected dashboards flow through here.
 *
 * @param {{
 *   label?: string,
 *   disabled?: boolean,
 *   href?: string,
 *   variant?: 'primary'|'outline',
 *   creatorType?: import('../../types/creator').CreatorType|null
 * }} props
 */
export default function VerificationCTA({
  label = 'Start Verification',
  disabled = false,
  href = '/verification/start',
  variant = 'primary',
  creatorType = null,
}) {
  const destination = creatorType
    ? `${href}?role=${creatorType}`
    : href;

  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200';

  const variantStyles = {
    primary:
      'bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]',
    outline:
      'border-2 border-red-600 text-red-400 hover:bg-red-600/10 hover:text-white',
  };

  const disabledStyles = 'opacity-40 cursor-not-allowed pointer-events-none';

  if (disabled) {
    return (
      <button
        disabled
        className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles}`}
      >
        {label}
      </button>
    );
  }

  return (
    <Link
      href={destination}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {label}
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}
