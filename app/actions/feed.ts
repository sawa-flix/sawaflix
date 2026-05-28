'use server';

import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/server';

const API_BASE_URL = BACKEND_URL || 'http://localhost:5000';

async function getAuthToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// Timeout fetch utility
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  videoUrl?: string;
  embedUrl?: string;
  likeCount?: string | number;
  viewCount?: string | number;
  origin: 'youtube' | 'sawaflix';
  tier?: 'personal' | 'regional' | 'trending' | 'discovery';
}

/**
 * Weighted Interleaving Scheduler
 */
export function interweaveFeedTiers(
  personal: FeedItem[],
  regional: FeedItem[],
  trending: FeedItem[],
  discovery: FeedItem[]
): FeedItem[] {
  const result: FeedItem[] = [];
  const seenIds = new Set<string>();

  const pushUnique = (item: FeedItem, tierName: 'personal' | 'regional' | 'trending' | 'discovery') => {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      result.push({ ...item, tier: tierName });
      return true;
    }
    return false;
  };

  const qPersonal = [...personal];
  const qRegional = [...regional];
  const qTrending = [...trending];
  const qDiscovery = [...discovery];

  const totalItemsAvailable = qPersonal.length + qRegional.length + qTrending.length + qDiscovery.length;
  let attempts = 0;

  while (
    (qPersonal.length > 0 || qRegional.length > 0 || qTrending.length > 0 || qDiscovery.length > 0) &&
    result.length < 50 &&
    attempts < totalItemsAvailable * 2
  ) {
    attempts++;
    const rand = Math.random() * 110; // Sum of weights = 50 + 30 + 20 + 10 = 110

    let chosenQueue: FeedItem[] | null = null;
    let chosenTier: 'personal' | 'regional' | 'trending' | 'discovery' | null = null;

    if (rand < 50) {
      chosenQueue = qPersonal;
      chosenTier = 'personal';
    } else if (rand < 80) {
      chosenQueue = qRegional;
      chosenTier = 'regional';
    } else if (rand < 100) {
      chosenQueue = qTrending;
      chosenTier = 'trending';
    } else {
      chosenQueue = qDiscovery;
      chosenTier = 'discovery';
    }

    // Fallback if the chosen queue is empty: check in order of weights
    if (!chosenQueue || chosenQueue.length === 0) {
      if (qPersonal.length > 0) {
        chosenQueue = qPersonal;
        chosenTier = 'personal';
      } else if (qRegional.length > 0) {
        chosenQueue = qRegional;
        chosenTier = 'regional';
      } else if (qTrending.length > 0) {
        chosenQueue = qTrending;
        chosenTier = 'trending';
      } else if (qDiscovery.length > 0) {
        chosenQueue = qDiscovery;
        chosenTier = 'discovery';
      }
    }

    if (chosenQueue && chosenQueue.length > 0 && chosenTier) {
      const item = chosenQueue.shift()!;
      pushUnique(item, chosenTier);
    }
  }

  return result;
}

/**
 * Server Action: Fetches all four home feed algorithm tiers from Render backend
 * and returns the interleaved, deduplicated collection.
 */
export async function getWeightedFeedAction(): Promise<{ data: FeedItem[] }> {
  try {
    const token = await getAuthToken();

    // Setup fetch headers
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    console.log('[Weighted Feed Action] Invoking concurrent tier requests to Render backend');

    // Concurrently trigger requests with graceful 404 fallbacks
    const [personalRes, regionalRes, trendingRes, discoveryRes] = await Promise.allSettled([
      fetchWithTimeout(`${API_BASE_URL}/api/content/personal`, { headers }),
      fetchWithTimeout(`${API_BASE_URL}/api/content/regional`, { headers }),
      fetchWithTimeout(`${API_BASE_URL}/api/content/trending`, { headers }),
      fetchWithTimeout(`${API_BASE_URL}/api/content/discoveries`, { headers })
    ]);

    const extractItems = async (result: PromiseSettledResult<Response>): Promise<FeedItem[]> => {
      if (result.status === 'fulfilled' && result.value.ok) {
        try {
          const json = await result.value.json();
          const list = json.data || json || [];
          return Array.isArray(list) ? list : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const personal = await extractItems(personalRes);
    const regional = await extractItems(regionalRes);
    const trending = await extractItems(trendingRes);
    const discovery = await extractItems(discoveryRes);

    console.log('[Weighted Feed Action] Raw counts -> Personal:', personal.length, 'Regional:', regional.length, 'Trending:', trending.length, 'Discovery:', discovery.length);

    // Dynamic fallback check: If all endpoints returned empty (e.g. backend endpoints still under construction / 404)
    if (personal.length === 0 && regional.length === 0 && trending.length === 0 && discovery.length === 0) {
      console.warn('[Weighted Feed Action] All multi-tier endpoints returned empty. Falling back to unified feed.');
      
      const unifiedFeedRes = await fetch(`${API_BASE_URL}/api/content/unified-feed`).catch(() => null);
      if (unifiedFeedRes && unifiedFeedRes.ok) {
        const json = await unifiedFeedRes.json();
        const sawaflix = json.data?.sawaflix || json.sawaflix || [];
        const youtube = json.data?.youtube || json.youtube || [];
        
        // Simulating the tiers using our unified feed
        const combined = [...sawaflix, ...youtube];
        const quarter = Math.ceil(combined.length / 4);
        
        const interleaved = interweaveFeedTiers(
          combined.slice(0, quarter),
          combined.slice(quarter, quarter * 2),
          combined.slice(quarter * 2, quarter * 3),
          combined.slice(quarter * 3)
        );

        return { data: interleaved };
      }
      
      // Secondary local fallback if backend is completely offline
      return { data: [] };
    }

    const interleaved = interweaveFeedTiers(personal, regional, trending, discovery);
    return { data: interleaved };

  } catch (error) {
    console.error('[Weighted Feed Action] Fatal error:', error);
    return { data: [] };
  }
}
