import Image from 'next/image';

type BrandLoaderProps = {
  label?: string;
  className?: string;
};

export default function BrandLoader({ label = 'Loading...', className = '' }: BrandLoaderProps) {
  return (
    <div className={`flex min-h-[12rem] flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_32px_rgba(252,209,22,0.16)]">
        <Image
          src="/logos_and_pwas/loaderLogo.png"
          alt=""
          width={512}
          height={512}
          priority
          className="h-full w-full animate-[spin_2.4s_linear_infinite] object-contain"
        />
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">{label}</span>
    </div>
  );
}