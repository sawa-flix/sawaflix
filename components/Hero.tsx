"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden bg-[#100d1e] px-5 pb-12 pt-24 text-left text-white sm:px-8 lg:px-12"
    >
      <Image
        src="/logos_and_pwas/sawai.svg"
        alt=""
        fill
        priority
        unoptimized
        aria-hidden="true"
        className="-z-20 object-cover object-center opacity-70"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,13,30,0.94)_0%,rgba(16,13,30,0.78)_54%,rgba(16,13,30,0.45)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#100d1e]/35 via-transparent to-[#100d1e]/75" />

      <div className="mx-auto flex w-full max-w-7xl justify-start pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col items-start"
        >
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70 sm:mb-7 sm:text-xs">
            SawaFlix <span className="px-1.5 text-white/35">/</span> Cameroon
          </p>
          <h1 aria-label="Broken stories, restored." className="max-w-5xl text-balance text-[2.25rem] font-black leading-[0.97] text-white sm:text-6xl lg:text-8xl">
            <span className="inline-flex items-baseline whitespace-nowrap text-[#ff3158]" aria-hidden="true">
              <span>Br</span>
              <span className="relative mx-[0.025em] inline-flex h-[0.66em] w-[0.66em] translate-y-[0.025em] items-center justify-center overflow-hidden rounded-full bg-white align-baseline shadow-[0_0_20px_rgba(255,255,255,0.22)]">
                <motion.span
                  className="relative block h-full w-full rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 16, ease: 'linear', repeat: Infinity }}
                >
                  <Image src="/logos_and_pwas/loaderLogo.png" alt="" fill sizes="96px" className="rounded-full object-cover" priority />
                </motion.span>
              </span>
              <span className="relative ml-[0.015em] inline-flex items-baseline">
                <span className="inline-block translate-y-[0.18em] rotate-[4deg]">ke</span>
                <span className="ml-[0.025em] inline-block translate-y-[-0.09em] rotate-[-7deg]">n</span>
              </span>
            </span>
            <span className="sr-only">Broken</span>{' '}
            <span>stories,</span>
            <br className="hidden sm:block" />{' '}
            <span>restored.</span>
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
      </div>
    </section>
  );
}
