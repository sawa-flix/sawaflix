"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import SearchHistory from "./SearchHistory";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  thumbnail?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
  results: SearchResult[];
  error: string | null;
  placeholder?: string;
  minQueryLength?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function SearchBar({
  onSearch,
  loading,
  results,
  error,
  placeholder = "Search...",
  minQueryLength = 1,
  onLoadMore,
  hasMore
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { history, loading: historyLoading, removeHistoryItem, clearHistory } = useSearchHistory();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Trigger search if query meets minimum length
    if (value.length >= minQueryLength) {
      onSearch(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= minQueryLength) {
      onSearch(query.trim());
    }
  };

  const handleHistorySelect = (historyQuery: string) => {
    setQuery(historyQuery);
    onSearch(historyQuery);
    setIsFocused(false);
  };

  const clearInput = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const showHistory = isFocused && query.trim() === "" && !loading;
  const showResults = query.trim().length >= minQueryLength && (results.length > 0 || loading || error);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow clicks
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            <SearchHistory
              history={history}
              onSelect={handleHistorySelect}
              onDelete={removeHistoryItem}
              onClear={clearHistory}
              loading={historyLoading}
            />
          </motion.div>
        )}

        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            {/* Search Results */}
            <div className="p-4">
              {loading && (
                <div className="text-center text-gray-400 py-4">
                  <div className="animate-pulse">Searching...</div>
                </div>
              )}

              {error && (
                <div className="text-center text-red-400 py-4">
                  {error}
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Search Results</h3>
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      {result.thumbnail && (
                        <img
                          src={result.thumbnail}
                          alt={result.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{result.title}</div>
                        <div className="text-xs text-gray-400 capitalize">{result.type}</div>
                      </div>
                    </div>
                  ))}

                  {hasMore && onLoadMore && (
                    <button
                      onClick={onLoadMore}
                      className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Load more results
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}