'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import type { Comment } from '@/types/youtube';

interface ReelCommentsProps {
  isOpen: boolean;
  isDesktop: boolean;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSend: (text: string) => void;
}

/**
 * TikTok-style comments sheet — bottom sheet on mobile, side panel on
 * desktop. Purely presentational; all fetching/posting is owned by the
 * caller (ReelCard) via the existing useComments hook and
 * commentYouTubeVideoAction server action.
 */
export function ReelComments({ isOpen, isDesktop, comments, loading, error, onClose, onSend }: ReelCommentsProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-label="Comments"
        initial={isDesktop ? { x: '100%' } : { y: '100%' }}
        animate={isDesktop ? { x: 0 } : { y: 0 }}
        exit={isDesktop ? { x: '100%' } : { y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={
          isDesktop
            ? 'fixed inset-y-0 right-0 z-50 flex w-[380px] flex-col border-l border-white/10 bg-[#0F1117]'
            : 'fixed inset-x-0 bottom-0 z-50 flex h-[70vh] flex-col rounded-t-3xl border-t border-white/10 bg-[#0F1117]'
        }
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            {comments.length} Comments
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-white/40" size={24} />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-white/40">{error}</p>
          ) : comments.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">No comments yet. Be the first!</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-3">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                    {comment.authorProfileImage && (
                      <Image
                        src={comment.authorProfileImage}
                        alt={comment.author}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white/80">{comment.author}</p>
                    <p className="mt-0.5 text-sm text-white/90 break-words">{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 p-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            aria-label="Add a comment"
            className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:bg-white/10"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Send comment"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
