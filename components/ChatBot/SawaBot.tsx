'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowUp, 
  RotateCcw,
  Minimize2,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_SUGGESTIONS = [
  { label: '🎬 What is SawaFlix?', prompt: 'What is SawaFlix and what can I stream here?' },
  { label: '🎵 Music Streaming', prompt: 'Tell me about SawaFlix music and how to listen to Makossa or Bikutsi.' },
  { label: '📱 How do Reels work?', prompt: 'How do SawaFlix short reels work?' },
  { label: '🌟 Become a Creator', prompt: 'How can I become a creator and upload videos or music?' },
  { label: '🔔 Push Notifications', prompt: 'How do I enable push notifications to receive updates?' },
];

export default function SawaBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-message',
      role: 'assistant',
      content: "👋 **Mbote & Welcome to SawaFlix!** I'm **Sawai**, your guide to Cameroon's movies, music, reels, and vibrant cultural traditions.\n\nHow can I help you today? Ask me about streaming, uploading, artists, or app features!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasOpenedOnce(true);
  };

  const handleSuggestionClick = (promptText: string) => {
    setInput(promptText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-message',
        role: 'assistant',
        content: "✨ Chat cleared! I'm **Sawai**, ready for your questions about SawaFlix movies, music, and culture.",
      },
    ]);
    setError(null);
  };

  const sendMessage = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      const assistantId = `assistant-${Date.now()}`;

      // Insert placeholder for assistant stream
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '' },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Handle both direct text chunks and legacy protocol lines
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line) continue;
          if (line.startsWith('0:')) {
            try {
              const textContent = JSON.parse(line.substring(2));
              assistantText += textContent;
            } catch {
              assistantText += line.substring(2);
            }
          } else {
            assistantText += line;
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: assistantText } : msg
          )
        );
      }
    } catch (err: any) {
      console.error('[Sawai] Send error:', err);
      setError('Could not reach Sawai server. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <motion.button
          onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#CE1126] via-[#2a2f3a] to-[#FCD116] p-[2px] shadow-2xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-300"
          aria-label="Open SawaFlix AI Assistant"
        >
          <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center relative overflow-hidden group-hover:bg-[#121721] transition-colors p-2">
            {isOpen ? (
              <X className="w-6 h-6 text-white transition-transform duration-200" />
            ) : (
              <div className="flex items-center justify-center relative w-full h-full">
                <Image
                  src="/logos_and_pwas/android-chrome-192x192.png"
                  alt="SawaFlix Logo"
                  width={38}
                  height={38}
                  className="w-full h-full object-contain rounded-full drop-shadow-md group-hover:scale-105 transition-transform"
                  priority
                />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCD116] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FCD116]"></span>
                </span>
              </div>
            )}
          </div>

          {/* Tooltip hint on hover (before opened) */}
          {!isOpen && !hasOpenedOnce && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute right-16 top-2.5 whitespace-nowrap bg-[#161b24] text-zinc-100 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 shadow-xl pointer-events-none flex items-center gap-2 backdrop-blur-md"
            >
              <div className="w-4 h-4 relative shrink-0">
                <Image
                  src="/logos_and_pwas/favicon-32x32.png"
                  alt="SawaFlix"
                  width={16}
                  height={16}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span>Ask Sawai</span>
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Chat Window Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[420px] h-[590px] max-h-[calc(100vh-8rem)] rounded-2xl bg-[#0c1017]/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#0B0E14] via-[#151a23] to-[#0B0E14] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#CE1126] via-[#3a4150] to-[#FCD116] p-[1.5px] shrink-0 shadow-md">
                  <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center p-1.5 overflow-hidden">
                    <Image
                      src="/logos_and_pwas/android-chrome-192x192.png"
                      alt="SawaFlix"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm tracking-tight">Sawai</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                      AI 2.5
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">SawaFlix Culture & Streaming Guide</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm scrollbar-thin scrollbar-thumb-zinc-700">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start items-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-[#0B0E14] border border-white/15 flex items-center justify-center shrink-0 mt-0.5 p-1 shadow-sm overflow-hidden">
                        <Image
                          src="/logos_and_pwas/favicon-32x32.png"
                          alt="SawaFlix"
                          width={20}
                          height={20}
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed text-[13px] ${
                        isUser
                          ? 'bg-zinc-100 text-zinc-950 font-medium rounded-tr-sm shadow-md'
                          : 'bg-[#151922] text-zinc-200 border border-white/10 rounded-tl-sm shadow-md'
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap break-words">
                          {m.content}
                        </div>
                      ) : (
                        <div className="markdown-chat-content prose prose-invert max-w-none text-[13px] leading-relaxed break-words">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                              ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2 last:mb-0">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2 last:mb-0">{children}</ol>,
                              li: ({ children }) => <li className="text-zinc-300 leading-snug">{children}</li>,
                              code: ({ children }) => (
                                <code className="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded text-[12px] font-mono">
                                  {children}
                                </code>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 items-center text-zinc-400 text-xs py-1"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0B0E14] border border-white/15 flex items-center justify-center shrink-0 p-1 overflow-hidden">
                    <Image
                      src="/logos_and_pwas/favicon-32x32.png"
                      alt="SawaFlix"
                      width={20}
                      height={20}
                      className="w-full h-full object-contain rounded-full animate-pulse"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#151922] border border-white/10 rounded-xl px-3.5 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] text-zinc-400 ml-1.5">Sawai is thinking...</span>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex flex-col gap-2">
                  <p>⚠️ {error}</p>
                  <button
                    onClick={() => {
                      const lastUserMsg = messages.slice().reverse().find((m) => m.role === 'user');
                      if (lastUserMsg) sendMessage(lastUserMsg.content);
                    }}
                    className="self-start px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 font-medium text-xs text-white transition-colors cursor-pointer"
                  >
                    Retry Question
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Pills */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-white/5 bg-[#0B0E14]/40 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {QUICK_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(item.prompt)}
                    className="shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3 h-3 text-zinc-500" />
                  </button>
                ))}
              </div>
            )}

            {/* Input Form with Light Border, Subtle Focus and Arrow-Up Button */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-[#0B0E14] border-t border-white/10 flex items-center gap-2 shrink-0"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about movies, music, reels, culture..."
                  disabled={isLoading}
                  className="w-full bg-[#151922] text-white placeholder:text-zinc-500 text-xs sm:text-[13px] pl-3.5 pr-3 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !(input || '').trim()}
                className="w-10 h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all cursor-pointer shrink-0 active:scale-95 font-semibold"
                aria-label="Send message"
              >
                <ArrowUp className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
