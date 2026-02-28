import Link from "next/link";
import { getUserProfile } from "@/lib/getUserProfile";

export default async function CreatorOverviewPage() {
  const profile = await getUserProfile();

  return (
    <div className="space-y-8">

      {/* ===== Welcome Section ===== */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.username || "Creator"} 👋
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your content, track performance, and share your cultural story.
        </p>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-[#11151F] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm text-gray-400">Total Posts</h3>
          <p className="text-2xl font-semibold mt-2">0</p>
        </div>

        <div className="bg-[#11151F] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm text-gray-400">Pending Review</h3>
          <p className="text-2xl font-semibold mt-2">0</p>
        </div>

        <div className="bg-[#11151F] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm text-gray-400">Approved Content</h3>
          <p className="text-2xl font-semibold mt-2">0</p>
        </div>

      </div>

      {/* ===== Quick Action Section ===== */}
      <div className="bg-[#11151F] border border-gray-800 rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        <div>
          <h2 className="text-xl font-semibold">
            Ready to share something new?
          </h2>
          <p className="text-gray-400 mt-2">
            Post a traditional story, music, or a cultural recipe.
          </p>
        </div>

        <Link
          href="/creator/post"
          className="bg-red-600 hover:bg-red-700 transition-colors px-6 py-3 rounded-lg font-medium"
        >
          Post New Content
        </Link>

      </div>

      {/* ===== Activity Placeholder ===== */}
      <div className="bg-[#11151F] border border-gray-800 rounded-xl p-8">
        <h2 className="text-lg font-semibold mb-4">
          Recent Activity
        </h2>
        <p className="text-gray-500 text-sm">
          You haven't posted any content yet. Once you do, activity will appear here.
        </p>
      </div>

    </div>
  );
}