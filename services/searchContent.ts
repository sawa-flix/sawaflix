import { searchVideosAction } from '@/app/actions/youtube';

export async function searchContent(query, pageToken = null, maxResults = 20) {
  try {
    console.log('[searchContent] Searching for:', query, 'pageToken:', pageToken);
    
    const response = await searchVideosAction(query, pageToken, maxResults);
    
    console.log('[searchContent] Response:', response);
    
    return response;
  } catch (error) {
    console.error('Search service error:', error);
    return { items: [], error: error.message };
  }
}