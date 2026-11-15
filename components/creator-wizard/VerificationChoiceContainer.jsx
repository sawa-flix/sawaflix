'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import CreatorWizard from '@/components/creator-wizard/CreatorWizard';

export default function VerificationChoiceContainer() {
  const [selectedTrack, setSelectedTrack] = useState(null); // null | 'individual'

  if (selectedTrack === 'individual') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setSelectedTrack(null)}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition"
          >
            ← Back to Verification Selection
          </button>
        </div>
        <CreatorWizard />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck size={14} /> SawaFlix Creator Verification
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Choose Your Creator Track
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-lg mx-auto">
          Select whether you are applying as an independent individual storyteller or an official organization / media publisher.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Track 1: Individual Creator */}
        <div
          onClick={() => setSelectedTrack('individual')}
          className="group cursor-pointer bg-neutral-900 border border-neutral-800 hover:border-red-600/50 hover:bg-neutral-900/80 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <User size={24} />
            </div>
            <h2 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">
              Individual Creator
            </h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              For solo artists, actors, comedians, independent filmmakers, and influencers sharing original African stories.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-red-500">
            Apply as Individual <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Track 2: Organization / Media Publisher */}
        <Link
          href="/creator/organization/apply"
          className="group cursor-pointer bg-neutral-900 border border-neutral-800 hover:border-red-600/50 hover:bg-neutral-900/80 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Building2 size={24} />
            </div>
            <h2 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">
              Organization / Publisher
            </h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              For registered production studios, record labels, TV/Radio networks, media houses, or cultural collectives. Includes multi-user administration via SawaFlix Admin.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-red-500">
            Apply as Organization <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
