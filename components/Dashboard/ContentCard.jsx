"use client";

import React from "react";
import Image from "next/image";
import { Edit2, Trash2, Eye, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const ContentCard = ({ item, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case "published":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "draft":
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-[#1A1F2B]/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-700 hover:shadow-2xl hover:shadow-black/50"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={item.thumbnail || "/api/placeholder/400/225"}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2B] via-transparent to-transparent opacity-60" />
      </div>

      {/* Content Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white truncate pr-2 group-hover:text-red-500 transition-colors">
            {item.title}
          </h3>
        </div>

        <div className="flex items-center text-sm text-gray-400 mb-4 space-x-3">
          <span className="capitalize">{item.type || "Content"}</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full" />
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
              className="flex items-center px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 text-xs font-medium rounded-lg border border-gray-700 transition-colors"
            >
              <Edit2 className="w-3 h-3 mr-1.5" />
              Edit
            </button>
            
            {(item.status === 'draft' || !item.status) && (
               <button
                onClick={() => onDelete(item.id)}
                className="flex items-center justify-center p-1.5 bg-gray-800/30 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg border border-gray-700/50 hover:border-red-500/30 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor(item.status)}`}>
            {getStatusIcon(item.status)}
            <span className="uppercase tracking-wider">
              {item.status === 'approved' ? 'Published' : item.status || 'Draft'}
            </span>
          </div>
          
          {item.status === 'approved' && (
             <button
              onClick={() => onDelete(item.id)}
              className="flex items-center justify-center p-1.5 bg-gray-800/30 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg border border-gray-700/50 hover:border-red-500/30 transition-all"
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
