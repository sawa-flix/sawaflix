'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import type { Comment } from '@/types/youtube';

interface ReelCommentsProps {
  isOpen: boolean;
  isDesktop: boolean;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSend: (text: string, parentId?: string) => void;
  onLikeComment?: (commentId: string, isReply?: boolean, parentId?: string) => void;
}

const CULTURAL_REACTIONS = [
  { emoji: '🇨🇲', label: 'Cameroon Pride', text: '🇨🇲 Proud Cameroon culture! ' },
  { emoji: '🔥', label: 'Fire Reel', text: '🔥 Straight fire! ' },
  { emoji: '👏', label: 'Pure Gold', text: '👏 Big respect! ' },
  { emoji: '❤️', label: 'Love', text: '❤️ Loving this content! ' },
  { emoji: '🍿', label: 'Sweet Story', text: '🍿 Sweet die! ' },
];

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Just now';
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

/**
 * TikTok-style comments sheet — bottom sheet on mobile, docked side panel on desktop.
 * Rendered in document.body via Portal to guarantee freedom from parent layout clipping.
 */
export function ReelComments({
  isOpen,
  isDesktop,
  comments,
  loading,
  error,
  onClose,
  onSend,
  onLikeComment,
}: ReelCommentsProps) {
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim(), replyingTo?.id);
    setText('');
    setReplyingTo(null);
  };

  const handleAppendReaction = (reactionText: string) => {
    setText((prev) => prev + reactionText);
    inputRef.current?.focus();
  };

  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (c.repliesCount || c.replies?.length || 0),
    0
  );

  const panelVariants = {
    hidden: isDesktop ? { x: '100%', y: 0 } : { y: '100%', x: 0 },
    visible: { x: 0, y: 0 },
    exit: isDesktop ? { x: '100%', y: 0 } : { y: '100%', x: 0 },
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop to dismiss comments */}
          {!isDesktop && (
            <motion.div
              role="presentation"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
            />
          )}

          <motion.div
            role="dialog"
            aria-label="Reel Comments"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            drag={!isDesktop ? 'y' : false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_e, info) => {
              if (!isDesktop && (info.offset.y > 100 || info.velocity.y > 450)) {
                onClose();
              }
            }}
            className={
              isDesktop
                ? 'fixed inset-y-0 right-0 z-[9999] flex w-[380px] sm:w-[420px] flex-col border-l border-white/10 bg-[#07090E] shadow-2xl overflow-hidden'
                : 'fixed inset-x-0 bottom-0 z-[9999] flex h-[78vh] max-h-[85vh] flex-col rounded-t-3xl border-t border-white/15 bg-[#07090E] shadow-[0_-12px_40px_rgba(0,0,0,0.85)] overflow-hidden'
            }
          >
            {/* High-Performance African Indigo Textile / Sawai Pattern Background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-30 mix-blend-screen"
              style={{ backgroundImage: "url('/logos_and_pwas/sawai.svg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/90 via-[#07090E]/75 to-[#07090E]/95 pointer-events-none" />

            {/* Mobile Swipe / Drag Handle */}
            {!isDesktop && (
              <div className="relative z-10 pt-3 pb-2 flex justify-center w-full shrink-0 bg-[#0F1117]/90 backdrop-blur-md cursor-grab active:cursor-grabbing border-b border-white/5">
                <div className="h-1.5 w-12 rounded-full bg-white/30" />
              </div>
            )}

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0F1117]/80 backdrop-blur-md p-4 shrink-0">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                {totalCommentsCount} {totalCommentsCount === 1 ? 'Comment' : 'Comments'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close comments"
                className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Comments List */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-white/40" size={24} />
                </div>
              ) : error ? (
                <p className="py-10 text-center text-sm text-white/40">{error}</p>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-2xl mb-2">🇨🇲</div>
                  <p className="text-sm text-white/80 font-bold mb-1">No comments yet</p>
                  <p className="text-xs text-white/40 mb-4">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {comments.map((comment) => (
                    <li key={comment.id} className="flex gap-3 text-left">
                      {/* Avatar */}
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10 border border-white/10">
                        {comment.authorProfileImage ? (
                          <Image
                            src={comment.authorProfileImage}
                            alt={comment.author}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white/80 bg-gradient-to-tr from-zinc-700 to-zinc-800">
                            {comment.author?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white/80">{comment.author}</span>
                          {comment.userRole && !['member', 'viewer', 'user'].includes(comment.userRole.toLowerCase()) && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-white/10 border border-white/20 text-[8px] font-black uppercase text-zinc-300">
                              <ShieldCheck className="w-2.5 h-2.5 text-zinc-400" />
                              {comment.userRole}
                            </span>
                          )}
                          <span className="text-[10px] text-white/40">{formatTimeAgo(comment.publishedAt)}</span>
                        </div>

                        <p className="mt-0.5 text-sm text-white/90 break-words leading-relaxed">{comment.text}</p>

                        {/* Actions */}
                        <div className="mt-1.5 flex items-center gap-4 text-xs">
                          {/* Like comment button */}
                          <button
                            type="button"
                            onClick={() => onLikeComment?.(comment.id, false)}
                            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                              comment.isLikedByMe ? 'text-red-400 font-bold' : 'text-zinc-400 hover:text-white'
                            }`}
                            aria-label={comment.isLikedByMe ? 'Unlike comment' : 'Like comment'}
                          >
                            <Image
                              src="/logos_and_pwas/like.png"
                              alt="Like"
                              width={14}
                              height={14}
                              className={`w-3.5 h-3.5 object-contain transition-transform ${
                                comment.isLikedByMe
                                  ? 'scale-110 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                            />
                            <span className="font-mono text-[10px]">
                              {(comment.likeCount || 0) > 0 ? comment.likeCount : 'Like'}
                            </span>
                          </button>

                          {/* Reply button */}
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo({ id: comment.id, author: comment.author });
                              inputRef.current?.focus();
                            }}
                            className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Reply
                          </button>

                          {/* Replies toggle */}
                          {(comment.repliesCount || comment.replies?.length || 0) > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedReplies((prev) => ({
                                  ...prev,
                                  [comment.id]: !prev[comment.id],
                                }))
                              }
                              className="flex items-center gap-1 text-zinc-400 hover:text-white text-[11px] font-medium transition-colors cursor-pointer ml-auto"
                            >
                              {expandedReplies[comment.id] ? (
                                <>
                                  <ChevronUp size={13} />
                                  <span>Hide replies</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={13} />
                                  <span>
                                    View {comment.repliesCount || comment.replies?.length}{' '}
                                    {(comment.repliesCount || comment.replies?.length) === 1 ? 'reply' : 'replies'}
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Nested Replies */}
                        <AnimatePresence>
                          {expandedReplies[comment.id] && comment.replies && comment.replies.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pl-3 border-l border-white/10 space-y-3"
                            >
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-2.5">
                                  <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-zinc-800 border border-white/10">
                                    {reply.authorProfileImage ? (
                                      <Image
                                        src={reply.authorProfileImage}
                                        alt={reply.author}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-zinc-300">
                                        {reply.author?.[0]?.toUpperCase() || 'U'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[11px] font-bold text-white/80">{reply.author}</span>
                                      <span className="text-[9px] text-white/40">{formatTimeAgo(reply.publishedAt)}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-white/90 break-words leading-relaxed">{reply.text}</p>
                                    <div className="mt-1 flex items-center gap-3 text-[10px]">
                                      <button
                                        type="button"
                                        onClick={() => onLikeComment?.(reply.id, true, comment.id)}
                                        className={`flex items-center gap-1 transition-colors cursor-pointer ${
                                          reply.isLikedByMe ? 'text-red-400 font-bold' : 'text-zinc-400 hover:text-white'
                                        }`}
                                      >
                                        <Image
                                          src="/logos_and_pwas/like.png"
                                          alt="Like"
                                          width={12}
                                          height={12}
                                          className={`w-3 h-3 object-contain ${reply.isLikedByMe ? 'scale-110' : 'opacity-70'}`}
                                        />
                                        <span className="font-mono">
                                          {(reply.likeCount || 0) > 0 ? reply.likeCount : 'Like'}
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pinned Bottom Composer */}
            <div className="relative z-10 border-t border-white/10 p-4 bg-[#0F1117]/90 backdrop-blur-md shrink-0">
              {/* Replying banner */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex items-center justify-between mb-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300"
                  >
                    <span>
                      Replying to <strong className="text-white">@{replyingTo.author}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="p-0.5 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cultural Quick Reactions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
                {CULTURAL_REACTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleAppendReaction(item.text)}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[11px] text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer active:scale-95"
                  >
                    <span>{item.emoji}</span>
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={replyingTo ? `Reply to @${replyingTo.author}...` : 'Add a comment...'}
                  aria-label="Add a comment"
                  className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:bg-white/10 border border-transparent focus:border-white/10 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  aria-label="Send comment"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white text-[#0B0E14] transition-colors hover:bg-white/85 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-95"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
