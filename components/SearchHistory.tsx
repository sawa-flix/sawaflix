"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";

interface SearchHistoryItem {
  id: string;
  user_id: string;
  search_query: string;
  searched_at: string;
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (query: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  loading: boolean;
}

export default function SearchHistory({
  history,
  onSelect,
  onDelete,
  onClear,
  loading
}: SearchHistoryProps) {
  console.log('[SearchHistory] Rendering - loading:', loading, 'history.length:', history.length, 'history:', history);

  if (loading) {
    console.log('[SearchHistory] Showing LOADING state');
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="animate-pulse">Loading search history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    console.log('[SearchHistory] Showing EMPTY state - No recent searches');
    const trendingChips = [
      "Afrobeats",
      "Nollywood Classics",
      "Traditional Dances",
      "Cameroon Music Hits",
      "African Food & Stories",
      "Living Traditions"
    ];
    return (
      <div className="p-5 text-center flex flex-col items-center">
        <p className="text-sm text-gray-400 mb-4">No recent searches</p>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-3">Trending Categories</span>
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {trendingChips.map((chip) => (
            <button
              key={chip}
              onClick={() => onSelect(chip)}
              className="px-3 py-1 text-xs bg-gray-800/60 hover:bg-red-600 hover:text-white border border-gray-700/50 text-gray-300 rounded-full transition-all active:scale-95 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    );
  }

  console.log('[SearchHistory] Showing list with', history.length, 'items');

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3 border-b border-gray-700/30 pb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Trash2 size={12} />
          Clear all
        </button>
      </div>

      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, padding: 0, margin: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer overflow-hidden"
              onClick={() => onSelect(item.search_query)}
            >
              <span className="text-sm text-gray-200 truncate flex-1">
                {item.search_query}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
              >
                <X size={14} className="text-gray-400 hover:text-red-400" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}