"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, MoreHorizontal } from "lucide-react";

export default function CreatorContentPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/creator/content");
      if (!res.ok) throw new Error("Failed to fetch content");
      const data = await res.json();
      setContent(data);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, category) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    
    setIsDeleting(id);
    try {
      const apiCategory = category === "story" ? "stories" : category;
      const res = await fetch(`/api/content/${id}?category=${apiCategory}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchContent(); // Refresh the list without full page reload
      } else {
        alert("Failed to delete content");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdate = async (id, category) => {
    setIsUpdating(id);
    try {
      const apiCategory = category === "story" ? "stories" : category;
      const res = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: apiCategory, title: editTitle }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchContent(); // Refresh without full page reload
      } else {
        alert("Failed to update content");
      }
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Loading your content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <span className="text-red-500 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400 max-w-md">{error}</p>
        <button 
          onClick={fetchContent}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">My Content</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Manage and track your uploaded cultural content.
        </p>
      </div>

      {/* Empty State */}
      {content.length === 0 && (
        <div className="bg-[#11151F] border border-gray-800 rounded-2xl p-10 text-center">
          <p className="text-gray-400 mb-6 text-sm font-medium">
            You haven’t posted any content yet.
          </p>
          <Link
            href="/Creator-dashboard/post/story"
            className="bg-red-600 hover:bg-red-700 font-bold px-6 py-3 text-sm rounded-xl transition inline-block text-white"
          >
            Post Your First Content
          </Link>
        </div>
      )}

      {/* Content Grid */}
      {content.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {content.map((item) => {
            const displayTitle = item.title || item.dish_name || "Untitled";
            const isEditing = editingId === item.id;
            
            // Derive some placeholder values since we rely on mixed DB tables
            const status = "Published"; // Replace when DB has real status
            const displayDate = new Date(item.submission_date || item.updated_at || item.created_at).toLocaleDateString();

            return (
              <div
                key={item.id}
                className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 transition group relative overflow-hidden"
              >
                {/* Decoration gradient line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    {/* Type Icon */}
                    <div className="text-2xl bg-gray-900 w-12 h-12 flex items-center justify-center rounded-xl border border-gray-800">
                      {item.type === "story" && "📖"}
                      {item.type === "music" && "🎵"}
                      {item.type === "food" && "🍲"}
                    </div>

                    {/* Status Badge */}
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      {status}
                    </span>
                  </div>

                  {/* Title Area (supports inline edit) */}
                  <div className="mb-3">
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-gray-900 text-white text-sm font-bold px-3 py-2 rounded-lg border border-red-500/50 outline-none w-full"
                          autoFocus
                          placeholder="Content Title"
                        />
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleUpdate(item.id, item.type)}
                            disabled={isUpdating === item.id}
                            className="text-xs font-bold bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition"
                          >
                            {isUpdating === item.id ? "Saving..." : "Save"}
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="text-xs font-bold text-gray-400 hover:text-white transition px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <h2 className="text-lg font-bold text-white tracking-tight line-clamp-2">
                        {displayTitle}
                      </h2>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-gray-400 text-sm mt-2 line-clamp-3">
                    {item.description || item.story_content || "No description provided."}
                  </p>

                  {/* Date */}
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-4">
                    Posted {displayDate}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => {
                      setEditTitle(displayTitle);
                      setEditingId(item.id);
                    }}
                    className="text-sm font-semibold text-gray-400 hover:text-white transition"
                  >
                    Edit Title
                  </button>

                  <button 
                    onClick={() => handleDelete(item.id, item.type)}
                    disabled={isDeleting === item.id}
                    className="text-sm font-semibold text-red-500 hover:text-red-400 transition"
                  >
                    {isDeleting === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}