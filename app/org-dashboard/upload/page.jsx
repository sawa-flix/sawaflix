'use client';

import React from 'react';
import Link from 'next/link';
import { Upload, ArrowLeft } from 'lucide-react';

export default function OrgUploadPage() {
  return (
    <div className="min-h-screen bg-[#07050f] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/org-dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Organization Studio</span>
        </Link>

        <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
            <Upload size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Content Upload</h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Batch video ingestion, multi-audio tracks, and high-bitrate studio distribution portal. Coming soon.
          </p>
          <div className="pt-4">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-zinc-300">
              Module in Active Development
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
