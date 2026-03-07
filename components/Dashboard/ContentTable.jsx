"use client";

import { useState } from "react";

const mockContent = [
  {
    id: 1,
    title: "Action Thriller",
    category: "Film",
    views: 58200,
    status: "Published",
    date: "Apr 12, 2024",
  },
  {
    id: 2,
    title: "Travel Vlog",
    category: "Vlog",
    views: 2340,
    status: "Draft",
    date: "Apr 10, 2024",
  },
  {
    id: 3,
    title: "Comedy Sketch",
    category: "Comedy",
    views: 15800,
    status: "Under Review",
    date: "Apr 8, 2024",
  },
];
export default function ContentTable() {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? mockContent
      : mockContent.filter((c) => c.status === filter);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">

      {/* Tabs */}
      <div className="flex gap-6 mb-6 text-sm">
        {["All", "Published", "Draft", "Under Review"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`${filter === tab ? "text-red-500" : "text-gray-400"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-4 bg-[#1A2335] rounded-lg"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-gray-400">{item.category}</p>
            </div>

            <div className="text-sm text-gray-400">
              {item.views.toLocaleString()} views
            </div>

            <div className="text-sm">{item.date}</div>

            <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}