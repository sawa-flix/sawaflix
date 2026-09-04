import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// Knowledge base for fallback responses when LLM cannot be reached
const SAWAFLIX_KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['music', 'song', 'songs', 'listen', 'audio', 'makossa', 'bikutsi', 'afrobeats', 'sound'],
    answer: "🎵 **SawaFlix Music** features an eclectic collection of Cameroonian and African sounds! You can explore Makossa, Bikutsi, Assiko, Hip-hop, and Gospel. Visit the **Music** page (/dashboard/musicpage) via the navigation bar to listen, play tracks using the persistent Bottom Player, and discover new artist releases."
  },
  {
    keywords: ['reel', 'reels', 'tiktok', 'short', 'shorts', 'vertical', 'feed'],
    answer: "📱 **SawaFlix Reels** is our interactive, vertical short-form video feed inspired by Cameroonian humor, street culture, dance challenges, and creative sketches. Head to the **Reels** tab (/dashboard/reels) in your navigation bar to scroll, like, share, and enjoy instant clips!"
  },
  {
    keywords: ['creator', 'upload', 'monetize', 'post video', 'publish', 'how to become a creator'],
    answer: "🌟 **Become a Creator on SawaFlix!** Anyone can apply to become a verified SawaFlix creator. Head to your profile or the Creator Dashboard to upload videos, track views, and share your storytelling with our growing global community."
  },
  {
    keywords: ['offline', 'download', 'pwa', 'install', 'app'],
    answer: "📲 **Install SawaFlix as a PWA!** SawaFlix works seamlessly as a progressive web app. Click 'Install App' in your browser or banner to install it on your Android, iOS, or desktop. It supports offline video caching, smooth background playback, and instant push notifications."
  },
  {
    keywords: ['notification', 'push', 'alert', 'subscribe', 'notifications'],
    answer: "🔔 **Push Notifications:** Stay on top of brand new movies, viral reels, and exclusive tracks by clicking the notification bell icon or tapping 'Enable' on the prompt. You'll get instant alerts directly on your device even when the app is closed!"
  },
  {
    keywords: ['ngondo', 'culture', 'tradition', 'sawa', 'douala', 'wouri', 'heritage'],
    answer: "🌊 **The Sawa Culture & Ngondo:** The Sawa peoples represent the coastal communities of Cameroon along the River Wouri and Gulf of Guinea. Ngondo is the sacred traditional water festival held every December in Douala, featuring canoe races, ancestral underwater communion, and vibrant celebrations."
  },
  {
    keywords: ['contact', 'support', 'help', 'email', 'issue', 'problem'],
    answer: "🤝 **Need Support?** Our team is here to assist! Reach out through our contact page or email us at `admin@sawaflix.com`. You can also report any video playback or account issues directly from the app."
  },
  {
    keywords: ['what is sawaflix', 'about', 'who are you', 'tell me about', 'sawaflix'],
    answer: "🎬 **SawaFlix** is Cameroon's premier digital streaming platform dedicated to celebrating Cameroonian culture, music, movies, short reels, and traditional heritage (like the historic Ngondo festival, Sawa heritage, Makossa, Bikutsi, and modern Afrobeats). You can watch full-length films, discover rising music stars, watch short-form reels, or register as a creator to publish your own content!"
  }
];

function findFallbackAnswer(query: string): string {
  const normalized = query.toLowerCase();
  for (const item of SAWAFLIX_KNOWLEDGE) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item.answer;
    }
  }
  return "🌟 **Welcome to SawaFlix Assistant!** SawaFlix is Cameroon's all-in-one platform for movies, music, reels, and rich cultural traditions. You can ask me about:\n- 🎬 **Movies & Series:** How to stream and find trending titles\n- 🎵 **Music & Artists:** Exploring Makossa, Bikutsi, and Afrobeats\n- 📱 **Reels:** Enjoying vertical short-form videos\n- 🚀 **Creator Hub:** Uploading and sharing your content\n- 🔔 **Notifications & PWA:** Installing the app and staying updated";
}

const SYSTEM_PROMPT = `
You are SawaBot, the friendly, witty, knowledgeable, and culturally proud AI assistant for SawaFlix (sawaflix.com).
SawaFlix is the premier African & Cameroonian streaming platform bringing together:
1. Cameroonian Cinema & Films (from classics to modern blockbusters).
2. Sawa Heritage & Culture (Ngondo water festival, Douala traditions, Wouri river, folklore, and local cuisine like Achu, Ndolé, Eru, and Koki).
3. Music Streaming (Makossa, Bikutsi, Assiko, Afrobeats, Gospel, Hip-Hop with legends like Manu Dibango, Eboa Lotin, Charlotte Dipanda, Petit Pays, and new wave artists).
4. Short-form Reels (TikTok-style dynamic feed featuring comedy, dance, and cultural highlights).
5. Creator Studio (a platform for African filmmakers, musicians, and storytellers to publish and monetize).

Personality & Tone:
- Warm, helpful, enthusiastic, and proud of Cameroonian and African heritage.
- Speak in natural, engaging English. You can sprinkle light, authentic Cameroonian expressions warmly when appropriate (e.g. "Mbote", "Welcome to the family", "No wahala!").
- Keep answers informative, concise, and beautifully formatted with markdown bullet points and emojis.
- Guide users on how to navigate the app: Home, Movies, Music (/dashboard/musicpage), Reels (/dashboard/reels), and Creator Studio.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const latestUserMessage = messages
      .slice()
      .reverse()
      .find((m: any) => m.role === 'user')?.content || '';

    // Check for Google Gemini API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.warn("[SawaBot] GEMINI_API_KEY not found in environment, using SawaFlix knowledge fallback.");
      const fallbackText = findFallbackAnswer(latestUserMessage);
      
      // Stream fallback response formatted for Vercel AI SDK
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(fallbackText)}\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vercel-AI-Data-Stream': 'v1',
        },
      });
    }

    // Initialize Google Gemini provider with gemini-2.5-flash
    const google = createGoogleGenerativeAI({
      apiKey,
    });

    try {
      const result = await streamText({
        model: google('gemini-2.5-flash'),
        system: SYSTEM_PROMPT,
        messages,
      });

      return result.toDataStreamResponse();
    } catch (aiError: any) {
      console.error("[SawaBot] Error calling Gemini 2.5 Flash API:", aiError?.message || aiError);
      
      // Graceful fallback to knowledge base if Gemini encounters quota, network or model errors
      const fallbackText = `${findFallbackAnswer(latestUserMessage)}\n\n*(Note: Live AI cloud is currently busy; answering from SawaFlix local knowledge cache).*`;
      
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(fallbackText)}\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vercel-AI-Data-Stream': 'v1',
        },
      });
    }
  } catch (error: any) {
    console.error("[SawaBot] POST handler error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
