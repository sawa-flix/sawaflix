"use client";

import { useRef, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ThumbnailUploader
 * Props:
 *   file        – current File object (or null)
 *   onSelect    – (file: File) => void
 *   onRemove    – () => void
 *   label       – string (default "Thumbnail")
 */
export default function ThumbnailUploader({
  file,
  onSelect,
  onRemove,
  label = "Thumbnail",
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragging(true);
    else setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onSelect(f);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-300 ml-1 block">{label}</label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative rounded-2xl border border-dashed overflow-hidden transition-all duration-200 flex items-center justify-center
          ${file ? "border-red-500/40 cursor-default" : "border-gray-700 cursor-pointer hover:border-gray-500/60 hover:bg-white/[0.02]"}
          ${dragging ? "border-red-500 bg-red-500/5 scale-[1.01]" : ""}
          bg-[#080E1C]`}
        style={{ minHeight: "180px" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSelect(f);
          }}
        />

        <AnimatePresence mode="wait">
          {file && previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                style={{ maxHeight: "240px" }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg text-red-400 hover:bg-red-500/40 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              {/* File name chip */}
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-[10px] text-gray-300 font-medium">
                  {file.name}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 p-8 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-[#111827] border border-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="text-gray-500 w-6 h-6" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Drag & drop or{" "}
                <span className="text-gray-300 font-semibold">browse</span>
                <br />
                PNG, JPG, WEBP — max 5 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
