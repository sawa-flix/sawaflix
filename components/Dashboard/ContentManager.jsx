"use client";

import React, { useState, useMemo } from "react";
import ContentCard from "@/components/Dashboard/ContentCard";
import ContentFilters from "@/components/Dashboard/ContentFilters";
import { Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const ContentManager = ({ initialContent }) => {
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    sortByDate: "newest",
    sortByViews: "highest",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredAndSortedContent = useMemo(() => {
    let result = [...initialContent];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type !== "all") {
      result = result.filter((item) => item.type?.toLowerCase() === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((item) => item.status?.toLowerCase() === filters.status);
    }

    // Sort by Date
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return filters.sortByDate === "newest" ? dateB - dateA : dateA - dateB;
    });

    // Sort by Views
    // Note: If sorting by both, date usually takes precedence or we can combine. 
    // For simplicity, we'll let the user choose which sort to apply, or apply views if it's not the default highest
    if (filters.sortByViews === "highest") {
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
        result.sort((a, b) => (a.views || 0) - (b.views || 0));
    }

    return result;
  }, [initialContent, filters]);

  const handleEdit = (item) => {
    console.log("Edit item:", item);
    // Add logic or navigation to edit page
    window.location.href = `/creator/content/${item.id}/edit`;
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this content?")) {
        console.log("Delete item:", id);
        // Add actual delete logic here
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
            My Content
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl border-l-2 border-red-600 pl-4">
            Manage your digital showcase. Track performance and update your creations in real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <Link
            href="/creator/post"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1A1F2B]/80 hover:bg-red-600 text-white font-bold rounded-xl border border-gray-800 hover:border-red-500 shadow-xl transition-all active:scale-95 group"
            >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Upload Content
            </Link>
        </div>
      </div>

      {/* Filters Section */}
      <ContentFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Content Grid */}
      {filteredAndSortedContent.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedContent.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-[#1A1F2B]/30 rounded-3xl border border-dashed border-gray-800"
        >
          <div className="bg-gray-800/50 p-6 rounded-full mb-6">
            <Filter className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No matching content</h3>
          <p className="text-gray-400 mb-8 px-4 text-center">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
          <button 
            onClick={() => setFilters({ search: "", type: "all", status: "all", sortByDate: "newest", sortByViews: "highest" })}
            className="text-red-500 hover:text-red-400 font-semibold underline underline-offset-4"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ContentManager;
