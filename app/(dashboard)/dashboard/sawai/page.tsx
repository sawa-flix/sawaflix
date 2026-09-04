'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  Film, 
  Music, 
  Flame, 
  Tv, 
  ExternalLink,
  ShieldCheck,
  Compass,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const FEATURED_PROMPTS = [
  {
    category: 'Cinema & Culture',
    icon: Film,
    title: 'Cameroonian Movies',
    prompt: 'What are the top Cameroonian movies and series to watch on SawaFlix?',
  },
  {
    category: 'Music & Sounds',
    icon: Music,
    title: 'Makossa & Bikutsi Legends',
    prompt: 'Tell me about the history of Makossa and Bikutsi music, and which artists are featured on SawaFlix.',
  },
  {
    category: 'Short Reels',
    icon: Flame,
    title: 'How Reels Work',
    prompt: 'How does the SawaFlix interactive Reels feed work, and how can I interact with videos?',
  },
  {
    category: 'Creators',
    icon: Sparkles,
    title: 'Creator Monetization',
    prompt: 'How can African filmmakers and musicians upload, get verified, and monetize on SawaFlix?',
  },
];

export default function SawaiPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 **Mbote & Welcome to Sawai!**\n\nI am your dedicated AI intelligence engine for **SawaFlix**—Cameroon's premier destination for cinema, music, reels, and cultural storytelling.\n\nWhether you want movie recommendations, insights into Sawa heritage & the Ngondo festival, details about Cameroonian music genres (Makossa, Bikutsi, Assiko, Afrobeats), or guidance on becoming a verified creator, ask me anything!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
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
      console.error('[Sawai Page] Error:', err);
      setError('Could not reach Sawai service. Please verify your connection or try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "✨ **Conversation reset.** I am **Sawai**, ready for your questions about SawaFlix movies, music, and culture.",
      },
    ]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B0E14]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5 text-xs font-medium"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#CE1126] via-[#3a4150] to-[#FCD116] p-[1.5px] shadow-md">
              <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center p-1.5 overflow-hidden">
                <Image
                  src="/logos_and_pwas/android-chrome-192x192.png"
                  alt="Sawai Logo"
                  width={34}
                  height={34}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-base tracking-tight">Sawai Intelligence</h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                The official cultural & entertainment AI for SawaFlix
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Welcome Cards for Empty or Initial State */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2"
          >
            {FEATURED_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => sendMessage(item.prompt)}
                  className="p-4 rounded-2xl bg-[#0F131C] border border-white/10 hover:border-white/25 hover:bg-[#141926] text-left transition-all group cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-zinc-100 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Message Thread */}
        <div className="flex-1 space-y-6">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start items-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-full bg-[#0B0E14] border border-white/15 flex items-center justify-center shrink-0 mt-0.5 p-1 shadow-sm overflow-hidden">
                    <Image
                      src="/logos_and_pwas/favicon-32x32.png"
                      alt="Sawai"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-5 py-4 leading-relaxed text-[14px] ${
                    isUser
                      ? 'bg-zinc-100 text-zinc-950 font-medium rounded-tr-sm shadow-md'
                      : 'bg-[#0e121a] text-zinc-200 border border-white/10 rounded-tl-sm shadow-lg'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-[14px] leading-relaxed break-words space-y-3">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold text-white mt-3.5 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold text-zinc-100 mt-3 mb-1.5">{children}</h3>,
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-zinc-200">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3 last:mb-0 text-zinc-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 last:mb-0 text-zinc-300">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          code: ({ children }) => (
                            <code className="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded text-[13px] font-mono">
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-white/20 pl-3.5 italic text-zinc-400 my-2">
                              {children}
                            </blockquote>
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
              className="flex gap-3.5 items-center text-zinc-400 text-xs py-2"
            >
              <div className="w-9 h-9 rounded-full bg-[#0B0E14] border border-white/15 flex items-center justify-center shrink-0 p-1 overflow-hidden">
                <Image
                  src="/logos_and_pwas/favicon-32x32.png"
                  alt="Sawai"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain rounded-full animate-pulse"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-[#0e121a] border border-white/10 rounded-xl px-4 py-2.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-zinc-400 ml-2">Sawai is generating a response...</span>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button
                onClick={() => {
                  const lastUserMsg = messages.slice().reverse().find((m) => m.role === 'user');
                  if (lastUserMsg) sendMessage(lastUserMsg.content);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-medium transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Input Bar at Bottom */}
      <footer className="sticky bottom-0 z-40 bg-[#0B0E14]/90 backdrop-blur-2xl border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2.5 bg-[#0e121a] border border-white/15 rounded-2xl p-2 focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/20 transition-all shadow-xl"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sawai anything about movies, music, reels, culture..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-white placeholder:text-zinc-500 text-sm px-3 py-2 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !(input || '').trim()}
              className="w-10 h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0 active:scale-95 font-semibold"
              aria-label="Send message"
            >
              <ArrowUp className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </button>
          </form>
          <p className="text-center text-[11px] text-zinc-500 mt-2">
            Sawai is powered by Gemini 2.5 Flash and SawaFlix Cultural Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
