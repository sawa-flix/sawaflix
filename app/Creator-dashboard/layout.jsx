import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";
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
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6">

        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl font-bold">
            SAWA<span className="text-red-500">FLIX</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
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

          <SidebarItem icon={<Settings size={18} />} href="/Creator-dashboard/settings">
            Settings
          </SidebarItem>

          <SidebarItem icon={<HelpCircle size={18} />} href="#">
            Help
          </SidebarItem>
        </nav>

        {/* User Card */}
        <div className="border-t border-gray-800 pt-4 text-sm">
          <p>{profile.username}</p>
          <Link href="/logout" className="text-xs text-gray-400 hover:text-red-400">
            Log Out
          </Link>
        </div>

      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <header className="h-16 bg-[#0E1628] border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Dashboard</h2>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#1A2335] px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="w-8 h-8 rounded-full bg-gray-600" />
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