'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, LockKeyhole, Phone, Smartphone, Volume2, VolumeX, X } from 'lucide-react';

const ReactPlayerClient = dynamic(() => import('react-player/lazy'), { ssr: false });
const SPONSORED_VIDEO_URL = 'https://youtu.be/YXlyOWlKWPg?si=alH7S7YkMCe0aG1L';
const SPONSORED_VIDEO_SECONDS = 8;

type PaymentMethod = 'card' | 'mtn-momo' | 'orange-money';
type PlanId = 'day' | 'week' | 'lifetime';

interface PremiumPreviewCheckoutProps {
  title: string;
  assetId: string;
  amountXaf: number;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

const METHODS: Array<{ id: PaymentMethod; label: string; detail: string; supported: boolean }> = [
  { id: 'card', label: 'Bank card', detail: 'Not enabled for this checkout yet', supported: false },
  { id: 'mtn-momo', label: 'MTN MoMo', detail: 'Secure provider confirmation', supported: true },
  { id: 'orange-money', label: 'Orange Money', detail: 'Secure provider confirmation', supported: true },
];

const PLANS: Array<{ id: PlanId; label: string; subtitle: string; amount: number; priceLabel: string; detail: string }> = [
  { id: 'day', label: '1 day rental', subtitle: 'Watch inside the app', amount: 250, priceLabel: '250 XAF', detail: '24h access' },
  { id: 'week', label: '1 week rental', subtitle: 'Watch inside the app', amount: 500, priceLabel: '500 XAF', detail: '7-day access' },
  { id: 'lifetime', label: 'Lifetime', subtitle: 'Owned forever', amount: 1500, priceLabel: '1500 XAF', detail: 'Download outside the app' },
];

export default function PremiumPreviewCheckout(props: PremiumPreviewCheckoutProps) {
  const { title, amountXaf, onClose, onUnlockSuccess } = props;
  const [method, setMethod] = useState<PaymentMethod>('mtn-momo');
  const [phase, setPhase] = useState<'sponsored' | 'payment'>('sponsored');
  const [adSeconds, setAdSeconds] = useState(0);
  const [adMuted, setAdMuted] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(amountXaf === 250 ? 'day' : amountXaf === 1500 ? 'lifetime' : 'week');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const activePlan = useMemo(
    () => PLANS.find((plan) => plan.id === selectedPlan) ?? PLANS[1],
    [selectedPlan]
  );

  const startPayment = () => {
    if (method === 'card') {
      setPaymentError('Card payments are not enabled for this movie yet. Choose MTN MoMo or Orange Money.');
      return;
    }
    if (!/^\+?[0-9\s-]{8,16}$/.test(phoneNumber.trim())) {
      setPaymentError('Enter a valid Cameroon mobile number to continue.');
      return;
    }

    setSubmitting(true);
    setPaymentError(null);
    setPaymentComplete(false);

    window.setTimeout(() => {
      setSubmitting(false);
      setPaymentComplete(true);
    }, 1400);
  };

  if (phase === 'sponsored') {
    return (
      <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/30 p-4 sm:p-8">
        <div className="mb-3 flex w-full max-w-3xl items-center justify-between gap-3 text-white">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">SawaFlix · Sponsored</p>
            <h2 className="mt-1 text-sm font-bold sm:text-base">A short message before your movie continues</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tabular-nums">{Math.max(0, SPONSORED_VIDEO_SECONDS - Math.floor(adSeconds))}s</span>
            <button type="button" onClick={() => setAdMuted((muted) => !muted)} aria-label={adMuted ? 'Unmute sponsored video' : 'Mute sponsored video'} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20">
              {adMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <button type="button" onClick={() => setPhase('payment')} aria-label="Close sponsored video" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"><X size={17} /></button>
          </div>
        </div>
        <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-white/15 bg-black shadow-[0_28px_100px_rgba(0,0,0,.6)]">
          <ReactPlayerClient
            url={SPONSORED_VIDEO_URL}
            width="100%"
            height="100%"
            playing
            muted={adMuted}
            controls={false}
            playsinline
            progressInterval={200}
            config={{ youtube: { playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1 } } }}
            onProgress={({ playedSeconds }: { playedSeconds: number }) => {
              setAdSeconds(playedSeconds);
              if (playedSeconds >= SPONSORED_VIDEO_SECONDS) setPhase('payment');
            }}
            onEnded={() => setPhase('payment')}
            onError={() => setPhase('payment')}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div className="h-full bg-white transition-[width] duration-200" style={{ width: `${Math.min(100, adSeconds / SPONSORED_VIDEO_SECONDS * 100)}%` }} />
          </div>
        </div>
        <p className="mt-3 w-full max-w-3xl text-[11px] text-white/50">Your movie will continue after this sponsored clip.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/25 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="premium-checkout-title" className="relative w-full max-w-md scale-[0.88] rounded-t-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-[color:var(--foreground)] shadow-[0_30px_100px_rgba(0,0,0,.45)] sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--foreground)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[color:var(--background)]">
              <LockKeyhole size={12} /> Premium preview ended
            </span>
            <h2 id="premium-checkout-title" className="text-xl font-black">Keep watching</h2>
            <p className="mt-1 line-clamp-1 text-xs text-[color:var(--muted-foreground)]">Unlock {title} to continue.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close checkout" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"><X size={18} /></button>
        </div>

        <div className="mb-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">Movie access</span>
            <span className="font-black">{activePlan.priceLabel}</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--muted-foreground)]">Pricing is set per access type. Backend payment integration is still being finalized.</p>
        </div>

        <div className="grid grid-cols-3 gap-2" aria-label="Choose a rental plan">
          {PLANS.map((plan) => {
            const selected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setSelectedPlan(plan.id);
                  setPaymentError(null);
                  setPaymentComplete(false);
                }}
                aria-pressed={selected}
                disabled={submitting}
                className={`flex min-h-[108px] flex-col items-start justify-between rounded-xl border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)]/5' : 'border-[color:var(--border)] bg-[color:var(--background)] hover:bg-[color:var(--surface-hover)]'}`}
              >
                <span className="block text-[11px] font-bold leading-tight">{plan.label}</span>
                <span className="block text-[9px] leading-snug text-[color:var(--muted-foreground)]">{plan.subtitle}</span>
                <span className="text-left">
                  <span className="block text-[11px] font-black">{plan.priceLabel}</span>
                  <span className="block text-[8px] text-[color:var(--muted-foreground)]">{plan.detail}</span>
                </span>
              </button>
            );
          })}
        </div>

        {!paymentComplete && !submitting && (
          <>
            <div className="mt-4 space-y-2" aria-label="Choose a payment method">
              {METHODS.map((item) => {
                const selected = method === item.id;
                return <button key={item.id} type="button" onClick={() => { setMethod(item.id); setPaymentError(null); }} aria-pressed={selected} disabled={!item.supported || submitting} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${selected ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)]/5' : 'border-[color:var(--border)] bg-[color:var(--background)] hover:bg-[color:var(--surface-hover)]'}`}>
                  <span className={`flex h-10 w-12 shrink-0 items-center justify-center rounded-lg ${item.id === 'mtn-momo' ? 'bg-[#ffcc00] text-[#171717]' : item.id === 'orange-money' ? 'bg-[#ff7900] text-white' : 'bg-[color:var(--surface-hover)] text-[color:var(--foreground)]'}`}>
                    {item.id === 'card' ? <CreditCard size={20} /> : <Smartphone size={20} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className="block text-[10px] text-[color:var(--muted-foreground)]">{item.detail}</span>
                  </span>
                  <span className={`h-4 w-4 rounded-full border ${selected ? 'border-[color:var(--foreground)] p-[3px]' : 'border-[color:var(--muted-foreground)]/50'}`}>
                    {selected && <span className="block h-full w-full rounded-full bg-[color:var(--foreground)]" />}
                  </span>
                </button>;
              })}
            </div>

            {method !== 'card' && (
              <label className="mt-4 block text-xs font-semibold text-[color:var(--foreground)]">
                Mobile number
                <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2.5 focus-within:border-[color:var(--foreground)]">
                  <Phone size={15} className="text-[color:var(--muted-foreground)]" />
                  <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+237 6XX XXX XXX" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--muted-foreground)]" />
                </span>
              </label>
            )}

            {paymentError && <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-[color:var(--danger-bg)] p-3 text-xs text-[color:var(--danger-fg)]"><AlertCircle size={15} className="mt-0.5 shrink-0" />{paymentError}</p>}

            <button type="button" onClick={startPayment} disabled={submitting} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--foreground)] px-4 py-3 text-sm font-extrabold text-[color:var(--background)] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}
              {submitting ? 'Processing payment' : `Pay ${activePlan.priceLabel}`}
            </button>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-[color:var(--muted-foreground)]">Secure payment confirmation is handled by your selected provider. Card payments are not enabled yet.</p>
          </>
        )}

        {submitting && (
          <div role="status" aria-live="polite" className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden rounded-[inherit] bg-black/35 px-5 py-6 backdrop-blur-sm">
            <div className="w-full max-w-xs rounded-2xl border border-white/40 bg-[color:var(--surface)]/95 p-6 text-center text-[color:var(--foreground)] shadow-[0_24px_70px_rgba(0,0,0,.35)] ring-1 ring-black/5">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--primary)]/25 bg-[color:var(--primary)]/10 text-[color:var(--primary)] shadow-[0_0_32px_color-mix(in_srgb,var(--primary)_22%,transparent)]">
                <Loader2 size={38} strokeWidth={2.4} className="animate-spin" />
              </div>
              <p className="text-base font-extrabold">Confirming your selection</p>
              <p className="mt-1.5 text-xs text-[color:var(--muted-foreground)]">{method === 'mtn-momo' ? 'MTN MoMo' : 'Orange Money'} <span aria-hidden="true">·</span> {activePlan.priceLabel}</p>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-[color:var(--primary)]" />
              </div>
              <p className="mt-4 text-[10px] font-medium text-[color:var(--muted-foreground)]">Demo only. No payment will be charged.</p>
            </div>
          </div>
        )}

        {paymentComplete && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-[color:var(--foreground)]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 size={22} />
            </div>
            <p className="text-lg font-black">Demo payment complete</p>
            <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted-foreground)]">This frontend simulation unlocks playback for this session only. A real provider confirmation and access grant still require backend integration.</p>
            <button type="button" onClick={onUnlockSuccess} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[color:var(--foreground)] px-4 py-2.5 text-sm font-bold text-[color:var(--background)] transition-opacity hover:opacity-85">
              Continue watching
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
