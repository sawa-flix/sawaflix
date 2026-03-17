"use client";

import React, { useState, useEffect } from "react";
import PerformanceChart from "@/components/Dashboard/PerformanceChart";
import ContentTable from "@/components/Dashboard/ContentTable";
import { Loader2 } from "lucide-react";

export default function CreatorDashboardPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/creator/content");

        if (!res.ok) {
          throw new Error("Failed to fetch content");
        }

        const data = await res.json();
        setContent(data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Loading your dashboard...</p>
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
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const generatedStats = [
    { title: "Total Uploads", value: content.length, growth: "+0%" },
    { title: "Stories", value: content.filter(c => c.type === 'story').length, growth: "+0%" },
    { title: "Food", value: content.filter(c => c.type === 'food').length, growth: "+0%" },
    { title: "Music", value: content.filter(c => c.type === 'music').length, growth: "+0%" },
    { title: "Views", value: 0, growth: "+10%" }
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">

      {/* ===== Page Header ===== */}
      <div>
        <p className="text-gray-400 text-sm mt-1">
          Track your performance and manage your content.
        </p>
      </div>

      {/* ===== Stats Section ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {generatedStats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#111827] border border-gray-800 rounded-xl p-4 
                       shadow-lg shadow-red-500/5 
                       hover:shadow-red-500/10 
                       transition"
          >
            <p className="text-xs text-gray-400">{stat.title}</p>

            <div className="flex items-center justify-between mt-2">
              <p className="text-xl font-bold">{stat.value}</p>
              <span className="text-green-400 text-xs">
                {stat.growth}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Chart Section (Flexible) ===== */}
      <div className="flex-1 bg-[#1A1A1A] rounded-2xl p-4 overflow-hidden">
        <PerformanceChart />
      </div>

      {/* ===== Table Section (Only Scrollable Area) ===== */}
      <div className="h-64 bg-[#1A1A1A] rounded-2xl p-4 flex flex-col">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">
          Recent Content
        </h2>

        <div className="flex-1 overflow-y-auto">
          <ContentTable contents={content} />
        </div>
      </div>

    </div>
  );
}
