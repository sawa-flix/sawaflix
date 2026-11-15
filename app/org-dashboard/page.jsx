'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Upload, 
  Film, 
  Settings, 
  ArrowUpRight, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Layers
} from 'lucide-react';

export default function OrganizationDashboardPage() {
  const cards = [
    {
      title: "Upload Content",
      description: "Distribute new movies, series, trailers, or studio catalogs directly to SawaFlix.",
      href: "/org-dashboard/upload",
      icon: Upload,
      actionText: "Upload media",
      badge: "Fast Track"
    },
    {
      title: "Manage Content",
      description: "Review your catalog, track verification statuses, edits, and release permissions.",
      href: "/org-dashboard/content",
      icon: Film,
      actionText: "View catalog",
      badge: "Catalog"
    },
    {
      title: "Team & Organization Settings",
      description: "Manage organization profile, production company metadata, roles, and payout preferences.",
      href: "/org-dashboard/settings",
      icon: Settings,
      actionText: "Manage organization",
      badge: "Admin"
    }
  ];

  const highlights = [
    { label: "Status", value: "Verified Studio", icon: ShieldCheck, color: "text-emerald-400" },
    { label: "Catalog Items", value: "--", icon: Layers, color: "text-blue-400" },
    { label: "Team Members", value: "Active", icon: Users, color: "text-purple-400" },
    { label: "Analytics", value: "Live", icon: BarChart3, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-[#07050f] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
                <Building2 size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Organization Studio</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/20 border border-red-500/30 text-red-300">
                    Publisher Portal
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mt-1 max-w-xl">
                  Centralized distribution and management hub for production companies, record labels, and studio collectives on SawaFlix.
                </p>
              </div>
            </div>

            <Link
              href="/org-dashboard/upload"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-all shadow-lg shadow-red-600/30 shrink-0"
            >
              <Upload size={16} />
              <span>New Release</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.08]">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.04]">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <Icon size={14} className={item.color} />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white mt-1">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className="group relative p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-white/[0.05] text-zinc-300 group-hover:text-red-400 group-hover:bg-red-500/10 transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-white/[0.05] text-zinc-400 group-hover:text-white transition-colors">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-white">
                  <span>{card.actionText}</span>
                  <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
