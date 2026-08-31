"use client";

import SearchBar from "@/components/searchBar";
import useSearch from "@/hooks/useSearch";
import { searchContent } from "@/services/searchContent";

export default function SearchPage() {
  const {
    loading,
    results,
    error,
    search,
    loadMore,
    hasMore,
    clearCache
  } = useSearch(searchContent);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Search</h1>
        <button
          onClick={clearCache}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          Clear Cache
        </button>
      </div>
      
      <SearchBar
        onSearch={search}
        loading={loading}
        results={results}
        error={error}
        placeholder="Search videos, music, movies..."
        minQueryLength={2}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />
    </div>
  );
}