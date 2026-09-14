// CommentSidebarContext.tsx – provides a context to open/close Reels-style comment sidebar/bottom sheet
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
      </AnimatePresence>
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
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Reels comments panel: bottom sheet on mobile, right panel on desktop */}
      <motion.aside
        role="dialog"
        aria-label="Story Comments"
        initial={isDesktop ? { x: '100%' } : { y: '100%' }}
        animate={isDesktop ? { x: 0 } : { y: 0 }}
        exit={isDesktop ? { x: '100%' } : { y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={
          isDesktop
            ? 'fixed inset-y-0 right-0 z-50 flex w-[380px] sm:w-[400px] flex-col border-l border-white/10 bg-[#07090E] shadow-2xl overflow-hidden'
            : 'fixed inset-x-0 bottom-0 z-50 flex h-[70vh] flex-col rounded-t-3xl border-t border-white/10 bg-[#07090E] shadow-2xl overflow-hidden'
        }
      >
        {/* High-Performance African Indigo Textile / Sawai Pattern Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-30 mix-blend-screen"
          style={{ backgroundImage: "url('/logos_and_pwas/sawai.svg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/90 via-[#07090E]/75 to-[#07090E]/95 pointer-events-none" />

        {/* Mobile Swipe Handle */}
        {!isDesktop && (
          <div className="relative z-10 pt-3 pb-1 flex justify-center w-full shrink-0 bg-[#0F1117]/80 backdrop-blur-md">
            <div className="h-1.5 w-12 rounded-full bg-white/20" />
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

