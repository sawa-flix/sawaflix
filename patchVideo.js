process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'uwippvm9'
process.env.NEXT_PUBLIC_SANITY_DATASET = 'production'

import { getCliClient } from 'sanity/cli'

const client = getCliClient()

async function patch() {
  try {
    const res = await client
      .withConfig({ projectId: 'uwippvm9', dataset: 'production' })
      .patch('9a924fc3-f1f4-41f1-b0e7-5a5d96552d3a')
      .set({ videoUrl: 'https://xjxbjnjspmmpfngbdihd.supabase.co/storage/v1/object/public/videos/2ocSXkcoTQs.mp4' })
      .commit()
    
    console.log('✅ Successfully updated story: "Top 10 Afropop Hits to Watch This Season"')
    console.log('Video URL set to:', res.videoUrl)
  } catch (err) {
    console.error('❌ Update failed:', err.message)
  }
}

patch()
