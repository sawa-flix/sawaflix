"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HERO_ACCENT = "#ff5a3d";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden bg-[#100d1e] px-5 pb-12 pt-24 text-left text-white sm:px-8 lg:px-12"
    >
      <div className="absolute left-[-8rem] top-1/3 h-72 w-72 rounded-full bg-[#ff5a3d]/18 blur-3xl" aria-hidden="true" />

      <Image
        src="/logos_and_pwas/sawai.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className="-z-20 object-cover object-center opacity-70"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,13,30,0.94)_0%,rgba(16,13,30,0.82)_54%,rgba(16,13,30,0.48)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#100d1e]/35 via-transparent to-[#100d1e]/75" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 pb-8 pt-2 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[44rem] lg:mt-36 lg:w-[58%] lg:max-w-none lg:flex-none"
        >
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70 sm:mb-7 sm:text-xs">
            SawaFlix <span className="px-1.5 text-white/35">/</span> Cameroon
          </p>

          <h1 aria-label="Broken stories, restored." className="max-w-[42rem] text-[2.4rem] font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-6xl lg:max-w-none lg:text-[5.2rem]">
            <span className="block sm:whitespace-nowrap" style={{ color: HERO_ACCENT }} aria-hidden="true">
              <span>Br</span>
              <span className="relative mx-[0.025em] inline-flex h-[0.66em] w-[0.66em] translate-y-[0.025em] items-center justify-center overflow-hidden rounded-full bg-white align-baseline shadow-[0_0_20px_rgba(255,255,255,0.22)]">
                <motion.span
                  className="relative block h-full w-full rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 16, ease: "linear", repeat: Infinity }}
                >
                  <Image
                    src="/logos_and_pwas/loaderLogo.png"
                    alt=""
                    fill
                    priority
                    sizes="96px"
                    className="rounded-full object-cover"
                  />
                </motion.span>
              </span>
              <span className="relative ml-[0.015em] inline-flex items-baseline">
                <span className="inline-block translate-y-[0.18em] rotate-[4deg]">ke</span>
                <span className="ml-[0.025em] inline-block translate-y-[-0.09em] rotate-[-7deg]">n</span>
              </span>
              <span className="ml-[0.2em] text-white">stories,</span>
            </span>
            <span className="mt-1 block text-white">restored.</span>
          </h1>

          <p className="mt-4 max-w-[32rem] text-pretty text-xs leading-relaxed text-white/80 sm:mt-6 sm:text-base sm:leading-7 lg:text-lg">
            Culture, learning and endless entertainment, brought together in one place. Discover stories, music and local vibes worth sharing.
          </p>

          <div className="mt-6 flex items-center justify-start sm:mt-8">
            <Link
              href="/dashboard"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-white/70 bg-white px-7 py-3 text-sm font-bold text-[#171326] shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white/90 hover:shadow-[0_12px_36px_rgba(255,255,255,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-8 sm:text-base"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="relative w-full max-w-[700px] self-end lg:-ml-[22%] lg:w-[64%] lg:max-w-none lg:flex-none"
        >
          <div className="relative mx-auto aspect-[1.25] w-full max-w-[860px]">
            <div className="absolute inset-x-[12%] bottom-4 h-14 rounded-full bg-[#ff5a3d]/18 blur-2xl" aria-hidden="true" />
            <Image
              src="/child2.png"
              alt="Smiling child in traditional clothing holding a tablet"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 42vw"
              quality={75}
              className="relative z-10 object-contain object-bottom drop-shadow-[0_32px_80px_rgba(0,0,0,0.72)]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
