import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  GraduationCap,
  Laptop,
  Trophy,
  University,
  Users,
} from 'lucide-react';
import StoryGrid from '@/components/AreaTory/StoryGrid';

const learningTracks = [
  {
    title: 'GCE Preparation',
    description:
      'Structured revision notes, exam strategies, and subject guidance for O-Level and A-Level learners across Cameroon.',
    icon: GraduationCap,
  },
  {
    title: 'University Pathways',
    description:
      'Career mapping, admission questions, and how to choose the right university, faculty, and future direction.',
    icon: University,
  },
  {
    title: 'Skills & Digital Growth',
    description:
      'Build practical skills in tech, media, communication, entrepreneurship and digital work opportunities for youth.',
    icon: Laptop,
  },
  {
    title: 'Career Guidance',
    description:
      'Learn what opportunities fit your strengths, from STEM and business to creative and community-driven careers.',
    icon: BriefcaseBusiness,
  },
];

const educationHighlights = [
  'GCE and exam readiness content',
  'University and scholarship guidance',
  'Youth-focused learning and career pathways',
  'Stories, culture and community-led education updates',
  'Access to educational news and student life inspiration',
  'A blend of entertainment and useful learning resources',
];

export default function EducationDashboardPage() {
  return (
    <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 pt-2 pb-20">
      <section className="relative isolate overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-8 md:p-10">
        <Image
          src="/SawaFlix_Cameroonian_Entertainment_Cover.webp"
          alt="Cameroonian entertainment and culture on SawaFlix"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1600px"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-black/60" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-red-300">
              <BookOpenText className="h-3.5 w-3.5" />
              SawaFlix Education
            </div>

            <h1 className="max-w-xl text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
              Learn, grow and prepare for a stronger future.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              This learning space brings together education, youth opportunity and Cameroonian ambition — from GCE support and university guidance to skills, scholarships and daily inspiration from the community.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#education-tracks"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-4 py-2.5 text-sm font-semibold text-[color:var(--background)] transition hover:opacity-85"
              >
                Explore learning tracks
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/blogs"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[color:var(--background)] px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:opacity-85"
              >
                Read community stories
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-4 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-[color:var(--foreground)]">GCE</p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">Revision support and exam strategy</p>
            </div>

            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-4 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                <University className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-[color:var(--foreground)]">Uni</p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">Admissions and future planning</p>
            </div>

            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-4 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-[color:var(--foreground)]">Youth</p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">Opportunity and community learning</p>
            </div>

            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-4 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                <Trophy className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-[color:var(--foreground)]">Goal</p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">Skills for tomorrow’s success</p>
            </div>
          </div>
        </div>
      </section>

      <section id="education-tracks" className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-300">Education tracks</p>
            <h2 className="mt-2 text-2xl font-black text-[color:var(--foreground)]">Learning for Cameroon’s next generation</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {learningTracks.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-400/40"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[color:var(--foreground)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-300">What this section includes</p>
            <h2 className="mt-2 text-2xl font-black text-[color:var(--foreground)]">Everything in the blog page, plus education meant for young people in Cameroon</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {educationHighlights.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/60 p-4"
            >
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10 text-[10px] font-black text-red-300">
                ✓
              </span>
              <p className="text-sm text-[color:var(--muted-foreground)]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="education-feed" className="mt-10">
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-300">Community learning</p>
          <h2 className="mt-2 text-2xl font-black text-[color:var(--foreground)]">Stories, news and inspiration from the wider community</h2>
        </div>
        <StoryGrid />
      </section>
    </main>
  );
}
