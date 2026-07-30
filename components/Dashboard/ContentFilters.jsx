"use client";

import React from "react";
import { Search, ChevronDown, Filter } from "lucide-react";

const ContentFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-[color:var(--surface)]/30 p-4 rounded-2xl border border-[color:var(--border)]/50 backdrop-blur-md">
      {/* Search bar */}
      <div className="relative w-full md:w-64 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)] group-focus-within:text-red-500 transition-colors" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-[color:var(--surface)]/40 border border-[color:var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
        {/* Type Filter */}
        <div className="relative min-w-[120px]">
          <select
            className="w-full appearance-none bg-[color:var(--surface)]/40 border border-[color:var(--border)] rounded-xl py-2.5 pl-4 pr-10 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
            value={filters.type}
            onChange={(e) => onFilterChange("type", e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="music">Music</option>
            <option value="story">Stories</option>
            <option value="food">Food</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)] pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[120px]">
          <select
            className="w-full appearance-none bg-[color:var(--surface)]/40 border border-[color:var(--border)] rounded-xl py-2.5 pl-4 pr-10 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Published</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)] pointer-events-none" />
        </div>

        <div className="h-6 w-[1px] bg-[color:var(--border)] mx-1 hidden lg:block" />

        {/* Sort by Date */}
        <div className="relative min-w-[140px]">
          <select
            className="w-full appearance-none bg-[color:var(--surface)]/40 border border-[color:var(--border)] rounded-xl py-2.5 pl-4 pr-10 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
            value={filters.sortByDate}
            onChange={(e) => onFilterChange("sortByDate", e.target.value)}
          >
            <option value="newest">Sort by Date</option>
            <option value="oldest">Oldest First</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)] pointer-events-none" />
        </div>

        {/* Sort by Views */}
        <div className="relative min-w-[140px]">
          <select
            className="w-full appearance-none bg-[color:var(--surface)]/40 border border-[color:var(--border)] rounded-xl py-2.5 pl-4 pr-10 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
            value={filters.sortByViews}
            onChange={(e) => onFilterChange("sortByViews", e.target.value)}
          >
            <option value="highest">Most Views</option>
            <option value="lowest">Least Views</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ContentFilters;
