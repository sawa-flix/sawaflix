import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// High-density knowledge bank for accurate retrieval and zero-token waste
const KNOWLEDGE_TOPICS: { keywords: string[]; title: string; answer: string; contextSummary: string }[] = [
  {
    keywords: ['steal', 'reupload', 're-upload', 'youtube', 'tiktok', 'copyright', 'embed', 'rights', 'views', 'credit'],
    title: 'Content Discovery & Direct Embedding Policy',
    answer: "**Content Discovery and Embedding Policy**\n\nSawaFlix does not re-upload or steal content from creators.\n\n- **Direct Embeds:** All videos are embedded directly from the creator's official YouTube or TikTok channels.\n- **Creator Credit:** When users watch, like, or comment on SawaFlix, views and engagement metrics count directly on the creator's official channel.\n- **Purpose:** SawaFlix operates as a curated discovery engine to give African filmmakers and storytellers visibility without disconnecting them from their primary monetization platforms.",
    contextSummary: "SawaFlix embeds videos directly from creators' official YouTube/TikTok channels. Views, likes, and watch time count directly for the creator. No re-uploading or content theft occurs."
  },
  {
    keywords: ['seed', 'seed inc', 'parent', 'incubator', 'zigex', 'wakajob', 'ecosystem', 'innovatewithseed'],
    title: 'SEED Inc. Parent Incubator and Ecosystem',
    answer: "**SEED Inc. and the Innovation Ecosystem**\n\nSawaFlix was founded under **SEED Inc.** (Skill Enhancement and Empowerment Through Digitalization - `innovatewithseed.com`).\n\nSEED Inc. trains African software engineers and incubates transformative technology across core sectors:\n\n- **SawaFlix:** Cultural preservation and digital entertainment.\n- **Zigex:** Modern education and EdTech solutions.\n- **WakaJob:** Employment, talent, and workforce ecosystem.\n- **Other Tracks:** Artificial intelligence, fintech, IoT, and agritech.",
    contextSummary: "SawaFlix is a flagship product of SEED Inc. (innovatewithseed.com), alongside sister platforms Zigex (EdTech) and WakaJob (Employment). SEED trains African engineers and builds high-impact AI, fintech, and digital solutions."
  },
  {
    keywords: ['job', 'career', 'careers', 'hiring', 'join', 'developer', 'engineer', 'work at', 'apply for job'],
    title: 'Joining the SawaFlix & SEED Engineering Team',
    answer: "**Careers at SawaFlix & SEED Inc.**\n\nSawaFlix is engineered and maintained by Cameroonian software engineers and AI researchers trained under SEED Inc.\n\n- **Open Tracks:** Frontend & Mobile (Next.js, React Native, Tailwind CSS), Backend & Cloud (Node.js, Express, Supabase, PostgreSQL), AI & Recommendation Systems, and Creator Relations.\n- **How to Apply:** Send your CV and GitHub profile to `careers@innovatewithseed.com` or apply at `https://innovatewithseed.com/careers`.",
    contextSummary: "Engineered by Cameroonian talent trained by SEED Inc. Openings in Frontend, Backend, AI/RecSys, and Creator Relations. Apply via careers@innovatewithseed.com or innovatewithseed.com/careers."
  },
  {
    keywords: ['creator', 'verify', 'feature', 'upload', 'monetize', 'portal', 'partner', 'onboard'],
    title: 'Creator Program & Onboarding',
    answer: "**Creator Program and Verification**\n\nAfrican filmmakers, musicians, comedians, and cultural storytellers can feature their work on SawaFlix:\n\n- **Creator Portal:** Apply for verification at `https://sawaflix.com/creator/verify`.\n- **Email Onboarding:** Send your channel and portfolio links to `creators@sawaflix.com`.\n- **Curation:** The cultural team reviews channels to index content into dedicated categories with verified creator badges.",
    contextSummary: "Creators apply via https://sawaflix.com/creator/verify or email creators@sawaflix.com with channel links for curation and indexing."
  },
  {
    keywords: ['mission', 'vision', 'why', 'problem', 'heritage', 'erosion', 'lion', 'culture', 'tradition', 'storytelling'],
    title: 'Mission, Cultural Heritage & Philosophy',
    answer: "**Our Mission & Cultural Commitment**\n\nSawaFlix exists to protect Cameroonian and African heritage from cultural erosion caused by Western-biased recommendation algorithms.\n\n- **Our Core Philosophy:** *'Until the lion learns to write, every story will glorify the hunter. SawaFlix is the lion's pen.'*\n- **What We Protect:** Local languages, traditional rhythms (Makossa, Bikutsi, Assiko), folklore, coastal traditions like the Ngondo Festival, and indigenous cinema.",
    contextSummary: "Mission: Combat cultural erosion from foreign algorithms by championing Cameroonian heritage. Motto: 'Until the lion learns to write, every story will glorify the hunter. SawaFlix is the lion's pen.'"
  },
  {
    keywords: ['music', 'song', 'songs', 'listen', 'audio', 'makossa', 'bikutsi', 'assiko'],
    title: 'SawaFlix Music Streaming',
    answer: "**SawaFlix Music**\n\nExplore our curated catalog of Cameroonian and African sounds including Makossa, Bikutsi, Assiko, Hip-hop, and Gospel.\n\n- **Where to listen:** Open the Music section (`/dashboard/musicpage`).\n- **Persistent Player:** Seamless background playback across all pages.",
    contextSummary: "Curated Cameroonian music (Makossa, Bikutsi, Assiko, Hip-hop) available at /dashboard/musicpage with persistent audio player."
  },
  {
    keywords: ['reel', 'reels', 'short', 'shorts', 'vertical'],
    title: 'SawaFlix Interactive Reels',
    answer: "**SawaFlix Reels**\n\nInteractive vertical short-video feed showcasing African humor, dance, music teasers, and cultural highlights.\n\n- **Where to watch:** Navigate to Reels (`/dashboard/reels`).\n- **Interactions:** Like, share, comment, and follow creators directly.",
    contextSummary: "Vertical short-form feed at /dashboard/reels with live liking, commenting, sharing, and creator following."
  },
  {
    keywords: ['tv', 'livetv', 'channel', 'station', 'live tv', 'crtv', 'canal 2', 'equinoxe', 'my media prime'],
    title: 'Cameroon Live TV',
    answer: "**Cameroon Live TV**\n\nStream 15 official national and regional Cameroonian television stations in high definition.\n\n- **Channels:** CRTV, CRTV News, Canal 2 International, Equinoxe TV, My Media Prime, STV, Vision 4, Balafon TV, and more.\n- **Where to watch:** Visit Live TV (`/dashboard/livetv`).",
    contextSummary: "Live streams of 15 authentic Cameroonian broadcasters (CRTV News, Canal 2, Equinoxe, My Media Prime, Balafon, STV, Vision 4) at /dashboard/livetv."
  }
];

function retrieveRelevantContext(query: string): string {
  const normalized = query.toLowerCase();
  const matched = KNOWLEDGE_TOPICS.filter((topic) =>
    topic.keywords.some((kw) => normalized.includes(kw))
  );

  if (matched.length === 0) return '';

  return matched
    .map((t) => `[Verified Fact - ${t.title}]: ${t.contextSummary}`)
    .join('\n');
}

function findFallbackAnswer(query: string): string {
  const normalized = query.toLowerCase();
  for (const item of KNOWLEDGE_TOPICS) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item.answer;
    }
  }
  return "**Welcome to Sawai**\n\nI am your digital intelligence engine for SawaFlix. You can ask me about:\n\n- **Culture & Heritage:** Our mission to preserve Cameroonian storytelling.\n- **Content Policy:** How our YouTube/TikTok embedding supports creators.\n- **SEED Inc. Ecosystem:** Our parent incubator and sister platforms (Zigex, WakaJob).\n- **Creator Program:** How to verify and feature your channel.\n- **Careers:** How to join our engineering and creative team.\n- **Entertainment:** Movies, music, live TV, and vertical reels.";
}

// Ultra-dense, token-optimized system prompt (Zero emojis, high information density)
const BASE_SYSTEM_PROMPT = `
You are Sawai, the official AI assistant for SawaFlix (sawaflix.com).
SawaFlix is Cameroon's premier digital entertainment platform for cinema, music, short-form reels, live TV, and cultural storytelling.

Core Identity & Knowledge:
1. Origin & Ecosystem:
   - SawaFlix is a flagship product of SEED Inc. (Skill Enhancement and Empowerment Through Digitalization - innovatewithseed.com).
   - Sister products under SEED Inc.: Zigex (Education/EdTech) and WakaJob (Work/Employment/Talent).
   - Built and maintained by Cameroonian engineers and AI researchers trained by SEED Inc.
   - Careers: Apply via careers@innovatewithseed.com or innovatewithseed.com/careers. Open tracks: Frontend, Backend, AI/RecSys, and Creator Relations.

2. Content Discovery Engine & Zero-Theft Policy:
   - SawaFlix does NOT re-upload or steal content from YouTube or TikTok.
   - All videos are embedded directly from official creator channels.
   - Views, watch time, and engagement credit go directly to the creator's official account.
   - Creators can apply to be indexed via the Creator Portal (sawaflix.com/creator/verify) or creators@sawaflix.com.

3. Cultural Mission & Heritage:
   - Counters cultural erosion caused by foreign recommendation algorithms.
   - Philosophy: "Until the lion learns to write, every story will glorify the hunter. SawaFlix is the lion's pen."
   - Promotes Cameroonian traditions (Ngondo festival, coastal Sawa heritage), languages, cinema, and music (Makossa, Bikutsi, Assiko).

4. Platform Sections:
   - Movies: /dashboard/movie
   - Music: /dashboard/musicpage
   - Live TV: /dashboard/livetv (15 authentic Cameroonian broadcasters: CRTV, Canal 2, Equinoxe, My Media Prime, STV, Vision 4, etc.)
   - Reels: /dashboard/reels
   - Creator Studio: /creator-dashboard

Tone & Style Rules:
- Concise, clear, professional, authoritative, and direct.
- STRICT: Never use emojis under any circumstance. Keep responses 100% emoji-free.
- Use clean markdown with distinct paragraphs and bullet points.
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

    // Smart contextual retrieval: injects only matching facts without bloating context window
    const dynamicContext = retrieveRelevantContext(latestUserMessage);
    const enrichedSystemPrompt = dynamicContext
      ? `${BASE_SYSTEM_PROMPT}\n\nContextual Verified Facts for Current Query:\n${dynamicContext}`
      : BASE_SYSTEM_PROMPT;

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
        system: enrichedSystemPrompt,
        messages,
      });

      return result.toTextStreamResponse({
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (aiError: any) {
      console.error("[Sawai] Error calling Gemini 2.5 Flash API:", aiError?.message || aiError);
      
      const fallbackText = `${findFallbackAnswer(latestUserMessage)}\n\n*(Note: Live AI cloud is currently busy; answering from SawaFlix verified knowledge cache).*`;
      
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
