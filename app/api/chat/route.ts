import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// Knowledge base for fallback responses when LLM cannot be reached (100% emoji-free)
const SAWAFLIX_KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['music', 'song', 'songs', 'listen', 'audio', 'makossa', 'bikutsi', 'afrobeats', 'sound'],
    answer: "**SawaFlix Music**\n\nExplore our catalog of Cameroonian and African sounds including Makossa, Bikutsi, Assiko, Hip-hop, and Gospel.\n\n- **Where to listen:** Open the Music section (`/dashboard/musicpage`) from your navigation bar.\n- **Audio Player:** Keep listening anywhere across the app with our persistent bottom player."
  },
  {
    keywords: ['reel', 'reels', 'tiktok', 'short', 'shorts', 'vertical', 'feed'],
    answer: "**SawaFlix Reels**\n\nOur interactive vertical short-video feed features humor, dance, music teasers, and cultural highlights.\n\n- **How to watch:** Go to the Reels tab (`/dashboard/reels`) to scroll through continuous vertical clips.\n- **Interactivity:** Like, comment, share, and follow your favorite creators directly from each reel."
  },
  {
    keywords: ['creator', 'upload', 'monetize', 'post video', 'publish', 'how to become a creator'],
    answer: "**Creator Program**\n\nSawaFlix offers a dedicated platform for filmmakers, musicians, and storytellers.\n\n- **How to apply:** Visit your profile or Creator Dashboard to apply for verification.\n- **Publishing:** Upload videos and music with custom thumbnails, descriptions, and categories.\n- **Reach:** Connect with an engaged global audience passionate about African cinema and culture."
  },
  {
    keywords: ['offline', 'download', 'pwa', 'install', 'app'],
    answer: "**Install SawaFlix PWA**\n\nSawaFlix is fully progressive and can be installed on your device without an app store download.\n\n- **Installation:** Tap 'Install App' from your browser banner or menu on Android, iOS, or desktop.\n- **Benefits:** Enjoy offline caching, fast load times, and instant notifications."
  },
  {
    keywords: ['notification', 'push', 'alert', 'subscribe', 'notifications'],
    answer: "**Push Notifications**\n\nStay informed about new film premieres, album drops, and cultural specials.\n\n- **How to enable:** Tap the notification bell icon or choose 'Enable' on the notification prompt.\n- **Device alerts:** Receive updates directly on your lock screen even when the app is closed."
  },
  {
    keywords: ['ngondo', 'culture', 'tradition', 'sawa', 'douala', 'wouri', 'heritage'],
    answer: "**Sawa Culture and Ngondo Festival**\n\nThe Sawa peoples represent the coastal communities of Cameroon across the River Wouri and Gulf of Guinea.\n\n- **The Ngondo Festival:** Held every December in Douala, featuring traditional canoe races, cultural assemblies, and underwater ancestral rites.\n- **Cultural Content:** SawaFlix curates documentaries and historical media documenting traditions, languages, and culinary heritage."
  },
  {
    keywords: ['contact', 'support', 'help', 'email', 'issue', 'problem'],
    answer: "**Support and Inquiries**\n\nOur team is available to assist you.\n\n- **Email:** Contact us at `admin@sawaflix.com`.\n- **Issues:** Report playback errors or account concerns through the contact section."
  },
  {
    keywords: ['what is sawaflix', 'about', 'who are you', 'tell me about', 'sawaflix'],
    answer: "**About SawaFlix**\n\nSawaFlix is Cameroon's streaming platform dedicated to celebrating Cameroonian and African cinema, music, short reels, and traditional cultural heritage.\n\n- **Movies and Series:** Classic and modern Cameroonian films.\n- **Music:** Curated Makossa, Bikutsi, and contemporary tracks.\n- **Reels:** Short-form interactive video entertainment.\n- **Creator Studio:** Publishing tools for artists and storytellers."
  }
];

function findFallbackAnswer(query: string): string {
  const normalized = query.toLowerCase();
  for (const item of SAWAFLIX_KNOWLEDGE) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item.answer;
    }
  }
  return "**Welcome to Sawai**\n\nI am your digital assistant for SawaFlix. Ask me about:\n\n- **Movies and Series:** Streaming recommendations and catalog navigation\n- **Music and Artists:** Discovering Makossa, Bikutsi, and Afrobeats\n- **Reels:** Browsing short videos\n- **Creator Hub:** Uploading and monetization\n- **App Features:** Installing the PWA and notifications";
}

const SYSTEM_PROMPT = `
You are Sawai, the official AI assistant for SawaFlix (sawaflix.com).
SawaFlix is Cameroon's premier streaming platform for cinema, music, short-form reels, and cultural storytelling.

Strict Behavioral Guidelines:
- Clean, concise, professional, and helpful tone.
- CRITICAL: DO NOT use emojis anywhere under any circumstances. Never output emoji symbols, pictograms, or smiles. Keep responses 100% emoji-free.
- Use clear, distinct paragraphs separated by blank lines.
- Format lists with markdown bullet points on new lines: "- **Heading:** Details".
- Avoid long unbroken walls of text. Be direct and easy to read.
- Guide users accurately to sections: Home, Movies, Music (/dashboard/musicpage), Reels (/dashboard/reels), and Creator Studio.
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
      console.warn("[Sawai] GEMINI_API_KEY not found in environment, using SawaFlix knowledge fallback.");
      const fallbackText = findFallbackAnswer(latestUserMessage);
      
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

      return result.toTextStreamResponse({
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (aiError: any) {
      console.error("[Sawai] Error calling Gemini 2.5 Flash API:", aiError?.message || aiError);
      
      // Graceful fallback to knowledge base if Gemini encounters quota, network or model errors
      const fallbackText = `${findFallbackAnswer(latestUserMessage)}\n\n*(Note: Live AI cloud is currently busy; answering from SawaFlix local knowledge cache).*`;
      
      return new Response(fallbackText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }
  } catch (error: any) {
    console.error("[Sawai] POST handler error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
