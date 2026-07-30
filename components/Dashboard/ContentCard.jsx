"use client";

import React from "react";
import Image from "next/image";
import { Edit2, Trash2, Eye, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const ContentCard = ({ item, onEdit, onDelete }) => {
  const normalizedStatus = item.status?.toLowerCase() === "approved" ? "published" : item.status?.toLowerCase();

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "draft":
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const hasThumbnail = item.thumbnail && item.thumbnail.startsWith("http");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-[color:var(--surface)]/70 backdrop-blur-sm border border-[color:var(--border)] rounded-xl overflow-hidden transition-all duration-300 hover:border-[color:var(--foreground)]/30 hover:shadow-2xl hover:shadow-black/20"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden">
        {hasThumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-[color:var(--surface)] to-purple-900/30 flex items-center justify-center">
            <div className="text-[color:var(--muted-foreground)] text-4xl">
              {item.content_type === "audio" ? "🎵" : "🎬"}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--surface)] via-transparent to-transparent opacity-60" />
      </div>

      {/* Content Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-[color:var(--foreground)] truncate pr-2 group-hover:text-red-500 transition-colors">
            {item.title}
          </h3>
        </div>

        <div className="flex items-center text-sm text-[color:var(--muted-foreground)] mb-4 space-x-3">
          <span className="capitalize">{item.type || "Content"}</span>
          <span className="w-1 h-1 bg-[color:var(--border)] rounded-full" />
          <div className="flex items-center">
            <Eye className="w-3.5 h-3.5 mr-1" />
            <span>{item.views?.toLocaleString() || 0} views</span>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="flex items-center px-3 py-1.5 bg-[color:var(--surface)]/60 hover:bg-[color:var(--surface)]/80 text-[color:var(--foreground)] text-xs font-medium rounded-lg border border-[color:var(--border)] transition-colors"
            >
              <Edit2 className="w-3 h-3 mr-1.5" />
              Edit
            </button>
            
            {(normalizedStatus === 'draft' || !normalizedStatus) && (
               <button
                onClick={() => onDelete(item.id)}
                className="flex items-center justify-center p-1.5 bg-[color:var(--surface)]/40 hover:bg-red-500/20 text-[color:var(--muted-foreground)] hover:text-red-400 rounded-lg border border-[color:var(--border)]/50 hover:border-red-500/30 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor(normalizedStatus)}`}>
            {getStatusIcon(normalizedStatus)}
            <span className="uppercase tracking-wider">
              {normalizedStatus || 'Draft'}
            </span>
          </div>
          
          {normalizedStatus === 'published' && (
             <button
              onClick={() => onDelete(item.id)}
              className="flex items-center justify-center p-1.5 bg-[color:var(--surface)]/40 hover:bg-red-500/20 text-[color:var(--muted-foreground)] hover:text-red-400 rounded-lg border border-[color:var(--border)]/50 hover:border-red-500/30 transition-all"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
