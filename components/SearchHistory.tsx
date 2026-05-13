"use client";

import { motion } from "framer-motion";
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
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="animate-pulse">Loading search history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No recent searches
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Recent Searches</h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Trash2 size={12} />
          Clear all
        </button>
      </div>

      <div className="space-y-1">
        {history.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
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
      </div>
    </div>
  );
}