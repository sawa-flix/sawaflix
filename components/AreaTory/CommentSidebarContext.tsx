import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StoryCommentsSection from './StoryCommentsSection';

type CommentSidebarContextType = {
  isOpen: boolean;
  storyId: string | null;
  open: (storyId: string, storyTitle: string, initialComments: number) => void;
  close: () => void;
  toggle: (storyId: string, storyTitle: string, initialComments: number) => void;
  updateStats?: (storyId: string, updates: Partial<{ likesCount: number; viewsCount: number; commentsCount: number }>) => void;
};

const CommentSidebarContext = createContext<CommentSidebarContextType | undefined>(undefined);

export const useCommentSidebar = () => {
  const ctx = useContext(CommentSidebarContext);
  if (!ctx) throw new Error('useCommentSidebar must be used within CommentSidebarProvider');
  return ctx;
};

export const CommentSidebarProvider = ({
  children,
  onUpdateStats,
}: {
  children: ReactNode;
  onUpdateStats?: (storyId: string, updates: Partial<{ likesCount: number; viewsCount: number; commentsCount: number }>) => void;
}) => {
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);
  const [openStoryTitle, setOpenStoryTitle] = useState<string>('');
  const [openInitialComments, setOpenInitialComments] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const open = (id: string, title: string, initialComments: number) => {
    setOpenStoryId(id);
    setOpenStoryTitle(title);
    setOpenInitialComments(initialComments);
  };

  const close = () => {
    setOpenStoryId(null);
  };

  const toggle = (id: string, title: string, initialComments: number) => {
    if (openStoryId === id) {
      close();
    } else {
      open(id, title, initialComments);
    }
  };

  return (
    <CommentSidebarContext.Provider
      value={{
        isOpen: Boolean(openStoryId),
        storyId: openStoryId,
        open,
        close,
        toggle,
        updateStats: onUpdateStats,
      }}
    >
      {children}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {openStoryId && (
            <CommentSidebar
              key={`comment-sidebar-${openStoryId}`}
              storyId={openStoryId}
              storyTitle={openStoryTitle}
              initialComments={openInitialComments}
              onClose={close}
              onStatsUpdate={onUpdateStats}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </CommentSidebarContext.Provider>
  );
};

// Reels-style comments panel: bottom sheet on mobile, docked side panel on desktop
type CommentSidebarProps = {
  storyId: string;
  storyTitle: string;
  initialComments: number;
  onClose: () => void;
  onStatsUpdate?: (storyId: string, updates: Partial<{ likesCount: number; viewsCount: number; commentsCount: number }>) => void;
};

const CommentSidebar = ({ storyId, storyTitle, initialComments, onClose, onStatsUpdate }: CommentSidebarProps) => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Explicit variants declaring both x and y so mobile never inherits translateX from desktop
  const panelVariants = {
    hidden: isDesktop ? { x: '100%', y: 0 } : { y: '100%', x: 0 },
    visible: { x: 0, y: 0 },
    exit: isDesktop ? { x: '100%', y: 0 } : { y: '100%', x: 0 },
  };

  return (
    <>
      {/* Mobile only: backdrop allowing tap-to-dismiss without blocking desktop reading */}
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

      {/* Reels comments panel: bottom sheet on mobile, right panel on desktop */}
      <motion.aside
        role="dialog"
        aria-label="Story Comments"
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

        <StoryCommentsSection
          storyId={storyId}
          storyTitle={storyTitle}
          isSidebarMode={true}
          isDesktop={isDesktop}
          onClose={onClose}
          onCommentCountChange={(newCount) => onStatsUpdate?.(storyId, { commentsCount: newCount })}
        />
      </motion.aside>
    </>
  );
};

export default CommentSidebar;

