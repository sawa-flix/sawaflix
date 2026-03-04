import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";
import UserDropdown from "@/components/Dashboard/UserDropdown";
import {
  LayoutDashboard,
  FileVideo,
  Upload,
  BarChart3,
  DollarSign,
  Settings,
  HelpCircle
} from "lucide-react";

export default async function CreatorLayout({ children }) {
  const profile = await getUserProfile();

  if (!profile) redirect("/login");
  if (profile.category !== "creator") redirect("/dashboard");
  if (profile.verificationStatus !== "approved") redirect("/creator");

  function SidebarItem({ icon, href, children }) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#1A2335] transition text-sm"
      >
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-800 text-white">

      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 shadow-2xl">

        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">
            SAWA<span className="text-red-500 underline decoration-2 underline-offset-4">FLIX</span>
          </h1>
          <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-widest">
            Creator Studio
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 text-sm flex-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} href="/Creator-dashboard">
            Dashboard
          </SidebarItem>

          <SidebarItem
            icon={<FileVideo size={18} />}
            href="/Creator-dashboard/content"
          >
            My Content
          </SidebarItem>

          <SidebarItem icon={<Upload size={18} />} href="/Creator-dashboard/post">
            Post Content
          </SidebarItem>

          <SidebarItem icon={<BarChart3 size={18} />} href="/Creator-dashboard/analytics">
            Analytics
          </SidebarItem>

          <SidebarItem icon={<DollarSign size={18} />} href="/Creator-dashboards/earnings">
            Earnings
          </SidebarItem>

          <SidebarItem icon={<Settings size={18} />} href={`/creator/${profile.username}`}>
            Settings
          </SidebarItem>

          <SidebarItem icon={<HelpCircle size={18} />} href="#">
            Help
          </SidebarItem>
        </nav>

        {/* User Card */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <Link
            href={`/creator/${profile.username}`}
            className="flex items-center gap-3 group px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 group-hover:border-red-500/50 transition-colors">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.username}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors">{profile.displayName || profile.username}</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">View Profile</p>
            </div>
          </Link>
        </div>

      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <header className="h-16 bg-[#0E1628]/80 backdrop-blur-xl border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-10 shadow-lg">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Creator <span className="text-white">Dashboard</span></h2>

          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search analytics..."
                className="bg-[#1A2335] px-4 py-2 pl-4 rounded-xl text-xs outline-none border border-gray-800 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all w-64"
              />
            </div>

            <UserDropdown profile={profile} />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-8 bg-gradient-to-b from-[#0A0F1C] to-[#0F1A2E] overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
