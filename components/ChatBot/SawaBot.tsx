'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowUp, 
  RotateCcw, 
  Maximize2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSawaiStore } from '@/store/sawaiStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_SUGGESTIONS = [
  'What is SawaFlix?',
  'Cameroonian Music',
  'How Reels Work',
  'Creator Studio'
];

// Helper to remove any emojis from text
function stripEmojis(text: string): string {
  return text.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
    ''
  );
}

export default function SawaBot() {
  const { isOpen, closeSawai, toggleSawai } = useSawaiStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-message',
      role: 'assistant',
      content: "Hello, I am **Sawai**, your assistant for SawaFlix.\n\nAsk me about movies, Cameroonian music, reels, or creator publishing.",
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
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [messages, isOpen]);

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-message',
        role: 'assistant',
        content: "Chat cleared. I am **Sawai**, ready for your questions about SawaFlix.",
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

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '' },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line) continue;
          if (line.startsWith('0:')) {
            try {
              const textContent = JSON.parse(line.substring(2));
              assistantText += stripEmojis(textContent);
            } catch {
              assistantText += stripEmojis(line.substring(2));
            }
          } else {
            assistantText += stripEmojis(line);
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
      setError('Could not reach Sawai server. Please check your connection and try again.');
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
      {/* Chat Window Drawer: Super Clean & Uncluttered */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-6 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[calc(100vh-4rem)] rounded-2xl bg-[color:var(--surface)] border border-[color:var(--border)] shadow-[0_16px_40px_rgba(15,15,15,0.12)] flex flex-col overflow-hidden"
          >
          {/* High-Performance African Indigo Textile / Sawai Pattern Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-30 mix-blend-screen"
            style={{ backgroundImage: "url('/logos_and_pwas/sawai.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--background)]/90 via-[color:var(--background)]/75 to-[color:var(--background)]/95 pointer-events-none" />

          {/* Header: Minimal & Focused */}
          <div className="relative z-10 px-4 py-3 bg-[color:var(--surface-elevated)]/90 border-b border-[color:var(--border)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-sm">
                <Image
                  src="/logos_and_pwas/android-chrome-192x192.png"
                  alt="Sawai"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-[color:var(--foreground)] font-semibold text-sm tracking-tight">Sawai</h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[color:var(--surface)] text-[color:var(--muted-foreground)] border border-[color:var(--border)]">
                  AI
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/dashboard/sawai"
                onClick={closeSawai}
                title="Expand to Full Page"
                className="p-1.5 rounded-lg text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)] transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={closeSawai}
                title="Close"
                className="p-1.5 rounded-lg text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface-hover)] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="relative z-10 flex-1 p-3.5 overflow-y-auto space-y-3 text-xs scrollbar-thin scrollbar-thumb-zinc-800">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                const formattedContent = stripEmojis(m.content).replace(/:\*\s+/g, ':\n\n* ');

                return (
                  <div key={m.id} className="space-y-2">
                    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start items-start'}`}>
                      {!isUser && (
                        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 p-0.5 overflow-hidden">
                          <Image
                            src="/logos_and_pwas/favicon-32x32.png"
                            alt="Sawai"
                            width={14}
                            height={14}
                            className="w-full h-full object-contain rounded-full"
                          />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
                          isUser
                            ? 'bg-[color:var(--foreground)] text-[color:var(--background)] font-medium rounded-tr-xs shadow-sm'
                            : 'bg-[color:var(--surface)] text-[color:var(--foreground)] border border-[color:var(--border)] rounded-tl-xs shadow-sm'
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap break-words">{m.content}</div>
                        ) : (
                          <div className="prose prose-invert max-w-none text-[12.5px] leading-relaxed break-words space-y-2">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => <h1 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-[13px] font-semibold text-white mt-2 mb-1">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xs font-semibold text-zinc-100 mt-1.5 mb-0.5">{children}</h3>,
                                p: ({ children }) => <p className="mb-2 last:mb-0 text-zinc-300 leading-relaxed">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc pl-3.5 space-y-1 mb-2 text-zinc-300">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-3.5 space-y-1 mb-2 text-zinc-300">{children}</ol>,
                                li: ({ children }) => <li className="leading-snug">{children}</li>,
                                code: ({ children }) => (
                                  <code className="bg-white/10 text-zinc-200 px-1 py-0.2 rounded text-[11px] font-mono">
                                    {children}
                                  </code>
                                ),
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-100 hover:text-white underline underline-offset-2 transition-colors"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {formattedContent}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Clean Inline Starter Pills (Only visible when conversation is fresh) */}
                    {!isUser && messages.length === 1 && (
                      <div className="pl-7 pt-1 flex flex-wrap gap-1.5">
                        {STARTER_SUGGESTIONS.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(suggestion)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-2 items-center text-zinc-400 text-xs py-1">
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
                    <Image
                      src="/logos_and_pwas/favicon-32x32.png"
                      alt="Sawai"
                      width={14}
                      height={14}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#11141D] border border-white/5 rounded-lg px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={() => {
                      const lastUserMsg = messages.slice().reverse().find((m) => m.role === 'user');
                      if (lastUserMsg) sendMessage(lastUserMsg.content);
                    }}
                    className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-white font-medium transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar: Ultra Simple & Clean */}
            <form
              onSubmit={handleSubmit}
              className="relative z-10 p-3 bg-[#0D111A]/90 backdrop-blur-md border-t border-white/10 shrink-0"
            >
              <div className="flex items-center gap-2 bg-[#11141D] border border-white/10 focus-within:border-white/25 rounded-xl px-3 py-1.5 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Sawai..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white placeholder:text-zinc-500 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !(input || '').trim()}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                  aria-label="Send"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
