import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/getUserProfile";

export default async function CreatorLayout({ children }) {
  const profile = await getUserProfile();

  // 🔐 Protect route
  if (!profile) {
    redirect("/login");
  }

  if (profile.category !== "creator") {
    redirect("/dashboard");
  }

  if (profile.verificationStatus !== "approved") {
    redirect("/creator"); // let status page handle them
  }

  return (
    <div className="min-h-screen flex bg-[#0B0E14] text-white">

      {/* ===== Sidebar ===== */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col p-6 space-y-8">

        <div>
          <h2 className="text-2xl font-bold text-red-500">
            Creator Panel
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Welcome, {profile.username}
          </p>
        </div>

        <nav className="flex flex-col space-y-4 text-sm">

          <Link
            href="/creator"
            className="hover:text-red-400 transition-colors"
          >
            Overview
          </Link>

          <Link
            href="/creator/post"
            className="hover:text-red-400 transition-colors"
          >
            Post Content
          </Link>

          <Link
            href="/creator/content"
            className="hover:text-red-400 transition-colors"
          >
            My Content
          </Link>

        </nav>

        <div className="mt-auto text-xs text-gray-500">
          SawaFlix Creator Dashboard
        </div>

      </aside>

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 flex flex-col">

        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0F131B]">
          <h1 className="text-lg font-semibold">
            Creator Dashboard
          </h1>

          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Back to Home
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}