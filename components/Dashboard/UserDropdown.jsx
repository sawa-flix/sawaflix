'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  Video, 
  Bookmark, 
  Edit3, 
  BookOpen, 
  HelpCircle 
} from 'lucide-react';
import { handleSignOut } from '@/app/(auth)/actions';

export default function UserDropdown({ profile }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.displayName || profile?.username || 'User';
  const initials = profile?.displayName
    ? profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-gray-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 transition-all duration-200 cursor-pointer group focus:outline-none"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-red-500/40 group-hover:ring-red-500/70 transition-all flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-700 shadow-md shrink-0">
          {profile?.profileImage ? (
            <Image
              src={profile.profileImage}
              alt={displayName}
              width={32}
              height={32}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-xs font-bold text-white">{initials}</span>
          )}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors leading-none truncate max-w-[110px]">
            {displayName}
          </span>
          <span className="text-[9px] text-zinc-400 font-medium tracking-wider uppercase mt-0.5">
            {profile?.category || 'Creator'}
          </span>
        </div>
        <ChevronDown size={14} className={`text-zinc-400 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#0C0F17]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/10 p-2.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Profile Card */}
          <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl mb-2 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-red-500/50 shadow-md flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-700 shrink-0">
              {profile?.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={displayName}
                  width={44}
                  height={44}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <span className="text-sm font-bold text-white">{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white truncate leading-tight">{displayName}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Online" />
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-medium">
                {profile?.email || `@${profile?.username || 'creator'}`}
              </p>
              <div className="mt-1.5 inline-flex items-center px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-md text-[10px] font-extrabold text-red-300 tracking-wider uppercase shadow-sm">
                <span>{profile?.category || 'Creator'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 py-1">
            <Link
              href={`/creator/${profile?.username}`}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 group-hover:text-red-400 group-hover:bg-red-500/10 transition-colors">
                  <User size={15} />
                </div>
                <span>My Public Profile</span>
              </div>
              <ChevronRight size={13} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/creator-dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                  <Video size={15} />
                </div>
                <span>Creator Dashboard</span>
              </div>
              <ChevronRight size={13} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/dashboard/blogs"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 group-hover:text-rose-400 group-hover:bg-rose-500/10 transition-colors">
                  <BookOpen size={15} />
                </div>
                <span>Stories & Blogs</span>
              </div>
              <ChevronRight size={13} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/creator-dashboard/settings"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                  <Settings size={15} />
                </div>
                <span>Creator Settings</span>
              </div>
              <ChevronRight size={13} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/dashboard/support"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                  <HelpCircle size={15} />
                </div>
                <span>Help & Support</span>
              </div>
              <ChevronRight size={13} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* Sign Out Button */}
          <div className="mt-1 pt-1.5 border-t border-white/[0.06]">
            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-red-500/15 text-red-400">
                  <LogOut size={15} />
                </div>
                <span className="font-bold text-red-400">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

