export function ReelsBackdrop({ className = 'fixed inset-0' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className} z-0 overflow-hidden`}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.16] mix-blend-multiply dark:opacity-30 dark:mix-blend-screen"
        style={{ backgroundImage: "url('/logos_and_pwas/sawai.svg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--background)]/35 via-[color:var(--background)]/15 to-[color:var(--background)]/45 dark:from-[color:var(--background)]/75 dark:via-[color:var(--background)]/65 dark:to-[color:var(--background)]/85" />
    </div>
  );
}