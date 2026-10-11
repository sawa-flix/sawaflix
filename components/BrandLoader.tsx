import Image from 'next/image';

type BrandLoaderProps = {
  label?: string;
  className?: string;
};

export default function BrandLoader({ label, className = '' }: BrandLoaderProps) {
  return (
    <div className={`flex min-h-[14rem] w-full flex-col items-center justify-center px-6 ${className}`} role="status" aria-label={label || 'Loading'}>
      <div className="flex w-full max-w-xs flex-col items-center">
        <Image
          src="/logos_and_pwas/android-chrome-512x512.png"
          alt="SawaFlix"
          width={512}
          height={512}
          priority
          className="mb-8 h-20 w-20 object-contain sm:h-24 sm:w-24 drop-shadow-[0_4px_16px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
        />

        {/* Video Loader Line from left to right */}
        <div className="w-full">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E50914] shadow-[0_0_12px_rgba(229,9,20,0.45)]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="ml-[1px] h-2.5 w-2.5 fill-white" aria-hidden="true">
                <path d="M8 5.5v13l9-6.5-9-6.5Z" />
              </svg>
            </span>
            <div
              className="relative h-2 flex-1 overflow-hidden rounded-full border border-black/5 bg-black/10 shadow-inner dark:bg-white/15"
              role="progressbar"
              aria-label="Loading progress"
            >
              <div className="absolute inset-y-0 left-0 w-full origin-left bg-[#e50914] rounded-full shadow-[0_0_10px_rgba(229,9,20,0.6)] animate-video-loader-line" />
            </div>
          </div>
          {label && (
            <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--muted-foreground)]">
              {label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}