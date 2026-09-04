'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUp, 
  RotateCcw, 
  ArrowLeft,
  Film,
  Music,
  Tv,
  Sparkles
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

const FEATURED_TOPICS = [
  {
    title: 'Cameroonian Movies',
    description: 'Top films, classic series, and cinema recommendations',
    prompt: 'What are the top Cameroonian movies and series to stream on SawaFlix?',
    icon: Film,
  },
  {
    title: 'Makossa & Bikutsi',
    description: 'Legends, discographies, and Cameroonian musical heritage',
    prompt: 'Tell me about the history of Makossa and Bikutsi music, and which artists are featured on SawaFlix.',
    icon: Music,
  },
  {
    title: 'Interactive Reels',
    description: 'Vertical short-video feeds and engagement features',
    prompt: 'How does the SawaFlix interactive Reels feed work, and how can I interact with videos?',
    icon: Tv,
  },
  {
    title: 'Creator Studio',
    description: 'Publishing, verification, and monetization for artists',
    prompt: 'How can African filmmakers and musicians upload, get verified, and monetize on SawaFlix?',
    icon: Sparkles,
  },
];

function stripEmojis(text: string): string {
  return text.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
    ''
  );
}

export default function SawaiPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello and welcome to **Sawai**.\n\nI am your digital intelligence engine for **SawaFlix**—Cameroon's destination for cinema, music, reels, and cultural storytelling.\n\nAsk me for movie recommendations, insights into Sawa heritage & the Ngondo festival, details about Cameroonian music genres (Makossa, Bikutsi, Assiko), or guidance on publishing as a creator.",
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
      console.error('[Sawai Page] Error:', err);
      setError('Could not reach Sawai service. Please check your connection or try again shortly.');
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
        content: "Conversation cleared. I am **Sawai**, ready for your questions about SawaFlix.",
      },
    ]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/5 flex items-center gap-1.5 text-xs font-medium"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
              <Image
                src="/logos_and_pwas/android-chrome-192x192.png"
                alt="Sawai Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain rounded-full"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-semibold text-sm tracking-tight">Sawai</h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-400">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                SawaFlix Assistant
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Starter Topic Cards */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            {FEATURED_TOPICS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => sendMessage(item.prompt)}
                  className="p-3.5 rounded-xl bg-[#0E121B] border border-white/5 hover:border-white/20 hover:bg-[#121622] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    <h3 className="text-xs font-semibold text-white group-hover:text-zinc-100 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const formattedContent = stripEmojis(m.content).replace(/:\*\s+/g, ':\n\n* ');

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start items-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 p-0.5 overflow-hidden">
                    <Image
                      src="/logos_and_pwas/favicon-32x32.png"
                      alt="Sawai"
                      width={20}
                      height={20}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
                    isUser
                      ? 'bg-zinc-200 text-zinc-950 font-medium rounded-tr-xs shadow-sm'
                      : 'bg-[#0E121B] text-zinc-200 border border-white/5 rounded-tl-xs shadow-sm'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-[13.5px] leading-relaxed break-words space-y-2.5">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold text-white mt-3 mb-1.5 pb-1 border-b border-white/10">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold text-white mt-2.5 mb-1">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-bold text-zinc-100 mt-2 mb-1">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-zinc-300">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2 text-zinc-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2 text-zinc-300">{children}</ol>,
                          li: ({ children }) => <li className="leading-snug">{children}</li>,
                          code: ({ children }) => (
                            <code className="bg-white/10 text-zinc-200 px-1 py-0.2 rounded text-xs font-mono">
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
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-zinc-400 text-xs py-2">
              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
                <Image
                  src="/logos_and_pwas/favicon-32x32.png"
                  alt="Sawai"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-[#0E121B] border border-white/5 rounded-xl px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => {
                  const lastUserMsg = messages.slice().reverse().find((m) => m.role === 'user');
                  if (lastUserMsg) sendMessage(lastUserMsg.content);
                }}
                className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-white font-medium transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <footer className="sticky bottom-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-t border-white/10 p-3 sm:p-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-[#0E121B] border border-white/10 focus-within:border-white/30 rounded-2xl px-3 py-1.5 transition-all shadow-lg"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sawai anything about movies, music, reels, culture..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-white placeholder:text-zinc-500 text-xs sm:text-sm px-2 py-1.5 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !(input || '').trim()}
              className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 font-semibold"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
