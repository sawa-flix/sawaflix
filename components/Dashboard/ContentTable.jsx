"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

export default function ContentTable({ contents = [] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 5;

  // Actions State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Filtering
  const filtered =
    filter === "All"
      ? contents
      : contents.filter((c) => {
          // Mock status for now since no status exists in DB yet
          const status = "Published";
          return status === filter;
        });

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedContent = filtered.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const handleTabChange = (tab) => {
    setFilter(tab);
    setCurrentPage(0);
    setOpenMenuId(null);
    setEditingId(null);
  };

  // Handlers
  const handleDelete = async (id, category) => {
    setIsDeleting(id);
    try {
      const apiCategory = category === "story" ? "stories" : category;
      const res = await fetch(`/api/content/${id}?category=${apiCategory}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh(); // Triggers server re-fetch if applicable
        window.location.reload(); // Hard reload for simplicity since we fetched from client on page.jsx
      } else {
        alert("Failed to delete content");
      }
    } finally {
      setIsDeleting(null);
      setOpenMenuId(null);
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
        router.refresh();
        window.location.reload(); 
      } else {
        alert("Failed to update content");
      }
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-2 flex flex-col h-full">

      {/* Tabs */}
      <div className="flex gap-4 mb-3 text-xs shrink-0 overflow-x-auto scrollbar-none">
        {["All", "Published", "Draft", "Under Review"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`transition whitespace-nowrap uppercase tracking-widest font-black ${
              filter === tab
                ? "text-red-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Items */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {paginatedContent.length > 0 ? (
          paginatedContent.map((item) => {
            const displayTitle = item.title || item.dish_name || "Untitled";
            const displayDate = new Date(item.submission_date || item.updated_at).toLocaleDateString();
            const isEditing = editingId === item.id;
            
            return (
              <div
                key={item.id}
                className="flex justify-between items-center px-3 py-2 bg-gray-800 rounded-md text-sm border border-transparent hover:border-gray-700 transition"
              >
                {/* Title and Category */}
                <div className="flex-1 min-w-0 mr-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-700 outline-none w-full max-w-[150px]"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleUpdate(item.id, item.type)}
                        disabled={isUpdating === item.id}
                        className="text-[10px] bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        {isUpdating === item.id ? "Saving..." : "Save"}
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="text-[10px] text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-sm text-gray-200 truncate">{displayTitle}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                        {item.type}
                      </p>
                    </>
                  )}
                </div>

                {/* Meta properties */}
                <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs text-gray-400">
                  <div className="w-16">0 views</div>
                  <div className="w-20 text-right">{displayDate}</div>
                  <div className="w-20 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-400">
                      Published
                    </span>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative ml-4 shrink-0">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="p-1 text-gray-400 hover:text-white rounded transition hover:bg-white/5"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-8 w-28 bg-[#1A1F2B] border border-gray-700 rounded-lg shadow-xl z-50 py-1">
                      <button
                        onClick={() => {
                          setEditTitle(displayTitle);
                          setEditingId(item.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.type)}
                        disabled={isDeleting === item.id}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"
                      >
                        {isDeleting === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-500 text-xs">
            No content found.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-800 shrink-0">
          <p className="text-[10px] text-gray-500">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-800 rounded text-[10px] text-gray-400 disabled:opacity-30 hover:bg-gray-700"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 bg-gray-800 rounded text-[10px] text-gray-400 disabled:opacity-30 hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}